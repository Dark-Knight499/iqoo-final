import { mockVideos } from '../data/mockContent';
import { buildTemplate } from './mockGenerationService';
import { ciStore } from '../state/creatorIntelligenceStore';
import { creatorStore } from '@/shared/state/creator.store';
import { projectStore } from '@/shared/state/project.store';
import type { CreatorProfile } from '@/shared/types/creator';

const REFERENCE_ID = 'v1';
const BLUEPRINT_ID = 'demo-workspace-blueprint-v1';

// An explicitly local sample: no connected accounts, inferred voice, measured metrics, or media clips.
const demoProfile: Partial<CreatorProfile> = {
  id: 'c_demo_workspace',
  name: 'Demo Creator (sample)',
  avatarUrl: '',
  coverUrl: '',
  niche: 'Technology & AI',
  platforms: ['YouTube'],
  goals: [],
  dna: {
    voice: 'Not analyzed yet', tone: [], frequentPhrases: [],
    avgVideoLength: 'Not analyzed yet', hookStyle: 'Not analyzed yet',
    coreThemes: [], thumbnailStyle: 'Not analyzed yet',
  },
  hookPatterns: [],
  connectedSources: [],
  profileSources: {},
  profileDocuments: undefined,
  customInstructions: '',
  metrics: { views: '—', viewsChange: '—', engagement: '—', engagementChange: '—', watchTime: '—', growth: '—' },
};

export function enterDemoWorkspace(): void {
  const reference = mockVideos.find(item => item.id === REFERENCE_ID);
  if (!reference) throw new Error('The sample catalog reference is unavailable. Please try again later.');

  const blueprint = buildTemplate({ contentType: 'reel', duration: '60s', tone: 'educational', referenceIds: [reference.id] });
  blueprint.id = BLUEPRINT_ID;

  // Keep existing user projects and storyboard entries intact on re-entry.
  creatorStore.updateProfile(demoProfile);
  const existingProject = projectStore.getProjects().find(project => project.blueprint?.id === BLUEPRINT_ID);
  if (!existingProject) {
    projectStore.addProject({
      title: `Demo example · ${blueprint.title}`,
      description: 'Sample catalog reference · local text-only template blueprint. No media or creator analysis.',
      thumbnailUrl: '',
      durationSeconds: 60,
      aspectRatio: '9:16',
      clips: [],
      blueprint,
    });
  }
  ciStore.addToStoryboard(reference.id, 'Sample catalog reference for the demo blueprint; no media analyzed.');
}
