/**
 * Creator AI Studio - Frontend API Client
 * Seamlessly connects to FastAPI backend at port 8000 via Vite proxy (/api),
 * with resilient offline fallback to local Snapdragon NPU mock fixtures.
 */

export interface HealthResponse {
  status: string;
  service: string;
  npu_engine: string;
  openai_connected: boolean;
  version: string;
}

export interface AgentDiffAction {
  id: string;
  type: 'trim' | 'zoom' | 'reframe' | 'caption_style' | 'music_duck' | 'split' | 'camera_angle' | 'color_grade';
  description: string;
  timestamp: number;
  duration?: number;
  confidence?: number;
  status: 'proposed' | 'accepted' | 'rejected';
}

export interface AgentChatResponse {
  reply: string;
  diff_actions: AgentDiffAction[];
  npu_confidence: number;
  is_real_ai: boolean;
}

export interface PipelineStep {
  id: string;
  name: string;
  model: string;
  hardware: string;
  status: string;
  progress: number;
  latency_ms: number;
  output_summary: string;
}

export interface PipelineResponse {
  project_id: string;
  is_complete: boolean;
  overall_progress: number;
  hardware_acceleration: string;
  steps: PipelineStep[];
}

export interface RepurposeShort {
  id: string;
  title: string;
  hook_score: number;
  hook_sentence: string;
  target_audience: string;
  duration_seconds: number;
  aspect_ratio: string;
  style_badge: string;
  caption_preset: string;
  tags: string[];
  cut_timestamps: string;
}

export interface RepurposePackage {
  project_id?: string;
  shorts: RepurposeShort[];
  youtube_chapters: { time: string; title: string; description: string }[];
  social_posts: {
    instagram_caption: string;
    twitter_thread: string[];
    tiktok_sound_hook: string;
  };
  thumbnail_concepts: { headline: string; visual_prompt: string; emotion_cue: string }[];
}

export interface World3DObject {
  id: string;
  name: string;
  category: string;
  confidence: number;
  depth_meters: number;
  position: { x: number; y: number; z: number };
  is_focused?: boolean;
}

export interface World3DScene {
  project_id?: string;
  environment: string;
  lighting_condition: string;
  objects: World3DObject[];
  camera_presets: { id: string; name: string; description: string; fov: number }[];
  depth_layers: string[];
  active_camera?: string;
}

export interface OfficeKitStatus {
  device_name: string;
  laptop_connected: boolean;
  connection_mode: string;
  latency_ms: number;
  scrub_position: number;
  active_tool: string;
  battery_level: number;
  npu_temperature_c: number;
}

// Fallback Mock Data
const MOCK_PIPELINE: PipelineStep[] = [
  {
    id: 'step_1_asr',
    name: 'Speech Recognition & Timestamps',
    model: 'Whisper On-Device Int8',
    hardware: 'Snapdragon NPU (45 TOPS)',
    status: 'completed',
    progress: 100,
    latency_ms: 28.4,
    output_summary: '1,420 words indexed with millisecond timestamps and sentiment tagging.',
  },
  {
    id: 'step_2_vision',
    name: 'Object Segmentation & Tracking',
    model: 'YOLO-Spatial NPU',
    hardware: 'Snapdragon NPU',
    status: 'completed',
    progress: 100,
    latency_ms: 16.2,
    output_summary: '4 persistent entities: Creator, iQOO Phone, Mechanical Keyboard, Studio Mic.',
  },
  {
    id: 'step_3_scene_graph',
    name: '3D Spatial NeRF Scene Graph',
    model: 'Depth-AnyScene Graph',
    hardware: 'Hexagon DSP + Adreno GPU',
    status: 'completed',
    progress: 100,
    latency_ms: 42.1,
    output_summary: '3D spatial coordinate mesh generated with 4 virtual camera angles.',
  },
  {
    id: 'step_4_silence',
    name: 'Silence & Filler Word Removal',
    model: 'VoiceClean V2',
    hardware: 'Snapdragon NPU',
    status: 'completed',
    progress: 100,
    latency_ms: 12.8,
    output_summary: '4.2 seconds dead air pruned across 3 segments.',
  },
];

