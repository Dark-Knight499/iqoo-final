import { useEffect, useState } from 'react';
import type { AISuggestion, AnalysisStage, MediaIntelligenceScreenId, MediaItem } from '../types/mediaIntelligence';
import { mockSuggestions } from '../data/mockSuggestions';
import { primaryDemoVideo } from '../data/mockMedia';
import { runStaticAnalysis, type StaticAnalysisResult, type StaticFeatureName, type StaticFeatureStatus } from '../services/staticAnalysisService';
import { projectStore } from '@/shared/state/project.store';

interface MediaIntelligenceState {
  currentScreen: MediaIntelligenceScreenId;
  history: MediaIntelligenceScreenId[];
  importedMedia: MediaItem | null;
  selectedFile: File | null;
  analysisResult: StaticAnalysisResult | null;
  analysisError: string | null;
  analysisStages: AnalysisStage[];
  analysisProgress: number | null;
  isAnalyzing: boolean;
  isAnalysisComplete: boolean;
  selectedSuggestion: AISuggestion | null;
  approvedSuggestionIds: string[];
  activeCatalogFilter: string;
  selectedCatalogMedia: MediaItem | null;
  remoteSuggestions: AISuggestion[] | null;
}

const STAGE_TEMPLATE: AnalysisStage[] = [
  { id: 'metadata', label: 'Video metadata', completed: false, active: false, status: 'pending' },
  { id: 'audio', label: 'Audio levels, silence & noise estimate', completed: false, active: false, status: 'pending' },
  { id: 'transcript', label: 'Speech transcript', completed: false, active: false, status: 'pending' },
  { id: 'scenes', label: 'Shot boundaries', completed: false, active: false, status: 'pending' },
  { id: 'moments', label: 'Representative keyframes', completed: false, active: false, status: 'pending' },
  { id: 'objects', label: 'Sampled object detection', completed: false, active: false, status: 'pending' },
];

const INITIAL_STATE: MediaIntelligenceState = {
  currentScreen: 'import',
  history: ['import'],
  importedMedia: null,
  selectedFile: null,
  analysisResult: null,
  analysisError: null,
  analysisStages: STAGE_TEMPLATE.map((stage) => ({ ...stage })),
  analysisProgress: null,
  isAnalyzing: false,
  isAnalysisComplete: false,
  selectedSuggestion: mockSuggestions[1],
  approvedSuggestionIds: [],
  activeCatalogFilter: 'All',
  selectedCatalogMedia: null,
  remoteSuggestions: null,
};

let miState: MediaIntelligenceState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();

function notify() { listeners.forEach((listener) => listener()); }

function releasePreview() {
  const previewUrl = miState.importedMedia?.previewUrl;
  if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
}

