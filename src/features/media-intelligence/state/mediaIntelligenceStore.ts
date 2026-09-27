import { useState, useEffect } from 'react';
import { 
  MediaIntelligenceScreenId, 
  MediaItem, 
  AnalysisStage, 
  AISuggestion 
} from '../types/mediaIntelligence';
import { mockAnalysisService, INITIAL_STAGES } from '../services/mockAnalysisService';
import { mockSuggestions } from '../data/mockSuggestions';
import { primaryDemoVideo } from '../data/mockMedia';
import { legacyBackend } from '@/services/legacyBackend';
import { projectStore } from '@/shared/state/project.store';

interface MediaIntelligenceState {
  currentScreen: MediaIntelligenceScreenId;
  history: MediaIntelligenceScreenId[];
  importedMedia: MediaItem | null;
  selectedCatalogMedia: MediaItem | null;
  analysisStages: AnalysisStage[];
  analysisProgress: number;
  isAnalyzing: boolean;
  isAnalysisComplete: boolean;
  selectedSuggestion: AISuggestion | null;
  approvedSuggestionIds: string[];
  activeCatalogFilter: string;
  remoteSuggestions: AISuggestion[] | null;
  analysisError: string | null;
}

const INITIAL_STATE: MediaIntelligenceState = {
  currentScreen: 'import',
  history: ['import'],
  importedMedia: null,
  selectedCatalogMedia: null,
  analysisStages: INITIAL_STAGES,
  analysisProgress: 0,
  isAnalyzing: false,
  isAnalysisComplete: false,
  selectedSuggestion: null,
  approvedSuggestionIds: [],
  activeCatalogFilter: 'All',
  remoteSuggestions: null,
  analysisError: null,
};

