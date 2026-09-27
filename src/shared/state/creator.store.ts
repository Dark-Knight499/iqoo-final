import { useState, useEffect } from 'react';
import { CreatorProfile } from '@/shared/types/creator';
import { storage } from '@/utils/storage';

const blankProfile = (): CreatorProfile => ({
  id: '', name: '', avatarUrl: '', coverUrl: '', niche: '', platforms: [], goals: [],
  dna: { voice: '', tone: [], frequentPhrases: [], avgVideoLength: '', hookStyle: '', coreThemes: [], thumbnailStyle: '' },
  hookPatterns: [], connectedSources: [], customInstructions: '',
  metrics: { views: '', viewsChange: '', engagement: '', engagementChange: '', watchTime: '', growth: '' },
});

const validProfile = (value: unknown): value is CreatorProfile =>
  !!value && typeof value === 'object' && typeof (value as CreatorProfile).id === 'string'
  && !!(value as CreatorProfile).id && typeof (value as CreatorProfile).name === 'string';

// Only a previously completed, persisted profile can own legacy data. The old
// built-in demo profile was never evidence of an actual creator workspace.
const legacy = storage.load<CreatorProfile | null>('creator_profile', null);
const legacyOwner = storage.load('has_onboarded', false) && validProfile(legacy) ? legacy.id : '';
let workspaces = storage.load<CreatorProfile[]>('creator_workspaces', []);
workspaces = Array.isArray(workspaces) ? workspaces.filter(validProfile) : [];
if (!workspaces.length && legacyOwner && legacy) {
  workspaces = [legacy];
  storage.save('creator_workspaces', workspaces);
}
let currentCreator: CreatorProfile = workspaces.find(profile => profile.id === storage.load('active_creator_id', ''))
  ?? workspaces[0] ?? blankProfile();
const listeners = new Set<(creator: CreatorProfile) => void>();

function notify() {
  listeners.forEach(listener => listener(currentCreator));
}

function persistProfile() {
  if (!currentCreator.id) return;
  workspaces = [...workspaces.filter(profile => profile.id !== currentCreator.id), currentCreator];
  storage.save('creator_workspaces', workspaces);
  storage.save('active_creator_id', currentCreator.id);
}

function newId() {
  return `creator_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const creatorStore = {
  get: () => currentCreator,
  // Copies prevent callers from mutating a saved profile without a notification.
  listWorkspaces: (): CreatorProfile[] => structuredClone(workspaces),
  getLegacyOwnerId: () => legacyOwner,
  subscribe: (listener: (creator: CreatorProfile) => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  saveWorkspace: (): void => {
    if (!currentCreator.name.trim()) return;
    if (!currentCreator.id) currentCreator = { ...currentCreator, id: newId() };
    persistProfile();
    notify();
  },
  switchWorkspace: (id: string): boolean => {
    const profile = workspaces.find(item => item.id === id);
    if (!profile) return false;
    currentCreator = structuredClone(profile);
    storage.save('active_creator_id', id);
    notify();
    return true;
  },
  beginNewWorkspace: (): void => {
    currentCreator = blankProfile();
    storage.save('active_creator_id', '');
    notify();
  },
  set: (updater: (prev: CreatorProfile) => CreatorProfile) => {
    const next = updater(currentCreator);
    currentCreator = { ...next, id: currentCreator.id }; // identity is controlled by workspace selection
    persistProfile();
    notify();
  },
  updateProfile: (partial: Partial<CreatorProfile>) => {
    const { id: _ignored, ...edits } = partial;
    currentCreator = { ...currentCreator, ...edits };
    // Onboarding currently finishes immediately after updating the profile.
    // A named pending profile becomes a local workspace at that point.
    if (!currentCreator.id && currentCreator.name.trim()) currentCreator = { ...currentCreator, id: newId() };
    persistProfile();
    notify();
  },
};

export function useCreatorStore() {
  const [state, setState] = useState<CreatorProfile>(currentCreator);
  useEffect(() => creatorStore.subscribe(setState), []);
  return { creator: state, updateProfile: creatorStore.updateProfile };
}
