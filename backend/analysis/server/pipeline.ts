import type { AudioRms, FeatureName, FeatureStatus } from './contracts';
import { analyzeVideoMetadata } from '../static-analysis/video_metadata';
import { transcribeVideo } from '../static-analysis/transcription';
import { analyzeAudioRms } from '../static-analysis/rms';
import { analyzeSilence } from '../static-analysis/silence';
import { analyzeNoise } from '../static-analysis/noise';
import { analyzeShots } from '../static-analysis/shots';
import { analyzeYoloObjects } from '../static-analysis/yolo';
import { OUTPUT_DIR, resetOutputFiles, withOutputDirectory } from './media-runtime';

export const FEATURE_ORDER: FeatureName[] = ['video_metadata', 'audio_rms', 'silence', 'noise', 'transcript', 'shots', 'keyframes', 'yolo'];

export type AnalysisProgress = { statuses: FeatureStatus[]; running: FeatureName | null };

const message = (error: unknown) => error instanceof Error ? error.message : String(error);

/**
 * Run each feature independently. A failed optional feature is recorded and later features continue.
 * `onProgress` receives a snapshot after every state change so callers can report truthful progress.
 */
export async function runAnalysis(
  videoPath: string,
  sampleIntervalMs: number,
  signal?: AbortSignal,
  outputDirectory = OUTPUT_DIR,
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<FeatureStatus[]> {
  return withOutputDirectory(outputDirectory, async () => {
    await resetOutputFiles();
    const statuses: FeatureStatus[] = [];
    const report = (running: FeatureName | null) => onProgress?.({ statuses: statuses.map((status) => ({ ...status })), running });
    const record = (...rows: FeatureStatus[]) => { statuses.push(...rows); report(null); };
    const begin = (feature: FeatureName) => {
      if (signal?.aborted) throw new Error('Analysis cancelled.');
      report(feature);
    };
    const execute = async (feature: FeatureName, operation: () => Promise<unknown>) => {
      begin(feature);
      try { await operation(); record({ feature, status: 'success' }); }
      catch (error) {
        if (signal?.aborted) throw error;
        record({ feature, status: 'failed', error: message(error) });
      }
    };

    begin('video_metadata');
    const metadata = await analyzeVideoMetadata(videoPath, signal).catch((error) => {
      if (signal?.aborted) throw error;
      record({ feature: 'video_metadata', status: 'failed', error: message(error) });
      return null;
    });
    if (!metadata) {
      const error = 'Skipped because video metadata and duration could not be read.';
      record(...FEATURE_ORDER.slice(1).map((feature) => ({ feature, status: 'unavailable' as const, error })));
      return statuses;
    }
    record({ feature: 'video_metadata', status: 'success' });

    const durationMs = metadata.result.durationMs ?? 0;
    if (metadata.hasAudio) {
      let rms: AudioRms | undefined;
      begin('audio_rms');
      try {
        rms = await analyzeAudioRms(videoPath, durationMs, signal);
        record({ feature: 'audio_rms', status: 'success' });
      } catch (error) {
        if (signal?.aborted) throw error;
        record({ feature: 'audio_rms', status: 'failed', error: message(error) });
      }
      if (rms) {
        await execute('silence', () => analyzeSilence(rms!));
        await execute('noise', () => analyzeNoise(rms!, durationMs));
      } else {
        record({ feature: 'silence', status: 'unavailable', error: 'Audio level analysis failed.' }, { feature: 'noise', status: 'unavailable', error: 'Audio level analysis failed.' });
      }
      await execute('transcript', () => transcribeVideo(videoPath, durationMs, signal));
    } else {
      const error = 'The selected video has no audio track.';
      record(...(['audio_rms', 'silence', 'noise', 'transcript'] as FeatureName[]).map((feature) => ({ feature, status: 'unavailable' as const, error })));
    }

    begin('shots');
    try {
      await analyzeShots(videoPath, durationMs, signal);
      record({ feature: 'shots', status: 'success' }, { feature: 'keyframes', status: 'success' });
    } catch (error) {
      if (signal?.aborted) throw error;
      record({ feature: 'shots', status: 'failed', error: message(error) }, { feature: 'keyframes', status: 'unavailable', error: 'Shot analysis failed.' });
    }
    await execute('yolo', () => analyzeYoloObjects(videoPath, durationMs, sampleIntervalMs, signal));
    return statuses;
  });
}
