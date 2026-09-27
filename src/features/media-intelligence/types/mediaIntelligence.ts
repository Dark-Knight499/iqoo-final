export type MediaType = 'video' | 'audio' | 'image';

export type MediaIntelligenceScreenId =
  | 'import'
  | 'analysis'
  | 'ml-analysis'
  | 'llm-understanding'
  | 'suggestions'
  | 'suggestion-preview'
  | 'catalog'
  | 'content-detail';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  duration: string;
  resolution?: string;
  fps?: number;
  size?: string;
  thumbnail: string;
  previewUrl?: string;
  sourceUrl?: string;
  analyzedAt?: string;
}

export type AnalysisStageId =
  | 'metadata'
  | 'audio'
  | 'transcript'
  | 'scenes'
  | 'speakers'
  | 'objects'
  | 'topics'
  | 'moments'
  | 'style'
  | 'opportunities';

export interface AnalysisStage {
  id: AnalysisStageId;
  label: string;
  completed: boolean;
  active: boolean;
  status?: 'pending' | 'success' | 'partial' | 'failed';
  message?: string;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string;
  text: string;
  speaker?: string;
}

export interface SceneData {
  id: string;
  sceneNumber: string;
  timestampRange: string;
  visualType: string;
  location: string;
  description: string;
}

export interface MetricSummary {
  duration: string;
  scenesCount: number;
  speakersCount: number;
  objectsCount: number;
  topicsCount: number;
  momentsCount: number;
}

export interface LLMUnderstandingData {
  summary: string;
  keyThemes: string[];
  contentStructure: string[];
  creatorStyle: string[];
}

export type SuggestionType = 'hook' | 'short' | 'opportunity' | 'broll';

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  tag: string;
  title: string;
  timestampRange?: string;
  quote?: string;
  reason: string;
  actionLabel: string;
  secondaryActionLabel?: string;
  approved?: boolean;
  plan?: string[];
  relevanceScore?: number;
  backendClip?: any;
}
