import React from 'react';
import { GeneratedContent } from '../types/creatorIntelligence';
import { Sparkles, Video, Film, Eye, Mic } from 'lucide-react';

interface DraftPreviewProps {
  draft: GeneratedContent | null;
  loading: boolean;
}

export const DraftPreview: React.FC<DraftPreviewProps> = ({ draft, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--ai-border, rgba(216, 255, 0, 0.2))',
            borderTopColor: 'var(--ai-accent, #D8FF00)',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Generating Content Plan...
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Synthesizing references into scenes, hooks & storyboard
        </span>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div
      style={{
        borderRadius: '16px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--ai-border, rgba(216, 255, 0, 0.2))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--ai-accent, #D8FF00)" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ai-accent, #D8FF00)' }}>
            Live Draft Preview
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {draft.scenes.length} Scenes
        </span>
      </div>

      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {draft.title}
        </h4>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-surface-2)',
            borderLeft: '3px solid var(--ai-accent, #D8FF00)',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}
        >
          "{draft.hook}"
        </div>
      </div>

      {/* Quick Scene Overview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Scenes Outline
        </span>
        {draft.scenes.slice(0, 3).map((sc) => (
          <div
            key={sc.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-2)',
              fontSize: '11px',
            }}
          >
            <span style={{ color: 'var(--ai-accent, #D8FF00)', fontWeight: 700, minWidth: '34px' }}>
              {sc.duration}
            </span>
            <span style={{ color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sc.visual}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
