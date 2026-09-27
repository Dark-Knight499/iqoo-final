import type { AudioRms, Noise } from '../src/static-analysis/contracts';
import { writeResult } from '../server/media-runtime';

/** Estimate background RMS from the quietest 10% in each second. */
export async function analyzeNoise(rms: AudioRms, durationMs: number): Promise<Noise> {
  const windows: Noise['windows'] = [];
  let cursor = 0;
  for (let startMs = 0; startMs < durationMs; startMs += 1000) {
    const endMs = Math.min(startMs + 1000, durationMs);
    while (cursor < rms.windows.length && rms.windows[cursor].endMs <= startMs) cursor++;
    const values: number[] = [];
    for (let index = cursor; index < rms.windows.length && rms.windows[index].startMs < endMs; index++) {
      if (rms.windows[index].endMs > startMs) values.push(rms.windows[index].rms);
    }
    values.sort((a, b) => a - b);
    if (!values.length) { windows.push({ startMs, endMs, noiseRms: null }); continue; }
    const quieter = values.slice(0, Math.max(1, Math.ceil(values.length * 0.1)));
    const middle = Math.floor(quieter.length / 2);
    const noiseRms = quieter.length % 2 ? quieter[middle] : (quieter[middle - 1] + quieter[middle]) / 2;
    windows.push({ startMs, endMs, noiseRms });
  }
  return writeResult('noise', { windows });
}
