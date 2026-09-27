import React from 'react';
import { useEditorStore } from '../editor.store';
import { Type, Sparkles, Check, Palette } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const CaptionPanel: React.FC = () => {
  const {
    hasCaptions,
    toggleCaptions,
    captionStyle,
    setCaptionStyle,
    customCaptionText,
    setCustomCaptionText,
  } = useEditorStore();

  const styles: Array<{ id: 'tiktok_yellow' | 'minimal_white' | 'neon_cyber'; name: string; preview: string }> = [
    { id: 'tiktok_yellow', name: 'Viral Yellow', preview: 'BOLD VIRAL' },
    { id: 'minimal_white', name: 'Clean Pill', preview: 'Minimal Clean' },
    { id: 'neon_cyber', name: 'Neon Cyber', preview: 'CYBER GLOW' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        borderRadius: '18px',
        padding: '16px',
        marginTop: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Type size={16} color="var(--ai-accent)" />
          <strong style={{ fontSize: '14px', color: '#fff' }}>Dynamic Video Captions</strong>
        </div>
        <button
          onClick={toggleCaptions}
          style={{
            padding: '4px 10px',
            borderRadius: '10px',
            backgroundColor: hasCaptions ? 'var(--ai-soft)' : '#1a1a1a',
            border: hasCaptions ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.1)',
            color: hasCaptions ? 'var(--ai-accent)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {hasCaptions ? 'CAPTIONS ON' : 'OFF'}
        </button>
      </div>

      {/* Caption Content Textarea */}
      <div>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
          Overlay Text
        </label>
        <textarea
          rows={2}
          value={customCaptionText}
          onChange={(e) => setCustomCaptionText(e.target.value)}
          placeholder="Enter caption overlay..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#0c0e12',
            borderRadius: '12px',
            padding: '10px 12px',
            fontSize: '13px',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>

      {/* Style Presets */}
      <div>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
          Font & Badge Style
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {styles.map((s) => {
            const isSelected = captionStyle === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCaptionStyle(s.id)}
                style={{
                  padding: '8px 6px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--ai-soft)' : '#0e1014',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: isSelected ? 'var(--ai-accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800 }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.preview}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
