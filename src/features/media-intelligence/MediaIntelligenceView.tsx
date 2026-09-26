import React from 'react';
import { useMediaIntelligenceStore } from './state/mediaIntelligenceStore';
import { ImportScreen } from './screens/ImportScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ContentAnalysisScreen } from './screens/ContentAnalysisScreen';
import { AIUnderstandingScreen } from './screens/AIUnderstandingScreen';
import { SuggestionsScreen } from './screens/SuggestionsScreen';
import { SuggestionPreviewScreen } from './screens/SuggestionPreviewScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ContentDetailScreen } from './screens/ContentDetailScreen';

export const MediaIntelligenceView: React.FC = () => {
  const { currentScreen } = useMediaIntelligenceStore();

  switch (currentScreen) {
    case 'import':
      return <ImportScreen />;
    case 'analysis':
      return <AnalysisScreen />;
    case 'ml-analysis':
      return <ContentAnalysisScreen />;
    case 'llm-understanding':
      return <AIUnderstandingScreen />;
    case 'suggestions':
      return <SuggestionsScreen />;
    case 'suggestion-preview':
      return <SuggestionPreviewScreen />;
    case 'catalog':
      return <CatalogScreen />;
    case 'content-detail':
      return <ContentDetailScreen />;
    default:
      return <ImportScreen />;
  }
};
