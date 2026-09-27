export type StaticFeatureName =
  | 'video_metadata'
  | 'transcript'
  | 'audio_rms'
  | 'silence'
  | 'noise'
  | 'shots'
  | 'keyframes'
  | 'yolo';

export interface StaticFeatureStatus {
  feature: StaticFeatureName;
  status: 'success' | 'failed' | 'partial';
  error?: string;
}

export interface VideoMetadata {
  durationMs: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  orientation: 'portrait' | 'landscape' | 'square' | null;
  rotation: number | null;
  videoFormat: string | null;
  audioFormat: string | null;
}

export interface TranscriptArtifact {
  language?: string | null;
  segments: Array<{
    startMs: number;
    endMs: number;
    text: string;
    words: Array<{ word: string; startMs: number; endMs: number }>;
  }>;
}

export interface StaticAnalysisArtifacts {
  video_metadata?: VideoMetadata;
  transcript?: TranscriptArtifact;
  audio_rms?: { windows: Array<{ startMs: number; endMs: number; rms: number }> };
  silence?: { intervals: Array<{ startMs: number; endMs: number }> };
  noise?: { windows: Array<{ startMs: number; endMs: number; noiseRms: number | null }> };
  shots?: { shots: Array<{ id: number; startMs: number; endMs: number }> };
  keyframes?: { keyframes: Array<{ shotId: number; timestampMs: number }> };
  yolo?: {
    sampleIntervalMs: number;
    detections: Array<{
      startMs: number;
      endMs: number;
      objects: Array<{ name: string; confidence: number }>;
    }>;
  };
}

export interface StaticAnalysisResult {
  outputFolder: string;
  features: StaticFeatureStatus[];
  artifacts: StaticAnalysisArtifacts;
}

interface AnalyzeResponse {
  features?: StaticFeatureStatus[];
  outputFolder?: string;
  error?: string;
}

interface OutputFile {
  name: string;
  url: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body.error === 'string' ? body.error : `Analyzer request failed (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

export async function runStaticAnalysis(file: File, signal?: AbortSignal): Promise<StaticAnalysisResult> {
  const form = new FormData();
  form.append('video', file, file.name);
  form.append('sampleIntervalMs', '2000');

  const response = await fetch('/api/analyze', { method: 'POST', body: form, signal });
  const run = await parseResponse<AnalyzeResponse>(response);
  if (!run.outputFolder) throw new Error('Analyzer returned no output folder.');

  const outputResponse = await fetch(`/api/outputs/${encodeURIComponent(run.outputFolder)}`, { signal });
  const outputs = await parseResponse<OutputFile[]>(outputResponse);
  const artifacts: StaticAnalysisArtifacts = {};
  await Promise.all(outputs.map(async (output) => {
    const artifactResponse = await fetch(output.url, { signal });
    const data = await parseResponse<unknown>(artifactResponse);
    const key = output.name.replace(/\.json$/i, '') as keyof StaticAnalysisArtifacts;
    if (key in artifacts || [
      'video_metadata', 'transcript', 'audio_rms', 'silence', 'noise', 'shots', 'keyframes', 'yolo',
    ].includes(key)) {
      (artifacts as Record<string, unknown>)[key] = data;
    }
  }));

  return { outputFolder: run.outputFolder, features: run.features ?? [], artifacts };
}

export function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDuration(milliseconds: number | null | undefined): string {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return 'Unknown duration';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
