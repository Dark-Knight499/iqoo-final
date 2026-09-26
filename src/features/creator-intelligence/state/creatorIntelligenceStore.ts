import { useState, useEffect } from 'react';
import { 
  Region, 
  DiscoveryTab, 
  GenerateTab, 
  GenerationInput, 
  CopilotMessage, 
  GeneratedContent, 
  StoryboardItem 
} from '../types/creatorIntelligence';
import { searchService, SearchResults } from '../services/searchService';
import { bookmarkService } from '../services/bookmarkService';
import { storyboardService } from '../services/storyboardService';
import { generationService } from '../services/mockGenerationService';

interface CIState {
  selectedRegion: Region;
  selectedDiscoveryTab: DiscoveryTab;
  searchQuery: string;
  searchResults: SearchResults | null;
  storyboardItems: StoryboardItem[];
  selectedContentId: string | null;
  generateModalOpen: boolean;
  generationInput: GenerationInput;
  generationLoading: boolean;
  copilotMessages: CopilotMessage[];
  generatedDraft: GeneratedContent | null;
  activeGenerateTab: GenerateTab;
  storyboardOpen: boolean;
  bookmarkedIds: string[];
}

const INITIAL_GENERATION_INPUT: GenerationInput = {
  contentType: 'reel',
  duration: '60s',
  tone: 'creator-style',
  referenceIds: [],
};

const INITIAL_STATE: CIState = {
  selectedRegion: 'foryou',
  selectedDiscoveryTab: 'videos',
  searchQuery: '',
  searchResults: null,
  storyboardItems: [],
  selectedContentId: null,
  generateModalOpen: false,
  generationInput: INITIAL_GENERATION_INPUT,
  generationLoading: false,
  copilotMessages: [
    {
      id: 'init-1',
      role: 'ai',
      text: "I found strong angles from your references. I'd suggest focusing on how on-device AI is changing mobile creation with zero latency.",
      timestamp: Date.now(),
    }
  ],
  generatedDraft: null,
  activeGenerateTab: 'copilot',
  storyboardOpen: false,
  bookmarkedIds: bookmarkService.getAll(),
};

