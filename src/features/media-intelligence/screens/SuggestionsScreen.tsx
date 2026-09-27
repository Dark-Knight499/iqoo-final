import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, FolderPlus } from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { mockSuggestions } from '../data/mockSuggestions';
import { SuggestionCard } from '../components/SuggestionCard';
import { AISuggestion } from '../types/mediaIntelligence';
import { useAppStore } from '@/shared/state/app.store';

export const SuggestionsScreen: React.FC = () => {
  const {
    navigateTo,
    goBack,
    selectSuggestion,
    approveSuggestion,
    approvedSuggestionIds,
    remoteSuggestions,
    importedMedia,
  } = useMediaIntelligenceStore();

  const { showToast } = useAppStore();
  const suggestions = remoteSuggestions ?? mockSuggestions;

  const handlePreview = (sug: AISuggestion) => {
    selectSuggestion(sug);
  };

  const handleApprove = (sug: AISuggestion) => {
    if (approveSuggestion(sug)) showToast(`Saved review draft: "${sug.title}"`);
  };

  const handleAddToStoryboard = (sug: AISuggestion) => {
    handleApprove(sug);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
          <span>Back</span>
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
          Step 5: Recommendations
        </span>
      </div>

      {/* Screen Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          {remoteSuggestions ? 'Backend clip suggestions' : 'Demo suggestions'}
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          {remoteSuggestions
            ? `${suggestions.length} text recommendations for ${importedMedia?.title || 'your video'}. No clip has been rendered.`
            : `${suggestions.length} sample recommendations for the demo video; these are not analysis of an uploaded file.`}
        </p>
      </div>

      {/* List of Suggestion Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        {suggestions.map((sug) => (
          <SuggestionCard
            key={sug.id}
            suggestion={sug}
            isApproved={approvedSuggestionIds.includes(sug.id)}
            onPreview={handlePreview}
            onApprove={handleApprove}
            onAddToStoryboard={handleAddToStoryboard}
          />
        ))}
      </div>

      {/* Action Footer: Navigate to Catalog */}
      <div style={{ position: 'sticky', bottom: '20px', marginTop: 'auto' }}>
        <button
          onClick={() => navigateTo('catalog')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
          }}
        >
          <FolderPlus size={18} />
          <span>Go to Content Catalog ({approvedSuggestionIds.length} Review Drafts)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
