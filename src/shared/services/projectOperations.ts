import type { Project } from '@/shared/types/project';

export function proposeOpeningTrim(project: Project): NonNullable<Project['proposedTrim']> {
  if (!project.mediaId) throw new Error('Attach a real source video before proposing a trim.');
  const targetSeconds = { '30s': 30, '60s': 60, '90s': 90, custom: 60 }[project.blueprint?.format.duration || '60s'];
  // A duration-only opening range: no timestamps were inferred from source media.
  return { start: 0, end: Math.min(project.durationSeconds, targetSeconds), origin: 'blueprint' };
}

export function validTrim(project: Project, start: number, end: number): boolean {
  return Boolean(project.mediaId) && Number.isFinite(start) && Number.isFinite(end)
    && start >= 0 && end <= project.durationSeconds + 0.001 && end - start >= 0.1;
}

export function applyProposedTrim(project: Project, appliedAt = new Date().toISOString()): Partial<Project> {
  const proposed = project.proposedTrim;
  if (!proposed || !validTrim(project, proposed.start, proposed.end)) throw new Error('Choose a valid proposed range within this source video.');
  return {
    trimStartSeconds: proposed.start, trimEndSeconds: proposed.end, proposedTrim: undefined,
    appliedOperations: [...(project.appliedOperations || []), { type: 'trim', start: proposed.start, end: proposed.end, appliedAt }],
    lastExport: undefined, status: 'draft',
  };
}
