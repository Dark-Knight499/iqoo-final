import type { Keyframes, Shots } from '../server/contracts';
import { FFMPEG, streamProcess, writeResult } from '../server/media-runtime';
import { selectSharpestTimestamp } from './keyframes';

function laplacianVariance(frame: Buffer, width: number, height: number) {
  let sum = 0; let sumSquares = 0; let count = 0;
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    const at = y * width + x;
    const laplacian = frame[at - width] + frame[at + width] + frame[at - 1] + frame[at + 1] - 4 * frame[at];
    sum += laplacian; sumSquares += laplacian * laplacian; count++;
  }
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/** Decode frames incrementally; FFmpeg scene scores find cuts while grayscale frames select keyframe timestamps. */
export async function analyzeShots(videoPath: string, durationMs: number, signal?: AbortSignal): Promise<{ shots: Shots; keyframes: Keyframes }> {
  const width = 160; const height = 90; const frameBytes = width * height;
  const sampleIntervalMs = Number(process.env.SHOT_SAMPLE_INTERVAL_MS ?? 33);
  if (!Number.isSafeInteger(sampleIntervalMs) || sampleIntervalMs < 33 || sampleIntervalMs > 5000) {
    throw new Error('Shot sample interval must be an integer between 33 and 5000 milliseconds.');
  }
  const shots: Shots['shots'] = []; const keyframes: Keyframes['keyframes'] = [];
  let pending = Buffer.alloc(0); let stderrPending = '';
  const samples: Array<{ timestampMs: number; sharpness: number }> = [];
  const cutTimes: number[] = []; let nextSample = 0; let nextCut = 0;
  let frameIndex = 0; let shotStart = 0; let bestCandidate: { timestampMs: number; sharpness: number } | undefined;
  const threshold = Number(process.env.SHOT_DIFF_THRESHOLD ?? 0.30);
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) throw new Error('Shot difference threshold must be greater than 0 and at most 1.');
  // FFmpeg scdet scores are calibrated so the documented 0.30 threshold maps to a score of 10.
  const scdetThreshold = threshold * (10 / 0.30);
  const cutMergeWindowMs = 400;
  let lastCutMs = Number.NEGATIVE_INFINITY;
  const processStderr = (chunk: Buffer) => {
    stderrPending += chunk.toString('utf8');
    let newline: number;
    while ((newline = stderrPending.indexOf('\n')) >= 0) {
      const line = stderrPending.slice(0, newline); stderrPending = stderrPending.slice(newline + 1);
      const match = /lavfi\.scd\.score:\s*([\d.]+),\s*lavfi\.scd\.time:\s*([\d.]+)/.exec(line);
      if (match && Number(match[1]) >= scdetThreshold) cutTimes.push(Math.round(Number(match[2]) * 1000));
    }
  };
  const processSample = (sample: { timestampMs: number; sharpness: number }) => {
    while (nextCut < cutTimes.length && cutTimes[nextCut] <= sample.timestampMs + sampleIntervalMs / 2) {
      const boundaryMs = sample.timestampMs;
      if (boundaryMs > shotStart && boundaryMs - lastCutMs >= cutMergeWindowMs) {
        const shotId = shots.length + 1;
        shots.push({ id: shotId, startMs: shotStart, endMs: boundaryMs });
        if (bestCandidate) keyframes.push({ shotId, timestampMs: bestCandidate.timestampMs });
        shotStart = boundaryMs; bestCandidate = undefined; lastCutMs = boundaryMs;
      }
      nextCut++;
    }
    bestCandidate = selectSharpestTimestamp(bestCandidate, sample);
  };
  const flushSamples = (throughMs: number) => {
    while (nextSample < samples.length && samples[nextSample].timestampMs <= throughMs) processSample(samples[nextSample++]);
    if (nextSample > 256) { samples.splice(0, nextSample); nextSample = 0; }
  };
  const processFrame = (frame: Buffer) => {
    const timestampMs = frameIndex * sampleIntervalMs;
    samples.push({ timestampMs, sharpness: laplacianVariance(frame, width, height) });
    frameIndex++;
    // Allow the scdet stderr event for this frame to arrive before committing its shot boundary.
    flushSamples(timestampMs - 250);
  };
  const sampleRate = (1000 / sampleIntervalMs).toFixed(3);
  // The fps filter already controls output cadence. Avoid -fps_mode, which is
  // unavailable in FFmpeg 4.x commonly shipped by desktop Linux distributions.
  await streamProcess(FFMPEG, ['-v', 'info', '-i', videoPath, '-vf', `fps=${sampleRate},scdet=threshold=${scdetThreshold.toFixed(3)},scale=160:90:force_original_aspect_ratio=decrease,pad=160:90:(ow-iw)/2:(oh-ih)/2,format=gray`, '-vsync', '0', '-f', 'rawvideo', 'pipe:1'], (chunk) => {
    const data = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    let offset = 0;
    while (offset + frameBytes <= data.length) { processFrame(data.subarray(offset, offset + frameBytes)); offset += frameBytes; }
    pending = Buffer.from(data.subarray(offset));
  }, 900_000, signal, processStderr);
  if (stderrPending) processStderr(Buffer.from('\n'));
  flushSamples(Number.POSITIVE_INFINITY);
  if (shotStart < durationMs) {
    const id = shots.length + 1;
    shots.push({ id, startMs: shotStart, endMs: durationMs });
    if (bestCandidate) keyframes.push({ shotId: id, timestampMs: bestCandidate.timestampMs });
  }
  return {
    shots: await writeResult('shots', { shots }),
    keyframes: await writeResult('keyframes', { keyframes }),
  };
}
