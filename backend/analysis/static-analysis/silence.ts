import type { AudioRms, Silence } from '../server/contracts';
import { writeResult } from '../server/media-runtime';

export async function analyzeSilence(rms: AudioRms, threshold = Number(process.env.SILENCE_THRESHOLD ?? 0.01), minimumMs = Number(process.env.MIN_SILENCE_MS ?? 300)): Promise<Silence> {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new Error('Silence threshold must be between 0 and 1.');
  if (!Number.isFinite(minimumMs) || minimumMs < 0) throw new Error('Minimum silence duration must be a non-negative number of milliseconds.');
  const intervals: Silence['intervals'] = [];
  let startMs: number | undefined; let endMs = 0;
  for (const window of rms.windows) {
    if (window.rms < threshold) { startMs ??= window.startMs; endMs = window.endMs; }
    else if (startMs !== undefined) {
      if (endMs - startMs >= minimumMs) intervals.push({ startMs, endMs });
      startMs = undefined;
    }
  }
  if (startMs !== undefined && endMs - startMs >= minimumMs) intervals.push({ startMs, endMs });
  return writeResult('silence', { intervals });
}
