import { AnalysisStage, AnalysisStageId } from '../types/mediaIntelligence';

export const INITIAL_STAGES: AnalysisStage[] = [
  { id: 'metadata', label: 'Media metadata', completed: false, active: true },
  { id: 'audio', label: 'Audio track & speech separation', completed: false, active: false },
  { id: 'transcript', label: 'Speech & transcript indexing', completed: false, active: false },
  { id: 'scenes', label: 'Scene & cut detection', completed: false, active: false },
  { id: 'speakers', label: 'Speaker diarization', completed: false, active: false },
  { id: 'objects', label: 'Object & entity recognition', completed: false, active: false },
  { id: 'topics', label: 'Topic & taxonomy extraction', completed: false, active: false },
  { id: 'moments', label: 'Key moments & retention peaks', completed: false, active: false },
  { id: 'style', label: 'Creator style & tone fingerprint', completed: false, active: false },
  { id: 'opportunities', label: 'Content opportunities & formats', completed: false, active: false },
];

export const mockAnalysisService = {
  getInitialStages(): AnalysisStage[] {
    return JSON.parse(JSON.stringify(INITIAL_STAGES));
  },

  async runAnalysis(
    onProgress: (stages: AnalysisStage[], percent: number) => void
  ): Promise<void> {
    const stages: AnalysisStage[] = JSON.parse(JSON.stringify(INITIAL_STAGES));

    for (let i = 0; i < stages.length; i++) {
      stages[i].active = true;
      const percent = Math.round(((i + 0.5) / stages.length) * 100);
      onProgress([...stages], percent);

      // Simulated processing time per module (approx 250ms per stage)
      await new Promise((resolve) => setTimeout(resolve, 260));

      stages[i].completed = true;
      stages[i].active = false;
      const finalStagePercent = Math.round(((i + 1) / stages.length) * 100);
      onProgress([...stages], finalStagePercent);
    }
  },
};