let ciState: CIState = {
  ...INITIAL_STATE,
  storyboardItems: storyboardService.getItems(),
  bookmarkedIds: bookmarkService.getAll(),
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const ciStore = {
  getState: () => ciState,

  setRegion: (region: Region) => {
    ciState = { ...ciState, selectedRegion: region };
    notify();
  },

  setDiscoveryTab: (tab: DiscoveryTab) => {
    ciState = { ...ciState, selectedDiscoveryTab: tab };
    notify();
  },

  setSearchQuery: (query: string) => {
    const results = query.trim() ? searchService.search(query) : null;
    ciState = { ...ciState, searchQuery: query, searchResults: results };
    notify();
  },

  clearSearch: () => {
    ciState = { ...ciState, searchQuery: '', searchResults: null };
    notify();
  },

  toggleBookmark: (contentId: string): boolean => {
    const newState = bookmarkService.toggle(contentId);
    ciState = { ...ciState, bookmarkedIds: bookmarkService.getAll() };
    notify();
    return newState;
  },

  isBookmarked: (contentId: string): boolean => {
    return bookmarkService.isBookmarked(contentId);
  },

  addToStoryboard: (contentId: string, note?: string) => {
    storyboardService.add(contentId, note);
    ciState = { 
      ...ciState, 
      storyboardItems: storyboardService.getItems(),
      generationInput: {
        ...ciState.generationInput,
        referenceIds: storyboardService.getItems().map(i => i.contentId)
      }
    };
    notify();
  },

  removeFromStoryboard: (itemId: string) => {
    storyboardService.remove(itemId);
    ciState = { 
      ...ciState, 
      storyboardItems: storyboardService.getItems(),
      generationInput: {
        ...ciState.generationInput,
        referenceIds: storyboardService.getItems().map(i => i.contentId)
      }
    };
    notify();
  },

  setSelectedContent: (contentId: string | null) => {
    ciState = { ...ciState, selectedContentId: contentId };
    notify();
  },

  openGenerateModal: () => {
    // If not generated yet, auto-trigger generation
    ciState = { 
      ...ciState, 
      generateModalOpen: true,
      activeGenerateTab: 'copilot',
      generationInput: {
        ...ciState.generationInput,
        referenceIds: ciState.storyboardItems.map(i => i.contentId)
      }
    };
    notify();
    if (!ciState.generatedDraft) {
      ciStore.startGeneration();
    }
  },

  closeGenerateModal: () => {
    ciState = { ...ciState, generateModalOpen: false };
    notify();
  },

  updateGenerationInput: (partial: Partial<GenerationInput>) => {
    ciState = { 
      ...ciState, 
      generationInput: { ...ciState.generationInput, ...partial } 
    };
    notify();
  },

  startGeneration: async () => {
    ciState = { ...ciState, generationLoading: true };
    notify();
    
    try {
      const draft = await generationService.generate(ciState.generationInput);
      ciState = { 
        ...ciState, 
        generationLoading: false, 
        generatedDraft: draft,
        copilotMessages: [
          {
            id: 'init-1',
            role: 'ai',
            text: `I've analyzed your ${ciState.storyboardItems.length} storyboard reference(s) and structured a ${ciState.generationInput.duration} ${ciState.generationInput.contentType} plan in a ${ciState.generationInput.tone} tone. Tell me what to refine!`,
            timestamp: Date.now(),
          }
        ]
      };
      notify();
    } catch (e) {
      ciState = { ...ciState, generationLoading: false };
      notify();
      console.error(e);
    }
  },

  sendCopilotMessage: async (text: string) => {
    const draft = ciState.generatedDraft;
    if (!draft || !text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    ciState = { 
      ...ciState, 
      copilotMessages: [...ciState.copilotMessages, userMsg],
      generationLoading: true
    };
    notify();

    try {
      const { response, updatedDraft } = await generationService.chat(text, draft);
      ciState = { 
        ...ciState, 
        generationLoading: false,
        copilotMessages: [...ciState.copilotMessages, response],
        generatedDraft: updatedDraft
      };
      notify();
    } catch (e) {
      ciState = { ...ciState, generationLoading: false };
      notify();
      console.error(e);
    }
  },

  setActiveGenerateTab: (tab: GenerateTab) => {
    ciState = { ...ciState, activeGenerateTab: tab };
    notify();
  },

  openStoryboard: () => {
    ciState = { ...ciState, storyboardOpen: true };
    notify();
  },

  closeStoryboard: () => {
    ciState = { ...ciState, storyboardOpen: false };
    notify();
  },

  clearStoryboard: () => {
    storyboardService.clear();
    ciState = { 
      ...ciState, 
      storyboardItems: [],
      generationInput: {
        ...ciState.generationInput,
        referenceIds: []
      }
    };
    notify();
  }
};

export function useCIStore() {
  const [, setVersion] = useState(0);
  
  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    ...ciState,
    setRegion: ciStore.setRegion,
    setDiscoveryTab: ciStore.setDiscoveryTab,
    setSearchQuery: ciStore.setSearchQuery,
    clearSearch: ciStore.clearSearch,
    toggleBookmark: ciStore.toggleBookmark,
    isBookmarked: ciStore.isBookmarked,
    addToStoryboard: ciStore.addToStoryboard,
    removeFromStoryboard: ciStore.removeFromStoryboard,
    setSelectedContent: ciStore.setSelectedContent,
    openGenerateModal: ciStore.openGenerateModal,
    closeGenerateModal: ciStore.closeGenerateModal,
    updateGenerationInput: ciStore.updateGenerationInput,
    startGeneration: ciStore.startGeneration,
    sendCopilotMessage: ciStore.sendCopilotMessage,
    setActiveGenerateTab: ciStore.setActiveGenerateTab,
    openStoryboard: ciStore.openStoryboard,
    closeStoryboard: ciStore.closeStoryboard,
    clearStoryboard: ciStore.clearStoryboard,
  };
}
