import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

export const OUTPUT_DIR = path.resolve(process.env.ANALYSIS_OUTPUT_DIR || 'output');
const outputDirectory = new AsyncLocalStorage<string>();
export const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
export const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

export function withOutputDirectory<T>(directory: string, operation: () => Promise<T>): Promise<T> {
  return outputDirectory.run(path.resolve(directory), operation);
}

export function run(command: string, args: string[], options: { timeoutMs?: number; signal?: AbortSignal } = {}) {
  return new Promise<{ stdout: Buffer; stderr: string }>((resolve, reject) => {
    if (options.signal?.aborted) { reject(new Error('Analysis cancelled.')); return; }
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout: Buffer[] = []; const stderr: Buffer[] = [];
    let bytes = 0;
    const timeout = setTimeout(() => child.kill(), options.timeoutMs ?? 180_000);
    const abort = () => child.kill();
    options.signal?.addEventListener('abort', abort, { once: true });
    child.stdout.on('data', (chunk: Buffer) => { bytes += chunk.length; if (bytes > 300_000_000) child.kill(); else stdout.push(chunk); });
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.on('error', (error) => { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); reject(error); });
    child.on('close', (code) => {
      clearTimeout(timeout); options.signal?.removeEventListener('abort', abort);
      if (options.signal?.aborted) { reject(new Error('Analysis cancelled.')); return; }
      const errorText = Buffer.concat(stderr).toString('utf8').trim();
      if (code !== 0) reject(new Error(errorText || `${command} exited with code ${code}`));
      else resolve({ stdout: Buffer.concat(stdout), stderr: errorText });
    });
  });
}

export function streamProcess(command: string, args: string[], onChunk: (chunk: Buffer) => void, timeoutMs = 900_000, signal?: AbortSignal, onStderrChunk?: (chunk: Buffer) => void) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('Analysis cancelled.')); return; }
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: Buffer[] = []; let stderrBytes = 0; let callbackError: Error | undefined;
    const timeout = setTimeout(() => child.kill(), timeoutMs);
    const abort = () => child.kill();
    signal?.addEventListener('abort', abort, { once: true });
    child.stdout.on('data', (chunk: Buffer) => {
      if (callbackError) return;
      try { onChunk(chunk); } catch (error) { callbackError = error instanceof Error ? error : new Error(String(error)); child.kill(); }
    });
    child.stderr.on('data', (chunk: Buffer) => {
      if (onStderrChunk && !callbackError) {
        try { onStderrChunk(chunk); } catch (error) { callbackError = error instanceof Error ? error : new Error(String(error)); child.kill(); }
      }
      if (stderrBytes < 64_000) { stderr.push(chunk); stderrBytes += chunk.length; }
    });
    child.on('error', (error) => { clearTimeout(timeout); signal?.removeEventListener('abort', abort); reject(error); });
    child.on('close', (code) => {
      clearTimeout(timeout); signal?.removeEventListener('abort', abort);
      if (signal?.aborted) { reject(new Error('Analysis cancelled.')); return; }
      if (callbackError) reject(callbackError);
      else if (code !== 0) reject(new Error(Buffer.concat(stderr).toString('utf8').trim() || `${command} exited with code ${code}`));
      else resolve();
    });
  });
}

export async function writeResult<T>(name: string, data: T): Promise<T> {
  const directory = outputDirectory.getStore() ?? OUTPUT_DIR;
  await mkdir(directory, { recursive: true });
  const destination = path.join(directory, `${name}.json`);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(temporary, destination);
  return data;
}

export async function resetOutputFiles() {
  const directory = outputDirectory.getStore() ?? OUTPUT_DIR;
  await mkdir(directory, { recursive: true });
  await Promise.all(['video_metadata.json', 'transcript.json', 'audio_rms.json', 'silence.json', 'noise.json', 'shots.json', 'keyframes.json', 'yolo.json'].map((name) => rm(path.join(directory, name), { force: true })));
}
