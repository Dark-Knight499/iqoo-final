import React from 'react';
import { X, ArrowLeft, Bot, FileText, Sparkles } from 'lucide-react';
import { 
  GenerateContentType, 
  GenerateDuration, 
  GenerateTone, 
  GenerateTab 
} from '../types/creatorIntelligence';
import { useCIStore } from '../state/creatorIntelligenceStore';
import { CopilotView } from '../components/CopilotView';
import { FinalView } from '../components/FinalView';
import { useAppStore } from '@/shared/state/app.store';

const CONTENT_TYPES: { id: GenerateContentType; label: string }[] = [
  { id: 'reel', label: 'Reel' },
  { id: 'short-video', label: 'Short video' },
  { id: 'youtube-video', label: 'YouTube video' },
  { id: 'linkedin-post', label: 'LinkedIn post' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'thread', label: 'Thread' },
];

const DURATIONS: { id: GenerateDuration; label: string }[] = [
  { id: '30s', label: '30 sec' },
  { id: '60s', label: '60 sec' },
  { id: '90s', label: '90 sec' },
  { id: 'custom', label: 'Custom' },
];

const TONES: { id: GenerateTone; label: string }[] = [
  { id: 'educational', label: 'Educational' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'conversational', label: 'Conversational' },
  { id: 'creator-style', label: "Creator's style" },
];

export const GenerateContentScreen: React.FC = () => {
  const {
    generateModalOpen,
    closeGenerateModal,
    activeGenerateTab,
    setActiveGenerateTab,
    generationInput,
    updateGenerationInput,
    startGeneration,
    generationLoading,
    copilotMessages,
    sendCopilotMessage,
    generatedDraft,
    storyboardItems,
  } = useCIStore();

  const { showToast } = useAppStore();

  if (!generateModalOpen) return null;

  const handleSaveToProject = () => {
    showToast('Saved content blueprint to Projects!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top App Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={closeGenerateModal}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 600,
            padding: '4px',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* TWO TABS: [AI COPILOT] [FINAL] */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-2)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={() => setActiveGenerateTab('copilot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeGenerateTab === 'copilot' ? 'var(--ai-accent, #D8FF00)' : 'transparent',
              color: activeGenerateTab === 'copilot' ? '#000000' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={14} />
            <span>AI COPILOT</span>
          </button>

          <button
            onClick={() => setActiveGenerateTab('final')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeGenerateTab === 'final' ? 'var(--ai-accent, #D8FF00)' : 'transparent',
              color: activeGenerateTab === 'final' ? '#000000' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={14} />
            <span>FINAL</span>
          </button>
        </div>

        <button
          onClick={closeGenerateModal}
          style={{
            background: 'var(--bg-surface-3)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Generation Config Strip (collapsible or slim) */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        {/* Content Type Picker */}
        <select
          value={generationInput.contentType}
          onChange={(e) => updateGenerationInput({ contentType: e.target.value as GenerateContentType })}
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        {/* Duration Picker */}
        <select
          value={generationInput.duration}
          onChange={(e) => updateGenerationInput({ duration: e.target.value as GenerateDuration })}
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {DURATIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>

        {/* Tone Picker */}
        <select
          value={generationInput.tone}
          onChange={(e) => updateGenerationInput({ tone: e.target.value as GenerateTone })}
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {TONES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <button
          onClick={startGeneration}
          disabled={generationLoading}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--ai-accent, #D8FF00)',
            color: '#000000',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Sparkles size={13} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeGenerateTab === 'copilot' ? (
          <CopilotView
            messages={copilotMessages}
            draft={generatedDraft}
            loading={generationLoading}
            onSendMessage={sendCopilotMessage}
            onViewFinal={() => setActiveGenerateTab('final')}
          />
        ) : (
          <FinalView
            draft={generatedDraft}
            loading={generationLoading}
            onEditInCopilot={() => setActiveGenerateTab('copilot')}
            onRegenerate={startGeneration}
            onSaveToProject={handleSaveToProject}
          />
        )}
      </div>
    </div>
  );
};
