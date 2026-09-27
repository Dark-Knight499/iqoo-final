import React from 'react';
import { 
  Sparkles, 
  Edit3, 
  RotateCcw, 
  FolderPlus, 
  Film, 
  Music, 
  Camera, 
  Layers, 
  Check, 
  Copy, 
  Share2 
} from 'lucide-react';
import { GeneratedContent } from '../types/creatorIntelligence';

interface FinalViewProps {
  draft: GeneratedContent | null;
  loading: boolean;
  onEditInCopilot: () => void;
  onRegenerate: () => void;
  onSaveToProject: () => void;
}

export const FinalView: React.FC<FinalViewProps> = ({
  draft,
  loading,
  onEditInCopilot,
  onRegenerate,
  onSaveToProject,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid rgba(216, 255, 0, 0.2)',
            borderTopColor: 'var(--ai-accent, #D8FF00)',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Finalizing Content Document...
        </h4>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Assembling scenes, B-roll recommendations & sound design
        </span>
      </div>
    );
  }

  if (!draft) return null;

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(draft.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '20px' }}>
      {/* Document Header */}
      <div
        style={{
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--ai-soft, rgba(216, 255, 0, 0.12))',
              color: 'var(--ai-accent, #D8FF00)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Reference-based template blueprint
          </span>
          <span className="meta-separator" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ready to Shoot</span>
        </div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
          Your Content Plan
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Local template from selected sample catalog entries. Check claims and adapt before publishing.
        </p>
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong>Source references:</strong> {draft.references.map(ref => `${ref.title} — ${ref.creatorName} (${ref.platform})`).join('; ')}
        </div>
      </div>

      {/* Structured Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 1. CONTENT IDEA */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
            1. CONTENT IDEA
          </span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            "{draft.title}"
          </h2>
        </section>

        {/* 2. HOOK */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--ai-soft, rgba(216, 255, 0, 0.06))',
            border: '1px solid var(--ai-border, rgba(216, 255, 0, 0.25))',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ai-accent, #D8FF00)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
            2. HOOK (0:00 - 0:04)
          </span>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45 }}>
            "{draft.hook}"
          </p>
        </section>

        {/* 3. CORE MESSAGE */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
            3. CORE MESSAGE
          </span>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {draft.coreMessage}
          </p>
        </section>

        {/* 4. SCRIPT */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              4. SCRIPT OUTLINE (ADAPT BEFORE RECORDING)
            </span>
            <button
              onClick={handleCopyScript}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: copied ? '#00DC82' : 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {draft.script}
          </div>
        </section>

        {/* 5. STORYBOARD */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '14px' }}>
            5. STORYBOARD SCENE BREAKDOWN
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {draft.scenes.map((sc, idx) => (
              <div
                key={sc.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sc.label || `Scene ${idx + 1}`}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--ai-accent, #D8FF00)',
                      backgroundColor: 'var(--ai-soft, rgba(216, 255, 0, 0.1))',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    Duration: {sc.duration}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Visual: </strong>
                  {sc.visual}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Dialogue: </strong>
                  "{sc.dialogue}"
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Camera: </span>
                    {sc.camera}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Movement: </span>
                    {sc.movement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. VISUAL DIRECTION */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '12px' }}>
            6. VISUAL DIRECTION
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '13px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Camera Framing</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{draft.visualDirection.camera}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Motion & Movement</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{draft.visualDirection.movement}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Lighting Mood</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{draft.visualDirection.lighting}</span>
            </div>
          </div>
        </section>

        {/* 7. B-ROLL */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '10px' }}>
            7. B-ROLL LIST
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {draft.broll.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ai-accent, #D8FF00)' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. MUSIC & AUDIO */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>
            8. MUSIC & AUDIO DIRECTION
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ai-accent, #D8FF00)' }}>
              <Music size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{draft.music.genre}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recommended Tempo: {draft.music.bpm} BPM</div>
            </div>
          </div>
        </section>

        {/* 9. CTA */}
        <section
          style={{
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
            9. CALL TO ACTION
          </span>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ai-accent, #D8FF00)' }}>
            "{draft.cta}"
          </p>
        </section>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 0',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.3fr',
          gap: '10px',
          marginTop: 'auto',
        }}
      >
        <button
          onClick={onEditInCopilot}
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Edit3 size={15} />
          <span>Edit</span>
        </button>

        <button
          onClick={onRegenerate}
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          <span>Regenerate</span>
        </button>

        <button
          onClick={onSaveToProject}
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--ai-accent, #D8FF00)',
            border: 'none',
            color: '#000000',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(216, 255, 0, 0.25)',
          }}
        >
          <FolderPlus size={16} />
          <span>Save to Project</span>
        </button>
      </div>
    </div>
  );
};
