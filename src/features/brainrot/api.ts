// Client for the optional local short-video render engine (MoneyPrinterTurbo).
// Vite forwards this prefix to the engine; see the `/mpt` proxy in vite.config.ts.
const API_BASE = import.meta.env.VITE_MPT_API_BASE_URL || '/mpt';

export interface MptMaterial {
  name: string;
  size: number;
  file: string;
}

export interface MptVideoParams {
  video_subject: string;
  video_script?: string;
  video_source: string;
  video_materials: { provider: string; url: string; duration: number }[];
  video_aspect: string;
  video_count: number;
  video_clip_duration: number;
  voice_name: string;
  subtitle_enabled: boolean;
  subtitle_position: string;
  font_name: string;
  bgm_type: string;
  n_threads: number;
}

export interface MptTask {
  task_id: string;
  state: number;
  progress: number;
  videos?: string[];
  combined_videos?: string[];
  failed_stage?: string;
  error?: string;
  [key: string]: unknown;
}

export const TASK_STATE_FAILED = -1;
export const TASK_STATE_COMPLETE = 1;

interface Envelope<T> {
  status: number;
  data?: T;
  message?: string;
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 60_000): Promise<T> {
  const isForm = init?.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(isForm || !init?.body ? {} : { 'Content-Type': 'application/json' }),
        ...init?.headers,
      },
      signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error('The short-video engine took too long to respond. Please try again.');
    }
    throw new Error('Could not reach the local short-video engine. Start it and retry.');
  }

  if (!response.ok) {
    let detail = `Engine request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (typeof payload.detail === 'string') detail = payload.detail;
      else if (typeof payload.message === 'string') detail = payload.message;
    } catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const brainrotEngine = {
  // GET /ping returns the literal string "pong".
  isOnline: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/ping`, { signal: AbortSignal.timeout(5_000) });
      return response.ok && (await response.text()).includes('pong');
    } catch {
      return false;
    }
  },

  listMaterials: async (): Promise<MptMaterial[]> => {
    const payload = await request<Envelope<{ files: MptMaterial[] }>>('/api/v1/video_materials');
    return payload.data?.files ?? [];
  },

  uploadMaterial: async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);
    const payload = await request<Envelope<{ file: string }>>(
      '/api/v1/video_materials',
      { method: 'POST', body },
      300_000,
    );
    if (!payload.data?.file) throw new Error('The engine did not accept that file.');
    return payload.data.file;
  },

  createShort: async (params: MptVideoParams): Promise<string> => {
    const payload = await request<Envelope<{ task_id: string }>>('/api/v1/videos', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (!payload.data?.task_id) throw new Error('The engine did not return a task id.');
    return payload.data.task_id;
  },

  getTask: async (taskId: string): Promise<MptTask> => {
    const payload = await request<Envelope<MptTask>>(
      `/api/v1/tasks/${encodeURIComponent(taskId)}`,
      undefined,
      20_000,
    );
    if (!payload.data) throw new Error('Task not found.');
    return payload.data;
  },

  mediaUrl: (path: string): string => (path.startsWith('http') ? path : `${API_BASE}${path}`),
};
