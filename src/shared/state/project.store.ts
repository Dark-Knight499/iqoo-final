import { useState, useEffect } from 'react';
import { Project } from '@/shared/types/project';
import { storage } from '@/utils/storage';
import { creatorStore } from '@/shared/state/creator.store';

const isSyntheticJpg = (url: string) => /^\/assets\/[^/?#]+\.jpg(?:[?#]|$)/i.test(url);
const legacyOwner = creatorStore.getLegacyOwnerId();
const savedProjects = storage.load<Project[] | null>('projects_list', null);
let projects: Project[] = (Array.isArray(savedProjects) ? savedProjects : []).map((project) => ({
  ...project,
  creatorId: project.creatorId || legacyOwner,
  thumbnailUrl: isSyntheticJpg(project.thumbnailUrl ?? '') ? '' : project.thumbnailUrl,
  // Remove only invalid JPG-as-video clips; retain imported and edited clips.
  clips: project.clips?.filter((clip) => !isSyntheticJpg(clip.mediaUrl)) ?? [],
}));
// Projects without a provable old owner remain inaccessible, rather than being
// adopted by whichever workspace happens to open first.
storage.save('projects_list', projects);
const activeIds = new Map<string, string>();
const listeners = new Set<() => void>();
const mine = () => projects.filter(project => !!creatorStore.get().id && project.creatorId === creatorStore.get().id);
creatorStore.subscribe(() => listeners.forEach(listener => listener()));

function notify() {
  storage.save('projects_list', projects);
  listeners.forEach((l) => l());
}

export const projectStore = {
  getProjects: () => mine(),
  getActiveProject: () => mine().find((p) => p.id === activeIds.get(creatorStore.get().id)) || mine()[0],
  setActiveProjectId: (id: string) => {
    if (!mine().some(project => project.id === id)) return;
    activeIds.set(creatorStore.get().id, id);
    notify();
  },
  addProject: (newProj: Partial<Project>) => {
    let owner = creatorStore.get().id;
    if (!owner) {
      if (!creatorStore.get().name) {
        creatorStore.updateProfile({ name: 'Creator Workspace' });
      }
      creatorStore.saveWorkspace();
      owner = creatorStore.get().id;
    }
    const p: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      creatorId: owner,
      title: newProj.title || 'Untitled Project',
      description: newProj.description || '',
      thumbnailUrl: newProj.thumbnailUrl ?? '',
      durationSeconds: newProj.durationSeconds ?? 30,
      mediaUrl: newProj.mediaUrl,
      mediaId: newProj.mediaId,
      mediaName: newProj.mediaName,
      mediaMimeType: newProj.mediaMimeType,
      mediaSizeBytes: newProj.mediaSizeBytes,
      mediaWidth: newProj.mediaWidth,
      mediaHeight: newProj.mediaHeight,
      captionText: newProj.captionText,
      captionsEnabled: newProj.captionsEnabled,
      safeZonePreset: newProj.safeZonePreset,
      trimStartSeconds: newProj.trimStartSeconds,
      trimEndSeconds: newProj.trimEndSeconds,
      proposedTrim: newProj.proposedTrim,
      appliedOperations: newProj.appliedOperations,
      lastExport: newProj.lastExport,
      aspectRatio: newProj.aspectRatio || '9:16',
      updatedAt: 'Just now',
      status: 'draft',
      clips: newProj.clips || [],
      knowledge: newProj.knowledge,
      blueprint: newProj.blueprint,
    };
    projects = [p, ...projects];
    activeIds.set(owner, p.id);
    notify();
    return p;
  },
  updateActiveProject: (partial: Partial<Project>) => {
    const active = projectStore.getActiveProject();
    if (active) projectStore.updateProject(active.id, partial);
  },
  updateProject: (id: string, partial: Partial<Project>) => {
    if (!mine().some(project => project.id === id)) return;
    const { id: _id, creatorId: _creatorId, ...edits } = partial;
    projects = projects.map((p) => (p.id === id && p.creatorId === creatorStore.get().id ? { ...p, ...edits, updatedAt: 'Just now' } : p));
    notify();
  },
};

export function useProjectStore() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    projects: projectStore.getProjects(),
    activeProject: projectStore.getActiveProject(),
    setActiveProjectId: projectStore.setActiveProjectId,
    addProject: projectStore.addProject,
    updateActiveProject: projectStore.updateActiveProject,
  };
}
