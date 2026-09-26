import { LLMUnderstandingData, AISuggestion } from '../types/mediaIntelligence';
import { mockLLMUnderstanding } from '../data/mockAnalysis';
import { mockSuggestions } from '../data/mockSuggestions';

export const mockLLMService = {
  async getUnderstanding(): Promise<LLMUnderstandingData> {
    // Simulate brief reasoning pause
    await new Promise((resolve) => setTimeout(resolve, 400));
    return JSON.parse(JSON.stringify(mockLLMUnderstanding));
  },

  async getSuggestions(): Promise<AISuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return JSON.parse(JSON.stringify(mockSuggestions));
  },
};
