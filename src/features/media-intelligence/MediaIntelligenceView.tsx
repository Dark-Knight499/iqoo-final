import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
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
  const { closeModal } = useAppStore();

  let screen: React.ReactNode;
  switch (currentScreen) {
    case 'import':
      screen = <ImportScreen />; break;
    case 'analysis':
      screen = <AnalysisScreen />; break;
    case 'ml-analysis':
      screen = <ContentAnalysisScreen />; break;
    case 'llm-understanding':
      screen = <AIUnderstandingScreen />; break;
    case 'suggestions':
      screen = <SuggestionsScreen />; break;
    case 'suggestion-preview':
      screen = <SuggestionPreviewScreen />; break;
    case 'catalog':
      screen = <CatalogScreen />; break;
    case 'content-detail':
      screen = <ContentDetailScreen />; break;
    default:
      screen = <ImportScreen />;
  }
  return <div>
    <div style={{ background: '#F7F8FA', display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 0' }}><button onClick={closeModal} aria-label="Exit Media Intelligence" style={{ border: '1px solid #E2E8F0', borderRadius: 8, background: '#FFFFFF', color: '#334155', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
      <ArrowLeft size={15} /> Exit
    </button></div>
    {screen}
  </div>;
};
