import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAnalysis } from '../server/pipeline';

const videoPath = process.env.VIDEO_PATH
  ? path.resolve(process.env.VIDEO_PATH)
  : fileURLToPath(new URL('../demo_video/video_20260926_222804.mp4', import.meta.url));
const outputDirectory = path.resolve(process.env.ANALYSIS_OUTPUT_DIR || 'output', path.parse(videoPath).name.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'video');
const output = (name: string) => path.join(outputDirectory, `${name}.json`);
const expectedDemoShotCounts: Record<string, number> = {
  'video_20260926_222804.mp4': 1,
  'video_20260926_233851.mp4': 2,
  'video_20260927_003121.mp4': 4,
};

test('demo video produces documented static-analysis outputs', { timeout: 900_000 }, async () => {
  const statuses = await runAnalysis(videoPath, 5000, undefined, outputDirectory);
  console.log('Demo feature results:', statuses);
  assert.equal(statuses.length, 8, 'each documented feature reports an isolated result');
  for (const feature of ['video_metadata', 'audio_rms', 'silence', 'noise', 'shots', 'keyframes']) {
    assert.equal(statuses.find((row) => row.feature === feature)?.status, 'success', `${feature} succeeds`);
  }

  const metadata = JSON.parse(await readFile(output('video_metadata'), 'utf8'));
  assert.ok(metadata.width > 0 && metadata.height > 0);
  assert.ok(metadata.durationMs > 0);
  assert.ok(['landscape', 'portrait', 'square'].includes(metadata.orientation));
  if (!process.env.VIDEO_PATH) {
    assert.equal(metadata.width, 1920);
    assert.equal(metadata.height, 1080);
    assert.equal(metadata.orientation, 'landscape');
    assert.ok(metadata.durationMs > 15_000 && metadata.durationMs < 17_000);
    assert.equal(metadata.videoFormat, 'video/hevc');
    assert.equal(metadata.audioFormat, 'audio/mp4a-latm');
  }

  const rms = JSON.parse(await readFile(output('audio_rms'), 'utf8'));
  assert.ok(rms.windows.length > 0);
  assert.deepEqual(Object.keys(rms.windows[0]).sort(), ['endMs', 'rms', 'startMs']);
  assert.ok(rms.windows.every((window: any) => window.endMs > window.startMs && window.rms >= 0));

  const silence = JSON.parse(await readFile(output('silence'), 'utf8'));
  const noise = JSON.parse(await readFile(output('noise'), 'utf8'));
  assert.ok(Array.isArray(silence.intervals));
  assert.ok(noise.windows.every((window: any) => window.noiseRms === null || window.noiseRms >= 0));

  const shots = JSON.parse(await readFile(output('shots'), 'utf8'));
  const keyframes = JSON.parse(await readFile(output('keyframes'), 'utf8'));
  assert.ok(shots.shots.length > 0);
  const expectedShotCount = expectedDemoShotCounts[path.basename(videoPath)];
  if (expectedShotCount !== undefined) assert.equal(shots.shots.length, expectedShotCount, `${path.basename(videoPath)} shot count`);
  assert.ok(shots.shots.every((shot: any, index: number) => shot.id === index + 1 && shot.endMs > shot.startMs));
  assert.ok(keyframes.keyframes.every((frame: any) => Number.isFinite(frame.timestampMs) && !('image' in frame)));

  const transcriptStatus = statuses.find((row) => row.feature === 'transcript');
  if (transcriptStatus?.status === 'success') {
    const transcript = JSON.parse(await readFile(output('transcript'), 'utf8'));
    assert.ok(Array.isArray(transcript.segments));
    assert.ok(transcript.segments.every((segment: any) => segment.endMs > segment.startMs && Array.isArray(segment.words)));
    assert.ok(transcript.segments.flatMap((segment: any) => segment.words).every((word: any) => word.endMs >= word.startMs));
  } else {
    assert.match(transcriptStatus?.error ?? '', /Transcription unavailable|whisper\.cpp or ggml-small\.bin is unavailable/i);
  }

  const yoloStatus = statuses.find((row) => row.feature === 'yolo');
  if (yoloStatus?.status === 'success') {
    const yolo = JSON.parse(await readFile(output('yolo'), 'utf8'));
    assert.equal(yolo.sampleIntervalMs, 5000);
    assert.ok(yolo.detections.every((sample: any) => sample.endMs > sample.startMs && Array.isArray(sample.objects)));
    for (const object of yolo.detections.flatMap((sample: any) => sample.objects)) {
      assert.ok(object.box.x.x <= object.box.z.x);
      assert.ok(object.box.y.y <= object.box.x.y);
      assert.deepEqual(Object.keys(object.box), ['x', 'y', 'z', 't']);
    }
  } else {
    assert.ok(yoloStatus?.error, 'YOLO failure is reported without stopping other features');
  }
});
