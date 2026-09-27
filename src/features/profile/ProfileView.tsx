import React from 'react';
import { Settings, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useAppStore } from '@/shared/state/app.store';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import { Button } from '@/shared/components/Button';

export const ProfileView: React.FC = () => {
  const { creator } = useCreatorStore();
  const { openModal } = useAppStore();
  const initials = creator.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

  return (
    <main className="screen-container">
      {/* Profile Cover Banner */}
      <div
         className="media-bg decorative-surface"
        style={{
          height: '170px',
          borderRadius: '26px',
          overflow: 'hidden',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            color: 'var(--ai-accent)',
            fontSize: '11px',
            fontWeight: 700,
            border: '1px solid var(--ai-border)',
          }}
        >
          <Sparkles size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Creator DNA · Synced
        </span>
        <button
          onClick={() => openModal('onboarding')}
          aria-label="Re-run onboarding"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
          title="Re-run Onboarding"
        >
          <Settings size={17} aria-hidden="true" />
        </button>
      </div>

      {/* Creator Info & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '-36px', padding: '0 12px', marginBottom: '24px' }}>
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
             background: 'linear-gradient(145deg, #34403a, #192522)',
             color: 'var(--ai-accent)',
             display: 'grid',
             placeItems: 'center',
             fontSize: '24px',
             fontWeight: 800,
            border: '4px solid var(--bg-primary)',
            boxShadow: 'var(--shadow-card)',
            flexShrink: 0,
          }}
         >{initials}</div>
        <div style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {creator.name}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{creator.niche}</span>
        </div>
      </div>

      {/* Creator DNA Card */}
      <section style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Creator DNA</h3>
        <Card variant="surface" padding="18px">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ai-accent)', fontWeight: 700, marginBottom: '4px' }}>
            Vocal Profile & Tone
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.45 }}>
            {creator.dna.voice}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {creator.dna.tone.map((t) => (
              <Chip key={t} label={t} variant="ai" />
            ))}
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Signature Opening Hooks
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "{creator.dna.hookStyle}"
            </p>
          </div>
        </Card>
      </section>

      {/* Proven Hook Patterns */}
      <section style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Proven Hook Formats</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {creator.hookPatterns.map((hp) => (
            <Card key={hp.id} variant="elevated" padding="14px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#fff' }}>{hp.title}</strong>
                <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                  {typeof hp.virality === 'number' ? `${hp.virality}% Virality` : 'Profile format'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>"{hp.example}"</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Connected Feeds & Channels */}
      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Configured Profile Sources</h3>
        <Card variant="surface" padding="14px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {creator.connectedSources.length ? creator.connectedSources.map((source) => (
              <div key={source} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-primary)' }}>{source}</span>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <CheckCircle2 size={13} /> Submitted
                </span>
              </div>
            )) : (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                No profile URLs were supplied. The backend used the creator name for lookup where supported.
              </p>
            )}
          </div>
        </Card>
      </section>

      {creator.profileDocuments && (
        <section style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Latest Profile Analysis</h3>
          <Card variant="surface" padding="14px">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
              Analyzed {new Date(creator.profileDocuments.analyzedAt).toLocaleString()}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {Object.entries(creator.profileDocuments.catalogSummary).map(([key, count]) => (
                <Chip key={key} label={`${key.replace(/_/g, ' ')}: ${count}`} />
              ))}
            </div>
            <details style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--ai-accent)' }}>View generated creator profile</summary>
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.5 }}>{creator.profileDocuments.userMd}</pre>
            </details>
            <details style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--ai-accent)' }}>View generated hook guide</summary>
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.5 }}>{creator.profileDocuments.hookMd}</pre>
            </details>
          </Card>
        </section>
      )}

      <Button
        variant="secondary"
        fullWidth
        onClick={() => openModal('onboarding')}
      >
        Re-Calibrate Creator DNA
      </Button>
    </main>
  );
};
