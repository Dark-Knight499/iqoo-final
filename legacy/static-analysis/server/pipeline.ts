import type { AudioRms, FeatureName, FeatureStatus } from '../src/static-analysis/contracts';
import { analyzeVideoMetadata } from '../static-analysis/video_metadata';
import { transcribeVideo } from '../static-analysis/transcription';
import { analyzeAudioRms } from '../static-analysis/rms';
import { analyzeSilence } from '../static-analysis/silence';
import { analyzeNoise } from '../static-analysis/noise';
import { analyzeShots } from '../static-analysis/shots';
import { analyzeYoloObjects } from '../static-analysis/yolo';
import { OUTPUT_DIR, resetOutputFiles, withOutputDirectory, writeResult } from './media-runtime';

export async function runAnalysis(videoPath: string, sampleIntervalMs: number, signal?: AbortSignal, outputDirectory = OUTPUT_DIR): Promise<FeatureStatus[]> {
  return withOutputDirectory(outputDirectory, async () => {
  await resetOutputFiles();
  const statuses: FeatureStatus[] = [];
  const execute = async (feature: FeatureName, operation: () => Promise<unknown>) => {
    if (signal?.aborted) throw new Error('Analysis cancelled.');
    try { await operation(); statuses.push({ feature, status: 'success' }); }
    catch (error) {
      if (signal?.aborted) throw error;
      statuses.push({ feature, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    }
  };

  if (signal?.aborted) throw new Error('Analysis cancelled.');
  const metadata = await analyzeVideoMetadata(videoPath, signal).then((value) => {
    statuses.push({ feature: 'video_metadata', status: 'success' }); return value;
  }).catch((error) => {
    if (signal?.aborted) throw error;
    statuses.push({ feature: 'video_metadata', status: 'failed', error: error instanceof Error ? error.message : String(error) });
    return null;
  });
  if (!metadata) {
    const error = 'Skipped because video metadata and duration could not be read.';
    statuses.push(
      { feature: 'audio_rms', status: 'failed', error },
      { feature: 'silence', status: 'failed', error },
      { feature: 'noise', status: 'failed', error },
      { feature: 'transcript', status: 'failed', error },
      { feature: 'shots', status: 'failed', error },
      { feature: 'keyframes', status: 'failed', error },
      { feature: 'yolo', status: 'failed', error },
    );
    return statuses;
  }

  const durationMs = metadata.result.durationMs ?? 0;
  if (metadata.hasAudio) {
    let rms: AudioRms | undefined;
    try {
      rms = await analyzeAudioRms(videoPath, durationMs, signal);
      statuses.push({ feature: 'audio_rms', status: 'success' });
    } catch (error) {
      if (signal?.aborted) throw error;
      statuses.push({ feature: 'audio_rms', status: 'failed', error: String(error) });
    }
    if (rms) {
      await execute('silence', () => analyzeSilence(rms!));
      await execute('noise', () => analyzeNoise(rms!, durationMs));
    } else {
      statuses.push({ feature: 'silence', status: 'failed', error: 'RMS analysis failed.' }, { feature: 'noise', status: 'failed', error: 'RMS analysis failed.' });
    }
    await execute('transcript', () => transcribeVideo(videoPath, durationMs, signal));
  } else {
    await writeResult('audio_rms', { windows: [] }); statuses.push({ feature: 'audio_rms', status: 'success' });
    await writeResult('silence', { intervals: [] }); statuses.push({ feature: 'silence', status: 'success' });
    await writeResult('noise', { windows: [] }); statuses.push({ feature: 'noise', status: 'success' });
    statuses.push({ feature: 'transcript', status: 'failed', error: 'The selected video has no audio track.' });
  }

  try {
    await analyzeShots(videoPath, durationMs, signal);
    statuses.push({ feature: 'shots', status: 'success' }, { feature: 'keyframes', status: 'success' });
  } catch (error) {
    if (signal?.aborted) throw error;
    statuses.push({ feature: 'shots', status: 'failed', error: String(error) }, { feature: 'keyframes', status: 'failed', error: 'Shot analysis failed.' });
  }
  await execute('yolo', () => analyzeYoloObjects(videoPath, durationMs, sampleIntervalMs, signal));
  return statuses;
  });
}
