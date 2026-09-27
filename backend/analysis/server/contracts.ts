export type VideoMetadata = {
  durationMs: number | null; width: number | null; height: number | null; fps: number | null;
  orientation: 'portrait' | 'landscape' | 'square' | null; rotation: number | null;
  videoFormat: string | null; audioFormat: string | null;
};
export type TranscriptWord = { word: string; startMs: number; endMs: number };
export type TranscriptSegment = { startMs: number; endMs: number; text: string; words: TranscriptWord[] };
export type Transcript = { language?: string | null; segments: TranscriptSegment[] };
export type AudioRms = { windows: Array<{ startMs: number; endMs: number; rms: number }> };
export type Silence = { intervals: Array<{ startMs: number; endMs: number }> };
export type Noise = { windows: Array<{ startMs: number; endMs: number; noiseRms: number | null }> };
export type Shots = { shots: Array<{ id: number; startMs: number; endMs: number }> };
export type Keyframes = { keyframes: Array<{ shotId: number; timestampMs: number }> };
export type Point = { x: number; y: number };
export type YoloObject = { name: string; confidence: number; box: { x: Point; y: Point; z: Point; t: Point } };
export type Yolo = { sampleIntervalMs: number; sampleCount?: number; detections: Array<{ startMs: number; endMs: number; objects: YoloObject[] }> };
export type FeatureName = 'video_metadata' | 'transcript' | 'audio_rms' | 'silence' | 'noise' | 'shots' | 'keyframes' | 'yolo';
export type FeatureStatus = { feature: FeatureName; status: 'success' | 'failed' | 'partial' | 'unavailable'; error?: string };
