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
import { creatorStore } from '@/shared/state/creator.store';

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
  savedProjectId: string | null;
  proposedDraft: GeneratedContent | null;
  generationError: string | null;
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
  copilotMessages: [],
  generatedDraft: null,
  savedProjectId: null,
  proposedDraft: null,
  generationError: null,
  activeGenerateTab: 'copilot',
  storyboardOpen: false,
  bookmarkedIds: bookmarkService.getAll(),
};

let ciState: CIState = {
  ...INITIAL_STATE,
  storyboardItems: storyboardService.getItems(),
  generationInput: { ...INITIAL_GENERATION_INPUT, referenceIds: storyboardService.getItems().map(item => item.contentId) },
  bookmarkedIds: bookmarkService.getAll(),
};

const listeners = new Set<() => void>();
let generationVersion = 0;
let workspaceId = creatorStore.get().id;

function notify() {
  listeners.forEach((l) => l());
}

export const ciStore = {
  getState: () => ciState,

  resetForWorkspace: () => {
    generationVersion++;
    workspaceId = creatorStore.get().id;
    storyboardService.reload();
    bookmarkService.reload();
    const items = storyboardService.getItems();
    ciState = {
      ...INITIAL_STATE,
      generationInput: { ...INITIAL_GENERATION_INPUT, referenceIds: items.map(item => item.contentId) },
      storyboardItems: items,
      bookmarkedIds: bookmarkService.getAll(),
    };
    notify();
  },

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
    if (ciState.storyboardItems.some(item => item.contentId === contentId)) return;
    generationVersion++;
    storyboardService.add(contentId, note);
    ciState = { 
      ...ciState, 
      storyboardItems: storyboardService.getItems(),
      generationInput: {
        ...ciState.generationInput,
        referenceIds: storyboardService.getItems().map(i => i.contentId)
      }, generatedDraft: null, proposedDraft: null, generationLoading: false,
    };
    notify();
  },

  removeFromStoryboard: (itemId: string) => {
    generationVersion++;
    storyboardService.remove(itemId);
    ciState = { 
      ...ciState, 
      storyboardItems: storyboardService.getItems(),
      generationInput: {
        ...ciState.generationInput,
        referenceIds: storyboardService.getItems().map(i => i.contentId)
      }, generatedDraft: null, proposedDraft: null, generationLoading: false,
    };
    notify();
  },

  setSelectedContent: (contentId: string | null) => {
    ciState = { ...ciState, selectedContentId: contentId };
    notify();
  },

  openGenerateModal: () => {
    const referenceIds = ciState.storyboardItems.map(item => item.contentId);
    const sameReferences = ciState.generatedDraft?.format.referenceIds.join('|') === referenceIds.join('|');
    ciState = { 
      ...ciState, 
      generateModalOpen: true,
      activeGenerateTab: 'copilot',
      generatedDraft: sameReferences ? ciState.generatedDraft : null,
      generationInput: {
        ...ciState.generationInput,
        referenceIds
      }
    };
    notify();
    if (!ciState.generatedDraft && !ciState.generationLoading) {
      ciStore.startGeneration();
    }
  },

  openSavedBlueprint: (draft: GeneratedContent, projectId?: string) => {
    generationVersion++;
    ciState = { ...ciState, generateModalOpen: true, activeGenerateTab: 'final',
       generatedDraft: structuredClone(draft), savedProjectId: projectId || null, generationInput: structuredClone(draft.format),
      generationLoading: false, generationError: null, proposedDraft: null,
      copilotMessages: [{ id: `saved-${Date.now()}`, role: 'ai', text: 'Saved template loaded. Local edits require your approval.', timestamp: Date.now() }] };
    notify();
  },

  linkProjectForPlanning: (projectId: string) => {
    generationVersion++;
    ciState = { ...ciState, savedProjectId: projectId, generatedDraft: null, proposedDraft: null, generationLoading: false };
    notify();
  },

  openGenerateForProject: (projectId: string) => {
    generationVersion++;
    ciState = { ...ciState, savedProjectId: projectId, generatedDraft: null,
      generationInput: { ...INITIAL_GENERATION_INPUT, referenceIds: ciState.storyboardItems.map(item => item.contentId) },
      proposedDraft: null, generateModalOpen: true, activeGenerateTab: 'copilot' };
    notify();
    ciStore.startGeneration();
  },

  closeGenerateModal: () => {
    ciState = { ...ciState, generateModalOpen: false, savedProjectId: null };
    notify();
  },

  updateGenerationInput: (partial: Partial<GenerationInput>) => {
    generationVersion++;
    ciState = { 
      ...ciState, 
      generationInput: { ...ciState.generationInput, ...partial },
      generatedDraft: null,
      generationLoading: false,
      proposedDraft: null,
    };
    notify();
  },

  startGeneration: async () => {
    const version = ++generationVersion;
    const input = { ...ciState.generationInput, referenceIds: [...ciState.generationInput.referenceIds] };
    ciState = { ...ciState, generationLoading: true, generationError: null, proposedDraft: null, generatedDraft: null };
    notify();
    
    try {
      const draft = await generationService.generate(input);
      if (version !== generationVersion) return;
      ciState = { 
        ...ciState, 
        generationLoading: false, 
        generatedDraft: draft,
        copilotMessages: [
          {
            id: 'init-1',
            role: 'ai',
            text: `Local template built from ${draft.references.length} selected sample catalog reference(s). Review and verify the script before publishing. I can preview edits to a hook, CTA, or visuals for your approval.`,
            timestamp: Date.now(),
          }
        ]
      };
      notify();
    } catch (e) {
      if (version !== generationVersion) return;
      ciState = { ...ciState, generationLoading: false, generationError: e instanceof Error ? e.message : 'Could not build template.' };
      notify();
    }
  },

  sendCopilotMessage: async (text: string) => {
    const draft = ciState.generatedDraft;
    if (!draft || !text.trim() || ciState.generationLoading || ciState.proposedDraft) return;

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
    const version = ++generationVersion;

    try {
      const { response, proposedDraft } = await generationService.chat(text, draft);
      if (version !== generationVersion) return;
      ciState = { 
        ...ciState, 
        generationLoading: false,
        copilotMessages: [...ciState.copilotMessages, response],
        proposedDraft
      };
      notify();
    } catch (e) {
      if (version !== generationVersion) return;
      ciState = { ...ciState, generationLoading: false, generationError: e instanceof Error ? e.message : 'Could not preview edit.' };
      notify();
    }
  },

  approveProposedDraft: () => {
    if (!ciState.proposedDraft) return;
    ciState = { ...ciState, generatedDraft: ciState.proposedDraft, proposedDraft: null,
      copilotMessages: [...ciState.copilotMessages, { id: `approved-${Date.now()}`, role: 'ai', text: 'Approved changes applied to the draft.', timestamp: Date.now() }] };
    notify();
  },

  rejectProposedDraft: () => {
    ciState = { ...ciState, proposedDraft: null,
      copilotMessages: [...ciState.copilotMessages, { id: `discarded-${Date.now()}`, role: 'ai', text: 'Preview discarded. The draft was not changed.', timestamp: Date.now() }] };
    notify();
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
    generationVersion++;
    storyboardService.clear();
    ciState = { 
      ...ciState, 
      storyboardItems: [],
      generationInput: {
        ...ciState.generationInput,
        referenceIds: []
      }, generatedDraft: null, proposedDraft: null, generationLoading: false,
    };
    notify();
  }
};

creatorStore.subscribe(creator => {
  if (creator.id !== workspaceId) ciStore.resetForWorkspace();
});

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
    openSavedBlueprint: ciStore.openSavedBlueprint,
    linkProjectForPlanning: ciStore.linkProjectForPlanning,
    openGenerateForProject: ciStore.openGenerateForProject,
    closeGenerateModal: ciStore.closeGenerateModal,
    updateGenerationInput: ciStore.updateGenerationInput,
    startGeneration: ciStore.startGeneration,
    sendCopilotMessage: ciStore.sendCopilotMessage,
    approveProposedDraft: ciStore.approveProposedDraft,
    rejectProposedDraft: ciStore.rejectProposedDraft,
    setActiveGenerateTab: ciStore.setActiveGenerateTab,
    openStoryboard: ciStore.openStoryboard,
    closeStoryboard: ciStore.closeStoryboard,
    clearStoryboard: ciStore.clearStoryboard,
  };
}
