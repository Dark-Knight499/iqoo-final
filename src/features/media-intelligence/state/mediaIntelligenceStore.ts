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

interface MediaIntelligenceState {
  currentScreen: MediaIntelligenceScreenId;
  history: MediaIntelligenceScreenId[];
  importedMedia: MediaItem | null;
  analysisStages: AnalysisStage[];
  analysisProgress: number;
  isAnalyzing: boolean;
  isAnalysisComplete: boolean;
  selectedSuggestion: AISuggestion | null;
  approvedSuggestionIds: string[];
  activeCatalogFilter: string;
}

const INITIAL_STATE: MediaIntelligenceState = {
  currentScreen: 'import',
  history: ['import'],
  importedMedia: null,
  analysisStages: INITIAL_STAGES,
  analysisProgress: 0,
  isAnalyzing: false,
  isAnalysisComplete: false,
  selectedSuggestion: mockSuggestions[1], // Default to Create a Short
  approvedSuggestionIds: [],
  activeCatalogFilter: 'All',
};

let miState: MediaIntelligenceState = { ...INITIAL_STATE };
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
    miState = {
      ...miState,
      importedMedia: media,
    };
    notify();
  },

  startAnalysis: async () => {
    miState = {
      ...miState,
      currentScreen: 'analysis',
      history: [...miState.history, 'analysis'],
      isAnalyzing: true,
      analysisProgress: 0,
      analysisStages: mockAnalysisService.getInitialStages(),
      isAnalysisComplete: false,
    };
    notify();

    await mockAnalysisService.runAnalysis((stages, percent) => {
      miState = {
        ...miState,
        analysisStages: stages,
        analysisProgress: percent,
      };
      notify();
    });

    miState = {
      ...miState,
      isAnalyzing: false,
      isAnalysisComplete: true,
      analysisProgress: 100,
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

  approveSuggestion: (sugId: string) => {
    const updated = Array.from(new Set([...miState.approvedSuggestionIds, sugId]));
    miState = {
      ...miState,
      approvedSuggestionIds: updated,
    };
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
    setCatalogFilter: mediaIntelligenceStore.setCatalogFilter,
    resetFlow: mediaIntelligenceStore.resetFlow,
  };
}
