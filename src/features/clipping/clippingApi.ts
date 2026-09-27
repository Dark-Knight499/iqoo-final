export interface ClipVisualAssessment {
  visual_hook_score: number;
  facial_expression: string;
  face_crop_center_x: number;
  active_speaker_identified: boolean;
  visual_hook_summary: string;
  keyframe_timestamp?: number | null;
}

export interface ClipSuggestion {
  clip_id: string;
  rank: number;
  start_time: string;
  end_time: string;
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  virality_score: number;
  hook_line: string;
  why_viral: string;
  suggested_title: string;
  suggested_caption: string;
  hashtags: string[];
  transcript_snippet: string;
  visual_assessment: ClipVisualAssessment;
  recommended_aspect_ratio: string;
}

export interface ClipAnalysis {
  status: string;
  video_title: string;
  video_duration: string;
  source_type: 'local_file';
  signals_used: string[];
  analysis_model: string;
  total_candidates_analyzed: number;
  top_viral_clips: ClipSuggestion[];
}

export interface OpenAIStatus {
  configured: boolean;
  provider: string;
  model: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Clipping service returned an invalid response (${response.status}).`);
  }
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' && 'detail' in payload
      ? String((payload as { detail: unknown }).detail)
      : `Clipping request failed (${response.status}).`;
    throw new Error(detail);
  }
  return payload as T;
}

export const clippingApi = {
  async getOpenAIStatus(): Promise<OpenAIStatus> {
    const response = await fetch('/legacy/clipping/status', { signal: AbortSignal.timeout(4000) });
    return parseResponse<OpenAIStatus>(response);
  },

  async analyzeLocal(file: File, targetDuration: number, maxClips: number): Promise<ClipAnalysis> {
    const form = new FormData();
    form.append('file', file);
    form.append('target_duration_seconds', String(targetDuration));
    form.append('max_clips', String(maxClips));
    const response = await fetch('/legacy/clipping/analyze-file', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });
    return parseResponse<ClipAnalysis>(response);
  },

  async downloadClip(file: File, startSeconds: number, endSeconds: number): Promise<Blob> {
    const form = new FormData();
    form.append('file', file);
    form.append('start_seconds', String(startSeconds));
    form.append('end_seconds', String(endSeconds));
    const response = await fetch('/legacy/clipping/render-file', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });
    if (!response.ok) await parseResponse<unknown>(response);
    return response.blob();
  },
};
