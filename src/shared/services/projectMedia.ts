import { projectStore } from '@/shared/state/project.store';
import { files } from '@/utils/files';

/** Attach a real browser-stored video to an existing planning project, without replacing its blueprint. */
export async function attachVideoToProject(projectId: string): Promise<boolean> {
  const project = projectStore.getProjects().find(item => item.id === projectId);
  if (!project) throw new Error('This project no longer exists.');
  const picked = await files.pickVideo();
  if (!picked) return false;
  try {
    projectStore.updateProject(projectId, {
      mediaId: picked.mediaId, mediaName: picked.name, durationSeconds: picked.duration,
      trimStartSeconds: 0, trimEndSeconds: picked.duration,
      proposedTrim: undefined, appliedOperations: [], lastExport: undefined,
      aspectRatio: picked.width >= picked.height ? '16:9' : '9:16',
      status: 'draft',
    });
    projectStore.setActiveProjectId(projectId);
    return true;
  } finally {
    URL.revokeObjectURL(picked.url);
  }
}
