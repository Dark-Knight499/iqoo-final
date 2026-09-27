import { CopilotEditPlan } from '@/shared/types/project';
import { CreatorDNA } from '@/shared/types/creator';
import { VideoKnowledge } from '@/shared/types/video-knowledge';

export interface LLMGenerateOptions {
  projectKnowledge?: VideoKnowledge;
  creatorDNA?: CreatorDNA;
  context?: string;
}

export const llm = {
  /**
   * Generates context-aware responses, script outlines, or editing action plans
   */
  async generate(prompt: string, options: LLMGenerateOptions = {}): Promise<string> {
    const p = prompt.toLowerCase();
    if (p.includes('reel') || p.includes('edit') || p.includes('cut') || p.includes('short')) {
      return 'Local planning assistant: no footage was analyzed. Import a video to preview and trim it, or review a sample content blueprint in Creator Intelligence.';
    }
    if (p.includes('script') || p.includes('idea')) {
      const topic = prompt.replace(/^.*?script for:\s*/i, '').trim() || 'Your idea';
      return `# Script outline (local template): ${topic}
## Hook (0:00 - 0:04)
Open with a specific question or result about ${topic}.
## Value (0:05 - 0:18)
Explain why this topic matters to your audience using a fact you can verify.
## Proof (0:19 - 0:26)
Show your own example or footage. Add real evidence before publishing.
## Call to Action (0:27 - 0:30)
Ask viewers for their experience with ${topic}.`;
    }
    return `Local planning assistant received: "${prompt}". No footage was analyzed or edits applied.`;
  },

  /**
   * Generates a concrete structured Copilot edit plan with applyable steps
   */
  async generateEditPlan(prompt: string, options: LLMGenerateOptions = {}): Promise<CopilotEditPlan> {
    return {
      id: `plan_${Date.now()}`,
      prompt,
      summary: 'Suggested editing checklist (not applied). Review and execute edits manually; no automatic footage analysis was performed.',
      targetAspectRatio: '9:16',
      estimatedDuration: 30,
      steps: [
        {
          id: 'step_1',
          action: 'Highlight Extraction',
          description: 'Review the footage and mark a strong opening moment.',
          status: 'pending',
        },
        {
          id: 'step_2',
          action: 'Silence & Filler Removal',
          description: 'Find unwanted pauses and trim them manually.',
          status: 'pending',
        },
        {
          id: 'step_3',
          action: 'Smart 9:16 Reframe',
          description: 'Check portrait framing; automatic reframing is unavailable.',
          status: 'pending',
        },
        {
          id: 'step_4',
          action: 'Kinetic Captions',
          description: 'Create and verify captions in your video workflow; not generated here.',
          status: 'pending',
        },
        {
          id: 'step_5',
          action: 'Audio Normalization',
          description: 'Listen to the source audio and adjust it with a supported editor if needed.',
          status: 'pending',
        },
      ],
    };
  },
};
