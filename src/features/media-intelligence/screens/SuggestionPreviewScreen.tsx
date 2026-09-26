import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { primaryDemoVideo } from '../data/mockMedia';
import { mockSuggestions } from '../data/mockSuggestions';
import { SuggestionPreview } from '../components/SuggestionPreview';
import { useAppStore } from '@/shared/state/app.store';

export const SuggestionPreviewScreen: React.FC = () => {
  const {
    selectedSuggestion,
    importedMedia,
    goBack,
    navigateTo,
    approveSuggestion,
  } = useMediaIntelligenceStore();

  const { showToast } = useAppStore();

  const suggestion = selectedSuggestion || mockSuggestions[1];
  const media = importedMedia || primaryDemoVideo;

  const handleReject = () => {
    goBack();
  };

  const handleApproveAndCreate = () => {
    approveSuggestion(suggestion.id);
    showToast('Added to Project');
    navigateTo('catalog');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#F7F8FA',
        padding: '24px 20px 80px 20px',
        color: '#0F172A',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={goBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Suggestions</span>
        </button>

        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          Step 6: Preview & Plan
        </span>
      </div>

      {/* Suggestion Preview Component */}
      <SuggestionPreview
        suggestion={suggestion}
        media={media}
        onReject={handleReject}
        onApproveAndCreate={handleApproveAndCreate}
      />
    </div>
  );
};
