// Same-origin in development; Vite forwards this prefix to the optional intelligence service.
const API_BASE = import.meta.env.VITE_LEGACY_API_BASE_URL || '/legacy';

export type IntelligencePlatform = 'youtube' | 'instagram' | 'linkedin' | 'x_twitter';

export interface IntelligenceRequest {
  creator_name: string;
  niche?: string;
  causes_or_topics?: string[];
  language?: string;
  location?: string;
  platforms: IntelligencePlatform[];
  platform_handles?: Partial<Record<IntelligencePlatform, string>>;
  goals?: Record<string, string>;
  generate_platform_md?: boolean;
  generate_user_hook_md?: boolean;
}

export interface IntelligenceTrendItem {
  rank: number;
  title: string;
  url?: string | null;
  platform: string;
  content_type: string;
  views_or_engagement?: string | null;
  published_date?: string | null;
  creator_handle?: string | null;
  why_trending?: string | null;
  relevance_to_niche?: string | null;
  suggested_angle?: string | null;
  hashtags: string[];
  thumbnail_url?: string | null;
}

export interface IntelligenceCreatorProfile {
  platform: string;
  handle: string;
  profile_url: string;
  display_name?: string | null;
  bio?: string | null;
  follower_or_sub_count?: string | null;
  following_count?: string | null;
  total_posts_or_videos?: string | null;
  verified: boolean;
  recent_content: Record<string, unknown>[];
  growth_gap_analysis?: string | null;
}

export interface PlatformTrendsBlock {
  platform: string;
  goal?: string | null;
  creator_profile?: IntelligenceCreatorProfile | null;
  domain_trends: IntelligenceTrendItem[];
  location_trends: IntelligenceTrendItem[];
  global_trends: IntelligenceTrendItem[];
  hashtag_trends: string[];
  content_strategy?: string | null;
  platform_md_path?: string | null;
}

export interface IntelligenceResponse {
  creator_name: string;
  niche: string;
  location: string;
  analyzed_at: string;
  platforms_analyzed: string[];
  creator_profiles: Record<string, IntelligenceCreatorProfile>;
  platform_trends: PlatformTrendsBlock[];
  top_recommendations: {
    platform: string;
    content_type: string;
    topic: string;
    hook: string;
    why_now: string;
    estimated_reach?: string | null;
    hashtags: string[];
    best_posting_time?: string | null;
  }[];
  platform_md_files: Record<string, string>;
  detected_language?: string | null;
  identified_domain?: string | null;
  domain_profile?: Record<string, unknown> | null;
  user_md_path?: string | null;
  hook_md_path?: string | null;
  creator_comparison_md_path?: string | null;
  domain_top_creators: Record<string, unknown>[];
  domain_leader_comparisons: Record<string, unknown>[];
  trending_keywords: string[];
  summary?: string | null;
}

export interface ViralClip {
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
  visual_assessment?: {
    visual_hook_score: number;
    facial_expression: string;
    face_crop_center_x: number;
    active_speaker_identified: boolean;
    visual_hook_summary: string;
    keyframe_timestamp?: number | null;
  } | null;
  recommended_aspect_ratio: string;
}

export interface ClipAnalysisResponse {
  status: string;
  video_title: string;
  video_duration: string;
  source_type: string;
  signals_used: string[];
  on_device_model: string;
  total_candidates_analyzed: number;
  top_viral_clips: ViralClip[];
}

export interface PublishResponse {
  status: string;
  message: string;
  job: {
    job_id: string;
    status: string;
    platform: string;
    content_format: string;
    published_url?: string | null;
    composio_execution_status?: string | null;
  };
}

export interface ProfilingRequest {
  creator_name: string;
  youtube_handle_or_url?: string;
  substack_handle_or_url?: string;
  twitter_handle_or_url?: string;
  linkedin_handle_or_url?: string;
  custom_instructions?: string;
  max_videos_to_analyze?: number;
  max_articles_to_analyze?: number;
}

export interface ProfilingAnalysis {
  tone: {
    primary_tone: string;
    energy_level: string;
    pacing: string;
    vocabulary_style: string;
    audience_relationship: string;
    key_descriptors: string[];
  };
  video_length: {
    average_duration_seconds: number;
    average_duration_formatted: string;
    shorts_ratio_percentage: number;
    long_form_ratio_percentage: number;
    recommended_duration_range: string;
    pacing_breakdown: string;
  };
  video_types: string[];
  thumbnail_strategy: {
    visual_style: string;
    facial_expression_patterns: string;
    color_palette_dominance: string[];
    text_density: string;
    curiosity_gap_tactics: string[];
  };
  frequent_spoken_phrases: {
    phrase: string;
    count: number;
    category: string;
    sample_context: string;
  }[];
  post_formats: string[];
  core_themes: string[];
  content_strengths: string[];
}

export interface ProfilingResponse {
  status: string;
  creator_name: string;
  creator_slug: string;
  analyzed_at: string;
  platforms_ingested: string[];
  catalog_summary: Record<string, number>;
  analysis: ProfilingAnalysis;
  user_md: string;
  hook_md: string;
  file_paths: Record<string, string>;
}

export interface PlatformMetric {
  platform: string;
  connected: boolean;
  handle_or_name: string;
  followers_or_subscribers: number;
  total_views_or_impressions: number;
  total_content_pieces: number;
  avg_engagement_rate_percent: number;
  growth_rate_30d_percent: number;
  recent_performance: string;
  top_content: Record<string, unknown>[];
}

