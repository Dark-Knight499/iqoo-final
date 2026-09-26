export type Region = 'foryou' | 'global' | 'india' | 'hyderabad' | 'myniche';
export type DiscoveryTab = 'creators' | 'videos' | 'reels' | 'topics';
export type ContentType = 'video' | 'reel' | 'post';
export type GenerateContentType = 'short-video' | 'reel' | 'youtube-video' | 'linkedin-post' | 'podcast' | 'thread';
export type GenerateDuration = '30s' | '60s' | '90s' | 'custom';
export type GenerateTone = 'educational' | 'energetic' | 'cinematic' | 'conversational' | 'creator-style';
export type GenerateTab = 'copilot' | 'final';

export interface Trend {
  id: string;
  title: string;
  description: string;
  region: Region[];
  category: string;
  growth: number;
  relatedContentIds: string[];
  relatedTopics: string[];
  postCount: number;
}

export interface DiscoverCreator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: string;
  followers: string;
  growth: string;
  niche: string;
  region: Region[];
  verified: boolean;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  platform: string;
  thumbnail: string;
  views: string;
  engagement: string;
  publishedAt: string;
  topics: string[];
  trendScore: number;
  region: Region[];
  duration?: string;
  description?: string;
  whyTrending?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  contentCount: number;
  growth: number;
  region: Region[];
}

export interface StoryboardItem {
  id: string;
  contentId: string;
  addedAt: number;
  note?: string;
}

export interface Scene {
  id: string;
  label: string;
  duration: string;
  visual: string;
  dialogue: string;
  camera: string;
  movement: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  hook: string;
  coreMessage: string;
  script: string;
  scenes: Scene[];
  visualDirection: { camera: string; movement: string; lighting: string };
  broll: string[];
  music: { genre: string; bpm: number };
  cta: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  changes?: DraftChange[];
}

export interface DraftChange {
  field: string;
  before: string;
  after: string;
}

export interface GenerationInput {
  contentType: GenerateContentType;
  duration: GenerateDuration;
  tone: GenerateTone;
  referenceIds: string[];
}
