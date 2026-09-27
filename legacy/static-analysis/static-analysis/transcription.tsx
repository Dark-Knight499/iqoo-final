import { existsSync } from 'node:fs';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { FFMPEG, run, writeResult } from '../server/media-runtime';

type WhisperToken = { text?: string; offsets?: { from?: number; to?: number } };
type WhisperJson = { transcription?: Array<{ text?: string; offsets?: { from?: number; to?: number }; tokens?: WhisperToken[] }> };
type Chunk = { path: string; startMs: number };

const FASTER_WHISPER_SCRIPT = String.raw`
import json, os, sys
from faster_whisper import WhisperModel

model_name, chunks_path = sys.argv[1], sys.argv[2]
model = WhisperModel(
    model_name,
    device=os.environ.get("WHISPER_DEVICE", "cpu"),
    compute_type=os.environ.get("WHISPER_COMPUTE_TYPE", "int8"),
)
chunks = json.load(open(chunks_path, encoding="utf-8"))
segments_out = []
language = None
for chunk in chunks:
    rows, info = model.transcribe(chunk["path"], word_timestamps=True, beam_size=5)
    language = language or info.language
    for row in rows:
        offset = chunk["startMs"] / 1000
        words = []
        for word in row.words or []:
            words.append({
                "word": word.word.strip(),
                "startMs": round((offset + word.start) * 1000),
                "endMs": round((offset + word.end) * 1000),
            })
        segments_out.append({
            "startMs": round((offset + row.start) * 1000),
            "endMs": round((offset + row.end) * 1000),
            "text": row.text.strip(),
            "words": words,
        })
print(json.dumps({"language": language, "segments": segments_out}))
`;

function pythonExecutable() {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;
  const virtualenvPython = path.resolve('.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  return existsSync(virtualenvPython) ? virtualenvPython : process.platform === 'win32' ? 'python' : 'python3';
}

/** Transcribe 30-second PCM chunks and rebase segment/word timestamps to the video. */
export async function transcribeVideo(videoPath: string, durationMs: number, signal?: AbortSignal) {
  const bundledCli = path.resolve('tools/whisper/Release/whisper-cli.exe');
  const bundledModel = path.resolve('models/ggml-small.bin');
  const cli = process.env.WHISPER_CLI || (existsSync(bundledCli) ? bundledCli : undefined);
  const model = process.env.WHISPER_MODEL || (existsSync(bundledModel) ? bundledModel : undefined);
  const useWhisperCpp = Boolean(cli && model);
  if (useWhisperCpp) await access(model!);

  const workspace = await mkdtemp(path.join(os.tmpdir(), 'creator-whisper-'));
  try {
    const chunks: Chunk[] = [];
    for (let chunkStartMs = 0, chunkIndex = 0; chunkStartMs < durationMs; chunkStartMs += 30_000, chunkIndex++) {
      const chunkPath = path.join(workspace, `chunk-${chunkIndex}.wav`);
      await run(FFMPEG, ['-v', 'error', '-ss', (chunkStartMs / 1000).toFixed(3), '-i', videoPath, '-t', '30', '-map', '0:a:0', '-vn', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', '-y', chunkPath], { signal });
      chunks.push({ path: chunkPath, startMs: chunkStartMs });
    }

    if (useWhisperCpp) {
      const segments: Array<{ startMs: number; endMs: number; text: string; words: Array<{ word: string; startMs: number; endMs: number }> }> = [];
      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];
        const outputBase = path.join(workspace, `transcript-${index}`);
        await run(cli!, ['-m', model!, '-f', chunk.path, '-ml', '1', '-ojf', '-of', outputBase, '-np'], { timeoutMs: 900_000, signal });
        const raw = JSON.parse(await readFile(`${outputBase}.json`, 'utf8')) as WhisperJson;
        for (const row of raw.transcription ?? []) {
          const rawStart = Number(row.offsets?.from ?? 0); const rawEnd = Number(row.offsets?.to ?? rawStart);
          const startMs = chunk.startMs + rawStart; const endMs = Math.min(durationMs, chunk.startMs + rawEnd);
          const words: Array<{ word: string; startMs: number; endMs: number }> = [];
          let current = ''; let wordStart = startMs; let wordEnd = startMs;
          const flush = () => {
            const word = current.trim();
            if (word) words.push({ word, startMs: wordStart, endMs: Math.max(wordStart, wordEnd) });
            current = '';
          };
          for (const token of row.tokens ?? []) {
            const value = token.text ?? '';
            if (!value || /^\[?_/.test(value) || /^<.*>$/.test(value)) continue;
            const tokenStart = chunk.startMs + Number(token.offsets?.from ?? rawStart);
            const tokenEnd = Math.min(durationMs, chunk.startMs + Number(token.offsets?.to ?? rawEnd));
            if (/^\s/.test(value) && current) flush();
            if (!current) wordStart = tokenStart;
            current += value; wordEnd = tokenEnd;
          }
          flush();
          const text = (row.text ?? words.map((word) => word.word).join(' ')).trim();
          if (endMs > startMs && text) segments.push({ startMs, endMs, text, words });
        }
      }
      return writeResult('transcript', { segments });
    }

    const chunksPath = path.join(workspace, 'chunks.json');
    const scriptPath = path.join(workspace, 'transcribe.py');
    await writeFile(chunksPath, JSON.stringify(chunks), 'utf8');
    await writeFile(scriptPath, FASTER_WHISPER_SCRIPT, 'utf8');
    const fasterModel = process.env.FASTER_WHISPER_MODEL || 'base';
    let stdout: Buffer;
    try {
      ({ stdout } = await run(pythonExecutable(), [scriptPath, fasterModel, chunksPath], { timeoutMs: 900_000, signal }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Transcription unavailable. Run npm run setup:python or configure WHISPER_CLI and WHISPER_MODEL. ${detail}`);
    }
    const result = JSON.parse(stdout.toString('utf8')) as { language?: string | null; segments: Array<{ startMs: number; endMs: number; text: string; words: Array<{ word: string; startMs: number; endMs: number }> }> };
    const segments = result.segments
      .map((segment) => ({ ...segment, startMs: Math.max(0, segment.startMs), endMs: Math.min(durationMs, segment.endMs), words: segment.words.filter((word) => word.word) }))
      .filter((segment) => segment.endMs > segment.startMs && segment.text);
    return writeResult('transcript', { language: result.language ?? null, segments });
  } finally { await rm(workspace, { recursive: true, force: true }); }
}