export interface DashboardResponse {
  creator_name: string;
  timeframe: string;
  overall_reach: number;
  overall_engagement_rate: number;
  platforms: Record<string, PlatformMetric>;
  app_platform_metrics: {
    total_scripts_generated: number;
    total_hooks_created: number;
    pending_approval_posts: number;
    approved_posts: number;
    published_via_composio: number;
    publishing_success_rate: number;
  };
  charts: Record<string, unknown>;
  creator_activity?: Record<string, unknown>;
  executive_summary: string;
  key_recommendations: string[];
}

export interface TrendItem {
  rank: number;
  title: string;
  traffic_volume: string;
  source: string;
  category: string;
  published_or_trending_since: string;
  news_headlines: string[];
  relevance_to_creator: string;
  hook_angles: string[];
}

export interface TrendsResponse {
  creator_name: string | null;
  domain: string;
  geo: string;
  fetched_at: string;
  youtube_trending?: Record<string, unknown>[];
  instagram_trending?: Record<string, unknown>[];
  linkedin_trending?: Record<string, unknown>[];
  x_twitter_trending?: Record<string, unknown>[];
  trending_keywords?: string[];
  velocity_topics?: Record<string, unknown>[];
  niche_trends: TrendItem[];
  world_trends: TrendItem[];
  viral_formats: {
    format_name: string;
    virality_score: number;
    ideal_length: string;
    platform_fit: string[];
    why_it_works: string;
    structure_template: string;
  }[];
  content_opportunity_matrix: {
    topic: string;
    opportunity_score: string;
    recommended_angle: string;
    suggested_platforms: string[];
  }[];
}

export function mapProfileResponseToCreatorUpdate(profile: ProfilingResponse) {
  const analysis = profile.analysis;
  const tone = analysis.tone;
  const phrases = analysis.frequent_spoken_phrases;
  const hookBlocks = [...profile.hook_md.matchAll(/### Archetype [A-Z]:\s*(.+?)\n([\s\S]*?)(?=\n### Archetype|\n---|$)/g)];
  const parsedHooks = hookBlocks.map(([block, title], index) => {
    const template = block.match(/- \*\*Template\*\*: \*([\s\S]*?)\*/)?.[1];
    return {
      id: `profile-hook-${index + 1}`,
      title: title.trim(),
      example: template || analysis.post_formats[index] || 'Generated from your analyzed content.',
    };
  });

  return {
    name: profile.creator_name,
    niche: profile.analysis.core_themes[0] || 'Creator profile',
    dna: {
      voice: `${tone.primary_tone}. ${tone.energy_level}`,
      tone: tone.key_descriptors.length ? tone.key_descriptors : [tone.primary_tone],
      frequentPhrases: phrases.map((phrase) => phrase.phrase),
      avgVideoLength: analysis.video_length.average_duration_formatted,
      hookStyle: phrases.find((phrase) => phrase.category === 'greeting')?.phrase || phrases[0]?.phrase || 'See the generated hook profile.',
      coreThemes: analysis.core_themes,
      thumbnailStyle: analysis.thumbnail_strategy.visual_style,
    },
    hookPatterns: parsedHooks.length
      ? parsedHooks
      : analysis.post_formats.map((format, index) => ({
          id: `profile-format-${index + 1}`,
          title: format,
          example: 'Format identified in your creator profile.',
        })),
    connectedSources: profile.platforms_ingested,
    profileDocuments: {
      creatorSlug: profile.creator_slug,
      analyzedAt: profile.analyzed_at,
      userMd: profile.user_md,
      hookMd: profile.hook_md,
      catalogSummary: profile.catalog_summary,
      analysis: profile.analysis,
    },
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      signal: init?.signal ?? AbortSignal.timeout(90_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('The backend took too long to respond. Please try again.');
    }
    throw new Error('Could not reach the Creator AI backend. Check that it is running and try again.');
  }

  if (!response.ok) {
    if (response.status >= 500) throw new Error('Intelligence service unavailable or failed. Start the optional service on port 8001, then retry.');
    let detail = `Backend request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (typeof payload.detail === 'string') detail = payload.detail;
      else if (Array.isArray(payload.detail)) {
        detail = payload.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(' ');
      }
    } catch {
      // Keep the status-based message when the error response is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const legacyBackend = {
  profile: (payload: ProfilingRequest) =>
    request<ProfilingResponse>('/profiling', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: (slug: string) =>
    request<Pick<ProfilingResponse, 'creator_slug' | 'user_md' | 'hook_md'>>(
      `/profiling/${encodeURIComponent(slug)}`
    ),

  getDashboard: (creatorName: string, timeframe = '30d') =>
    request<DashboardResponse>(
      `/dashboard?creator_name=${encodeURIComponent(creatorName)}&timeframe=${encodeURIComponent(timeframe)}`
    ),

  getTrends: (domain: string, geo = 'US', limit = 8, creatorName?: string) => {
    const query = new URLSearchParams({ domain, geo, limit: String(limit) });
    if (creatorName) query.set('creator_name', creatorName);
    return request<TrendsResponse>(`/trends?${query.toString()}`);
  },

  runIntelligence: (payload: IntelligenceRequest) =>
    request<IntelligenceResponse>('/intelligence', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeVideo: (videoUrl: string, creatorName: string) =>
    request<ClipAnalysisResponse>('/clipping/analyze', {
      method: 'POST',
      body: JSON.stringify({
        video_url: videoUrl,
        creator_name: creatorName,
        target_duration_seconds: 45,
        min_virality_score: 70,
        max_clips: 5,
        use_on_device_smolvlm: true,
      }),
    }),

  sendClipToPublish: (clip: ViralClip, creatorId: string) =>
    request<PublishResponse>('/clipping/to-publish', {
      method: 'POST',
      body: JSON.stringify({
        clip,
        creator_id: creatorId,
        platform: 'youtube',
        require_human_approval: true,
      }),
    }),
};
