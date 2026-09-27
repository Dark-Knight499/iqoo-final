import type { AudioRms } from '../server/contracts';
import { FFMPEG, streamProcess, writeResult } from '../server/media-runtime';

/** Decode mono 16 kHz PCM and retain only one 100 ms calculation window at a time. */
export async function analyzeAudioRms(videoPath: string, durationMs: number, signal?: AbortSignal): Promise<AudioRms> {
  const windowSamples = 1600;
  const windows: AudioRms['windows'] = [];
  let carry = Buffer.alloc(0); let sumSquares = 0; let count = 0; let sampleStart = 0;
  const emit = () => {
    if (!count) return;
    const startMs = Math.round(sampleStart * 1000 / 16000);
    const endMs = Math.min(durationMs, Math.round((sampleStart + count) * 1000 / 16000));
    if (endMs > startMs) windows.push({ startMs, endMs, rms: Math.sqrt(sumSquares / count) });
    sampleStart += count; count = 0; sumSquares = 0;
  };
  await streamProcess(FFMPEG, ['-v', 'error', '-i', videoPath, '-map', '0:a:0', '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', 'pipe:1'], (chunk) => {
    const data = carry.length ? Buffer.concat([carry, chunk]) : chunk;
    let offset = 0;
    while (offset + 4 <= data.length) {
      const sample = data.readFloatLE(offset); offset += 4;
      sumSquares += sample * sample; count++;
      if (count === windowSamples) emit();
    }
    carry = Buffer.from(data.subarray(offset));
  }, 900_000, signal);
  emit();
  return writeResult('audio_rms', { windows });
}