function formatFileSize(size: number) {
  return size >= 1024 * 1024 * 1024
    ? `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function featureGroupStatus(features: StaticFeatureStatus[], names: StaticFeatureName[]): { status: NonNullable<AnalysisStage['status']>; message: string } {
  const group = features.filter((feature) => names.includes(feature.feature));
  if (!group.length) return { status: 'failed' as const, message: 'No feature status was returned.' };
  const successes = group.filter((feature) => feature.status === 'success').length;
  const failures = group.filter((feature) => feature.status === 'failed').length;
  const status = successes === group.length ? 'success' : failures === group.length ? 'failed' : 'partial';
  const message = group.filter((feature) => feature.error).map((feature) => feature.error).join(' ');
  return { status, message };
}

function stagesFromResult(result: StaticAnalysisResult): AnalysisStage[] {
  const mapping: Array<[AnalysisStage['id'], StaticFeatureName[]]> = [
    ['metadata', ['video_metadata']],
    ['audio', ['audio_rms', 'silence', 'noise']],
    ['transcript', ['transcript']],
    ['scenes', ['shots']],
    ['moments', ['keyframes']],
    ['objects', ['yolo']],
  ];
  return STAGE_TEMPLATE.map((stage) => {
    const group = mapping.find(([id]) => id === stage.id)?.[1] ?? [];
    const resultStatus = featureGroupStatus(result.features, group);
    return {
      ...stage,
      completed: resultStatus.status === 'success' || resultStatus.status === 'partial',
      active: false,
      status: resultStatus.status,
      message: resultStatus.message,
    };
  });
}

export const mediaIntelligenceStore = {
  getState: () => miState,

  navigateTo: (screen: MediaIntelligenceScreenId) => {
    miState = { ...miState, currentScreen: screen, history: [...miState.history, screen] };
    notify();
  },

  goBack: () => {
    if (miState.history.length > 1) {
      const history = [...miState.history];
      history.pop();
      miState = { ...miState, currentScreen: history[history.length - 1], history };
      notify();
    }
  },

  importVideo: (file: File) => {
    releasePreview();
    const previewUrl = URL.createObjectURL(file);
    const id = globalThis.crypto?.randomUUID?.() ?? `video-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    miState = {
      ...miState,
      importedMedia: {
        id,
        title: file.name,
        type: 'video',
        duration: 'Not analyzed',
        size: formatFileSize(file.size),
        thumbnail: previewUrl,
        previewUrl,
      },
      selectedFile: file,
      analysisResult: null,
      analysisError: null,
      isAnalysisComplete: false,
    };
    notify();
  },

  importMedia: (media: MediaItem = primaryDemoVideo) => {
    releasePreview();
    miState = { ...miState, importedMedia: media, selectedFile: null, analysisResult: null, analysisError: null };
    notify();
  },

  startAnalysis: async () => {
    if (!miState.selectedFile) {
      miState = { ...miState, analysisError: 'Choose a video file from this device before starting analysis.' };
      notify();
      return;
    }
    const file = miState.selectedFile;
    miState = {
      ...miState,
      currentScreen: 'analysis',
      history: [...miState.history, 'analysis'],
      isAnalyzing: true,
      analysisProgress: null,
      analysisError: null,
      analysisResult: null,
      analysisStages: STAGE_TEMPLATE.map((stage) => ({ ...stage })),
      isAnalysisComplete: false,
    };
    notify();

    try {
      const result = await runStaticAnalysis(file);
      const metadata = result.artifacts.video_metadata;
      miState = {
        ...miState,
        importedMedia: miState.importedMedia && metadata ? {
          ...miState.importedMedia,
          duration: metadata.durationMs == null ? 'Unknown duration' : formatDuration(metadata.durationMs),
          resolution: metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : undefined,
          fps: metadata.fps ?? undefined,
        } : miState.importedMedia,
        analysisResult: result,
        analysisStages: stagesFromResult(result),
        analysisProgress: 100,
        isAnalyzing: false,
        isAnalysisComplete: true,
      };
    } catch (error) {
      miState = {
        ...miState,
        analysisError: error instanceof Error ? error.message : String(error),
        analysisProgress: null,
        isAnalyzing: false,
        isAnalysisComplete: false,
      };
    }
    notify();
  },

  selectSuggestion: (suggestion: AISuggestion) => {
    miState = { ...miState, selectedSuggestion: suggestion, currentScreen: 'suggestion-preview', history: [...miState.history, 'suggestion-preview'] };
    notify();
  },

  approveSuggestion: (suggestionOrId: AISuggestion | string): boolean => {
    const id = typeof suggestionOrId === 'string' ? suggestionOrId : suggestionOrId.id;
    if (miState.approvedSuggestionIds.includes(id)) return false;
    const suggestion = typeof suggestionOrId === 'string'
      ? (miState.remoteSuggestions?.find((s) => s.id === suggestionOrId) || mockSuggestions.find((s) => s.id === suggestionOrId))
      : suggestionOrId;
    if (!suggestion) return false;

    const media = miState.importedMedia;
    if (media) {
      const clip = suggestion.backendClip;
      const parseTime = (time: string) => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);
      const range = suggestion.timestampRange?.split(/[–—-]/).map(parseTime);
      const start = clip?.start_seconds ?? (range?.length === 2 ? range[0] : undefined);
      const end = clip?.end_seconds ?? (range?.length === 2 ? range[1] : undefined);
      const duration = start !== undefined && end !== undefined ? Math.max(0, end - start) : 0;
      projectStore.addProject({
        title: suggestion.title,
        description: `${clip ? 'Backend text clip suggestion' : 'Analyzed suggestion'} from ${media.title}. ${suggestion.reason}${suggestion.quote ? ` Quote: ${suggestion.quote}` : ''}${media.sourceUrl ? ` Source: ${media.sourceUrl}` : ''}${suggestion.plan?.length ? ` Plan: ${suggestion.plan.join(' | ')}` : ''}`,
        thumbnailUrl: media.thumbnail,
        mediaName: media.sourceUrl || media.title,
        trimStartSeconds: start,
        trimEndSeconds: end,
        durationSeconds: duration,
        aspectRatio: clip?.recommended_aspect_ratio === '16:9' ? '16:9' : clip?.recommended_aspect_ratio === '1:1' ? '1:1' : '9:16',
        clips: [],
      });
    }

    miState = { ...miState, approvedSuggestionIds: Array.from(new Set([...miState.approvedSuggestionIds, id])) };
    notify();
    return true;
  },

  selectCatalogMedia: (media: MediaItem) => {
    miState = { ...miState, selectedCatalogMedia: media, currentScreen: 'content-detail', history: [...miState.history, 'content-detail'] };
    notify();
  },

  setCatalogFilter: (filter: string) => {
    miState = { ...miState, activeCatalogFilter: filter };
    notify();
  },

  resetFlow: () => {
    releasePreview();
    miState = { ...INITIAL_STATE, analysisStages: STAGE_TEMPLATE.map((stage) => ({ ...stage })) };
    notify();
  },
};

function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function useMediaIntelligenceStore() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const update = () => setVersion((version) => version + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return {
    ...miState,
    navigateTo: mediaIntelligenceStore.navigateTo,
    goBack: mediaIntelligenceStore.goBack,
    importVideo: mediaIntelligenceStore.importVideo,
    importMedia: mediaIntelligenceStore.importMedia,
    startAnalysis: mediaIntelligenceStore.startAnalysis,
    selectSuggestion: mediaIntelligenceStore.selectSuggestion,
    approveSuggestion: mediaIntelligenceStore.approveSuggestion,
    selectCatalogMedia: mediaIntelligenceStore.selectCatalogMedia,
    setCatalogFilter: mediaIntelligenceStore.setCatalogFilter,
    resetFlow: mediaIntelligenceStore.resetFlow,
  };
}
