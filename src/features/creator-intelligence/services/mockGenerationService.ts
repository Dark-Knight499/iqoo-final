import { mockReels, mockVideos } from '../data/mockContent';
import { ContentItem, CopilotMessage, DraftChange, GeneratedContent, GenerationInput } from '../types/creatorIntelligence';

const catalog = [...mockVideos, ...mockReels];

export function resolveReferences(ids: string[]): ContentItem[] {
  return [...new Set(ids)].map(id => catalog.find(item => item.id === id)).filter((item): item is ContentItem => Boolean(item));
}

const durationSeconds = { '30s': 30, '60s': 60, '90s': 90, custom: 60 } as const;

export function buildTemplate(input: GenerationInput): GeneratedContent {
  const references = resolveReferences(input.referenceIds);
  if (!references.length) throw new Error('Add a catalog video or reel to your storyboard before building a template.');
  const primary = references[0];
  const seconds = durationSeconds[input.duration];
  const short = input.contentType === 'reel' || input.contentType === 'short-video';
  const topic = primary.topics[0] || primary.title;
  const angle = primary.description || primary.title;
  const other = references.slice(1).map(ref => `${ref.title} (${ref.creatorName})`);
  const hook = `What can ${topic} teach us about ${short ? 'creating better short-form content' : 'building a useful creator workflow'}?`;
  const coreMessage = `Explore ${topic} through ${primary.creatorName}'s "${primary.title}"${other.length ? ` and compare it with ${other.join('; ')}` : ''}. Use these catalog summaries as inspiration; verify any claims before publishing.`;
  const camera = input.tone === 'cinematic' ? 'Wide opening, then close-up' : 'Direct-to-camera close-up';
  const movement = input.tone === 'energetic' ? 'Quick cuts' : input.tone === 'cinematic' ? 'Slow push-in' : 'Steady framing';
  const middle = Math.round(seconds * 0.7);
  const scenes = [
    { id: 'hook', label: 'Opening question', duration: '0-4s', visual: `Show the question about ${topic} on screen.`, dialogue: hook, camera, movement },
    { id: 'context', label: 'Reference & your take', duration: `4-${middle}s`, visual: `Show your own example of ${topic}; cite the reference as inspiration, not footage.`, dialogue: `Reference: "${primary.title}" by ${primary.creatorName}. ${angle} What is your experience with this?`, camera, movement },
    { id: 'close', label: 'Takeaway', duration: `${middle}-${seconds}s`, visual: 'Return to camera with a clear takeaway and question.', dialogue: `Share one practical takeaway about ${topic}, then ask your audience for their experience.`, camera, movement },
  ];
  return {
    id: `template-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: `${topic}: a ${input.contentType.replace('-', ' ')} angle`, hook, coreMessage,
    script: scenes.map(scene => scene.dialogue).join('\n\n'), scenes,
    visualDirection: { camera, movement, lighting: input.tone === 'cinematic' ? 'Directional, high-contrast light' : 'Clear, even lighting' },
    broll: [`Record your own example illustrating ${topic}`, ...references.slice(1).map(ref => `Show your own response to "${ref.title}"`)],
    music: { genre: input.tone === 'energetic' ? 'Upbeat instrumental' : 'Subtle instrumental', bpm: input.tone === 'energetic' ? 120 : 90 },
    cta: `What has your experience with ${topic} been? Share it in the comments.`,
    references: references.map(ref => ({ id: ref.id, title: ref.title, creatorName: ref.creatorName, platform: ref.platform, description: ref.description || '', topics: [...ref.topics] })),
    format: { ...input, referenceIds: references.map(ref => ref.id) },
  };
}

// Explicit, local template edits. Requests outside this small command set do not change the draft.
export function proposeEdit(request: string, draft: GeneratedContent): { response: CopilotMessage; proposedDraft: GeneratedContent | null } {
  const text = request.toLowerCase();
  const proposed: GeneratedContent = structuredClone(draft);
  const changes: DraftChange[] = [];
  const change = (field: string, before: string, after: string) => { if (before !== after) changes.push({ field, before, after }); };
  const topic = draft.references[0]?.topics[0] || draft.title;
  if (/hook/.test(text) && /short|concise/.test(text)) {
    proposed.hook = `${topic}: what's the practical takeaway?`;
    change('Hook', draft.hook, proposed.hook);
    proposed.scenes[0].dialogue = proposed.hook;
    proposed.script = proposed.scenes.map(scene => scene.dialogue).join('\n\n');
  } else if (/hook/.test(text) && /strong|controversial/.test(text)) {
    proposed.hook = `Is the usual advice about ${topic} missing the point?`;
    change('Hook', draft.hook, proposed.hook);
    proposed.scenes[0].dialogue = proposed.hook;
    proposed.script = proposed.scenes.map(scene => scene.dialogue).join('\n\n');
  } else if (/cta|call to action/.test(text)) {
    proposed.cta = `Which part of ${topic} would you like me to explore next? Tell me below.`;
    change('Call to action', draft.cta, proposed.cta);
  } else if (/cinematic|visual|second scene|scene 2/.test(text)) {
    proposed.visualDirection = { camera: 'Wide opening, then close-up', movement: 'Slow push-in', lighting: 'Directional, high-contrast light' };
    proposed.scenes[1].visual = `Film your own close-up demonstration of ${topic} with a slow push-in.`;
    change('Scene 2 visual', draft.scenes[1].visual, proposed.scenes[1].visual);
    change('Visual direction', JSON.stringify(draft.visualDirection), JSON.stringify(proposed.visualDirection));
  }
  const response: CopilotMessage = {
    id: `reply-${Date.now()}-${Math.random()}`, role: 'ai', timestamp: Date.now(),
    text: changes.length ? 'Template edit preview — review and approve before it changes your draft.' : 'This local template editor can suggest a shorter or stronger hook, a different CTA, or cinematic/scene 2 visuals. No changes were made.',
    changes: changes.length ? changes : undefined,
  };
  return { response, proposedDraft: changes.length ? proposed : null };
}

export const generationService = {
  generate: async (input: GenerationInput) => buildTemplate(input),
  chat: async (message: string, draft: GeneratedContent) => proposeEdit(message, draft),
};