class ApiClient {
  private isOnline: boolean | null = null;

  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        this.isOnline = true;
        return data;
      }
    } catch {
      // Backend offline or timeout
    }
    this.isOnline = false;
    return {
      status: 'local_fallback',
      service: 'Creator AI Studio (Local Engine)',
      npu_engine: 'Hexagon NPU Simulation (45 TOPS)',
      openai_connected: false,
      version: '1.2.0-offline',
    };
  }

  async getPipeline(projectId: string = 'proj_iqoo_perf'): Promise<PipelineResponse> {
    try {
      const res = await fetch(`/api/pipeline/${projectId}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}

    return {
      project_id: projectId,
      is_complete: true,
      overall_progress: 100,
      hardware_acceleration: 'Snapdragon NPU (45 TOPS)',
      steps: MOCK_PIPELINE,
    };
  }

  async chatWithAgent(projectId: string, prompt: string): Promise<AgentChatResponse> {
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, prompt }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback response
    return {
      reply: `I analyzed your timeline for "${prompt}". Proposed cuts to dead air and framed camera to subject.`,
      diff_actions: [
        {
          id: `act_${Date.now()}_1`,
          type: 'trim',
          description: 'Cut 1.4s dead pause to boost hook retention rate',
          timestamp: 11.2,
          duration: 1.4,
          confidence: 0.98,
          status: 'proposed',
        },
        {
          id: `act_${Date.now()}_2`,
          type: 'reframe',
          description: 'Dynamic zoom (1.15x) on product reveal for visual punch',
          timestamp: 14.8,
          duration: 3.2,
          confidence: 0.95,
          status: 'proposed',
        },
        {
          id: `act_${Date.now()}_3`,
          type: 'caption_style',
          description: 'Highlight key punchline in Amber bold font',
          timestamp: 22.0,
          confidence: 0.97,
          status: 'proposed',
        },
      ],
      npu_confidence: 0.96,
      is_real_ai: false,
    };
  }

  async getRepurposePackage(projectId: string = 'proj_iqoo_perf'): Promise<RepurposePackage> {
    try {
      const res = await fetch(`/api/repurpose/${projectId}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}

    return {
      shorts: [
        {
          id: 'short_1',
          title: 'The Phone That Replaces Cloud AI',
          hook_score: 98,
          hook_sentence: '"Cloud AI might not be the future of your smartphone."',
          target_audience: 'Tech Creators & Mobile Engineers',
          duration_seconds: 28.5,
          aspect_ratio: '9:16',
          style_badge: 'Viral Top 1%',
          caption_preset: 'Bold Amber Pop',
          tags: ['#iQOO13', '#LocalAI', '#Snapdragon8Elite'],
          cut_timestamps: '0:00 - 0:28.5',
        },
        {
          id: 'short_2',
          title: '45 TOPS NPU In Your Pocket',
          hook_score: 94,
          hook_sentence: '"How 45 TOPS of on-device inference changes video editing."',
          target_audience: 'Hardware Geeks',
          duration_seconds: 42.0,
          aspect_ratio: '9:16',
          style_badge: 'High Energy',
          caption_preset: 'SubRip Clean',
          tags: ['#TechReview', '#MobileNPU'],
          cut_timestamps: '0:29 - 1:11.0',
        },
      ],
      youtube_chapters: [
        { time: '0:00', title: 'Hook & Hardware Design', description: 'Chassis, display, and thermal specs' },
        { time: '0:45', title: 'Snapdragon 8 Elite NPU Architecture', description: '45 TOPS Hexagon DSP benchmark' },
        { time: '1:30', title: 'Real-time 3D Spatial Reconstruction', description: 'Virtual camera tracking live' },
      ],
      social_posts: {
        instagram_caption: 'Mobile video creation just changed forever. 45 TOPS on-device NPU handles 4K real-time editing without a cloud roundtrip. Link in bio! 🚀',
        twitter_thread: [
          '1/4 Cloud AI might no longer be the future of mobile creation.',
          '2/4 With Snapdragon 8 Elite, 45 TOPS NPU runs real-time speech transcription & 3D NeRF tracking in under 160ms.',
          '3/4 The Office Kit jog wheel syncs at <2.4ms latency over Wi-Fi 7 Direct.',
          '4/4 Full review blueprint live in iQOO Creator Studio.',
        ],
        tiktok_sound_hook: 'Cyberpunk bass drop at 0:03 hook point',
      },
      thumbnail_concepts: [
        { headline: 'THE DEATH OF CLOUD AI?', visual_prompt: 'Close-up of phone with holographic glowing timeline', emotion_cue: 'Awe / Shock' },
      ],
    };
  }

  async getWorldScene(projectId: string = 'proj_iqoo_perf'): Promise<World3DScene> {
    try {
      const res = await fetch(`/api/world3d/${projectId}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return await res.json();
    } catch {}

    return {
      environment: 'Creator Studio Desk with Amber Neon Edge Accent',
      lighting_condition: 'Key Light 450 lux + Amber Rim Light',
      objects: [
        { id: 'obj_1', name: 'Creator (Hero Speaker)', category: 'Person', confidence: 0.99, depth_meters: 1.2, position: { x: 0, y: 0.2, z: 1.2 }, is_focused: true },
        { id: 'obj_2', name: 'iQOO 13 Ultra Chassis', category: 'Device', confidence: 0.98, depth_meters: 0.6, position: { x: -0.2, y: -0.1, z: 0.6 } },
        { id: 'obj_3', name: 'Studio Shure Mic', category: 'Audio', confidence: 0.97, depth_meters: 0.8, position: { x: 0.3, y: 0.0, z: 0.8 } },
        { id: 'obj_4', name: 'Laptop Workstation (Office Kit)', category: 'Workspace', confidence: 0.95, depth_meters: 1.8, position: { x: 0.5, y: 0.3, z: 1.8 } },
      ],
      camera_presets: [
        { id: 'cam_wide', name: 'Wide Master Shot (16:9)', description: 'Full view of creator and desk', fov: 78.0 },
        { id: 'cam_close', name: 'Tight Subject Push-in', description: 'Focused on creator expression', fov: 45.0 },
        { id: 'cam_product', name: 'Macro Product Showcase', description: 'Hero close-up on phone display', fov: 32.0 },
        { id: 'cam_top', name: 'Overhead Desk Angle', description: 'Top-down view of workflow setup', fov: 85.0 },
      ],
      depth_layers: ['Foreground (0.5m - 0.8m)', 'Subject Plane (1.0m - 1.5m)', 'Background Studio (2.0m+)'],
      active_camera: 'cam_wide',
    };
  }

  async getOfficeKitStatus(): Promise<OfficeKitStatus> {
    try {
      const res = await fetch('/api/officekit/status', { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {}

    return {
      device_name: 'iQOO 13 Ultra (Snapdragon 8 Elite)',
      laptop_connected: true,
      connection_mode: 'Wi-Fi 7 Direct (<2.4ms)',
      latency_ms: 2.4,
      scrub_position: 14.5,
      active_tool: 'Precision Jog Wheel',
      battery_level: 88,
      npu_temperature_c: 34.2,
    };
  }

  async updateScrub(timestamp: number): Promise<{ status: string; scrub_position: number }> {
    try {
      const res = await fetch('/api/officekit/scrub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'synced_local', scrub_position: timestamp };
  }
}

export const apiClient = new ApiClient();