let miState: MediaIntelligenceState = { ...INITIAL_STATE };
let analysisRequestId = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const mediaIntelligenceStore = {
  getState: () => miState,

  navigateTo: (screen: MediaIntelligenceScreenId) => {
    miState = {
      ...miState,
      currentScreen: screen,
      history: [...miState.history, screen],
    };
    notify();
  },

  goBack: () => {
    if (miState.history.length > 1) {
      const newHistory = [...miState.history];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      miState = {
        ...miState,
        currentScreen: prevScreen,
        history: newHistory,
      };
      notify();
    }
  },

  importMedia: (media: MediaItem = primaryDemoVideo) => {
    analysisRequestId++;
    miState = {
      ...miState,
      importedMedia: media,
      selectedCatalogMedia: null,
      remoteSuggestions: null,
      selectedSuggestion: null,
      approvedSuggestionIds: [],
      isAnalysisComplete: false,
    };
    notify();
  },

  startAnalysis: async (videoUrl?: string, creatorName = 'Creator') => {
    const requestId = ++analysisRequestId;
    miState = {
      ...miState,
      isAnalyzing: true,
      analysisProgress: 0,
      analysisStages: mockAnalysisService.getInitialStages(),
      isAnalysisComplete: false,
      analysisError: null,
      remoteSuggestions: null,
      approvedSuggestionIds: [],
    };
    notify();

    if (videoUrl?.trim()) {
      try {
        const analysis = await legacyBackend.analyzeVideo(videoUrl.trim(), creatorName);
        if (requestId !== analysisRequestId) return;
        const remoteSuggestions: AISuggestion[] = analysis.top_viral_clips.map((clip) => ({
          id: clip.clip_id,
          type: 'short',
          tag: `VIRAL CLIP #${clip.rank}`,
          title: clip.suggested_title,
          timestampRange: `${clip.start_time}–${clip.end_time}`,
          quote: clip.hook_line,
          reason: clip.why_viral,
          actionLabel: 'Preview',
          secondaryActionLabel: 'Send to review',
          relevanceScore: clip.virality_score,
          plan: [
            clip.transcript_snippet,
            `Recommended format: ${clip.recommended_aspect_ratio}`,
            clip.suggested_caption,
          ],
          backendClip: clip,
        }));

        miState = {
          ...miState,
          currentScreen: 'suggestions',
          history: [...miState.history, 'suggestions'],
          importedMedia: {
            id: `url:${videoUrl.trim()}`,
            type: 'video',
            thumbnail: '',
            sourceUrl: videoUrl.trim(),
            title: analysis.video_title,
            duration: analysis.video_duration,
            analyzedAt: new Date().toLocaleString(),
          },
          selectedCatalogMedia: null,
          selectedSuggestion: null,
          remoteSuggestions,
          isAnalyzing: false,
          isAnalysisComplete: true,
          analysisProgress: 100,
          analysisError: null,
        };
      } catch (error) {
        if (requestId !== analysisRequestId) return;
        miState = {
          ...miState,
          isAnalyzing: false,
          isAnalysisComplete: false,
          analysisError: error instanceof Error ? error.message : 'Video analysis failed. Please try again.',
        };
      }
      notify();
      return;
    }

    miState = {
      ...miState,
      currentScreen: 'analysis',
      history: [...miState.history, 'analysis'],
      analysisStages: mockAnalysisService.getInitialStages(),
    };
    notify();

    await mockAnalysisService.runAnalysis((stages, percent) => {
      if (requestId !== analysisRequestId) return;
      miState = {
        ...miState,
        analysisStages: stages,
        analysisProgress: percent,
      };
      notify();
    });

    if (requestId !== analysisRequestId) return;

    miState = {
      ...miState,
      isAnalyzing: false,
      isAnalysisComplete: true,
      analysisProgress: 100,
      analysisError: null,
    };
    notify();
  },

  selectSuggestion: (sug: AISuggestion) => {
    miState = {
      ...miState,
      selectedSuggestion: sug,
      currentScreen: 'suggestion-preview',
      history: [...miState.history, 'suggestion-preview'],
    };
    notify();
  },

  approveSuggestion: (suggestion: AISuggestion) => {
    if (miState.approvedSuggestionIds.includes(suggestion.id)) return false;
    const media = miState.importedMedia;
    if (!media) return false;
    const clip = suggestion.backendClip;
    const parseTime = (time: string) => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);
    const range = suggestion.timestampRange?.split(/[–—-]/).map(parseTime);
    const start = clip?.start_seconds ?? (range?.length === 2 ? range[0] : undefined);
    const end = clip?.end_seconds ?? (range?.length === 2 ? range[1] : undefined);
    const duration = start !== undefined && end !== undefined ? Math.max(0, end - start) : 0;
    // A review draft stores the suggested range and text; no video has been downloaded or rendered.
    projectStore.addProject({
      title: suggestion.title,
      description: `${clip ? 'Backend text clip suggestion' : 'Demo suggestion'} from ${media.title}. ${suggestion.reason}${suggestion.quote ? ` Quote: ${suggestion.quote}` : ''}${media.sourceUrl ? ` Source: ${media.sourceUrl}` : ''}${suggestion.plan?.length ? ` Plan: ${suggestion.plan.join(' | ')}` : ''} No video rendered.`,
      thumbnailUrl: media.thumbnail,
      mediaName: media.sourceUrl || media.title,
      trimStartSeconds: start,
      trimEndSeconds: end,
      durationSeconds: duration,
      aspectRatio: clip?.recommended_aspect_ratio === '16:9' ? '16:9' : clip?.recommended_aspect_ratio === '1:1' ? '1:1' : '9:16',
      clips: [],
    });
    miState = {
      ...miState,
      approvedSuggestionIds: [...miState.approvedSuggestionIds, suggestion.id],
    };
    notify();
    return true;
  },

  selectCatalogMedia: (media: MediaItem) => {
    miState = { ...miState, selectedCatalogMedia: media, currentScreen: 'content-detail', history: [...miState.history, 'content-detail'] };
    notify();
  },

  setCatalogFilter: (filter: string) => {
    miState = {
      ...miState,
      activeCatalogFilter: filter,
    };
    notify();
  },

  resetFlow: () => {
    analysisRequestId++;
    miState = {
      ...INITIAL_STATE,
      analysisStages: mockAnalysisService.getInitialStages(),
    };
    notify();
  },
};

export function useMediaIntelligenceStore() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    ...miState,
    navigateTo: mediaIntelligenceStore.navigateTo,
    goBack: mediaIntelligenceStore.goBack,
    importMedia: mediaIntelligenceStore.importMedia,
    startAnalysis: mediaIntelligenceStore.startAnalysis,
    selectSuggestion: mediaIntelligenceStore.selectSuggestion,
    approveSuggestion: mediaIntelligenceStore.approveSuggestion,
    selectCatalogMedia: mediaIntelligenceStore.selectCatalogMedia,
    setCatalogFilter: mediaIntelligenceStore.setCatalogFilter,
    resetFlow: mediaIntelligenceStore.resetFlow,
  };
}
