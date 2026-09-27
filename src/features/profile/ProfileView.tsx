import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2,
  Globe,
  FileText, 
  ChevronDown, 
  ChevronUp,
  Video,
  Clock,
  Layers,
  Flame,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useAppStore } from '@/shared/state/app.store';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import { Button } from '@/shared/components/Button';
import { legacyBackend, mapProfileResponseToCreatorUpdate, ProfilingAnalysis } from '@/services/legacyBackend';

export const ProfileView: React.FC = () => {
  const { creator, updateProfile } = useCreatorStore();
  const { setActiveTab, openModal, showToast } = useAppStore();
  const initials = creator.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

  const [isProfiling, setIsProfiling] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showSourcesEdit, setShowSourcesEdit] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'user' | 'hook'>('user');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [sourceUrls, setSourceUrls] = useState({
    youtube: creator.profileSources?.youtube || '',
    substack: creator.profileSources?.substack || '',
    twitter: creator.profileSources?.twitter || '',
    linkedin: creator.profileSources?.linkedin || '',
  });

  // Attempt to load existing profile documents from backend if slug exists but documents not yet cached
  useEffect(() => {
    const slug = creator.profileDocuments?.creatorSlug || creator.name.toLowerCase().replace(/\s+/g, '_');
    if (!creator.profileDocuments?.userMd && slug) {
      legacyBackend.getProfile(slug)
        .then((res) => {
          if (res.user_md && res.hook_md) {
            updateProfile({
              profileDocuments: {
                creatorSlug: res.creator_slug,
                analyzedAt: new Date().toISOString(),
                userMd: res.user_md,
                hookMd: res.hook_md,
                catalogSummary: { cached_profile: 1 },
              },
            });
          }
        })
        .catch(() => {
          // Profile not yet generated on backend; silent fallback
        });
    }
  }, [creator.name]);

  const handleDeepProfile = async () => {
    if (!creator.name.trim()) {
      showToast('Please set a creator name first');
      return;
    }

    setIsProfiling(true);
    setProfileError(null);

    try {
      const response = await legacyBackend.profile({
        creator_name: creator.name.trim(),
        youtube_handle_or_url: sourceUrls.youtube.trim() || undefined,
        substack_handle_or_url: sourceUrls.substack.trim() || undefined,
        twitter_handle_or_url: sourceUrls.twitter.trim() || undefined,
        linkedin_handle_or_url: sourceUrls.linkedin.trim() || undefined,
        custom_instructions: creator.customInstructions || undefined,
        max_videos_to_analyze: 6,
        max_articles_to_analyze: 4,
      });

      const updated = mapProfileResponseToCreatorUpdate(response);
      updateProfile({
        ...updated,
        profileSources: sourceUrls,
      });

      showToast('Creator DNA & Dossiers successfully updated from backend!');
      setShowSourcesEdit(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Profiling failed. Ensure backend is running.';
      setProfileError(msg);
      showToast(msg);
    } finally {
      setIsProfiling(false);
    }
  };

  const handleCopyMarkdown = (text: string, type: 'user' | 'hook') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`Copied ${type === 'user' ? 'user.md' : 'hook.md'} to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const analysis: ProfilingAnalysis | undefined = creator.profileDocuments?.analysis as ProfilingAnalysis | undefined;

  return (
    <main className="screen-container" style={{ paddingBottom: '100px' }}>
      {/* Sticky Native Mobile Navigation Bar (Short & Compact) */}
      <div
        style={{
          position: 'sticky',
          top: '-14px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
          backgroundColor: 'rgba(8, 8, 8, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveTab('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 700,
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </button>

        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Creator Profile
        </span>

        <button
          onClick={() => openModal('sign-in')}
          style={{
            padding: '6px 10px',
            borderRadius: '10px',
            backgroundColor: 'var(--ai-soft)',
            color: 'var(--ai-accent)',
            fontSize: '11px',
            fontWeight: 800,
            border: '1px solid var(--ai-border)',
            cursor: 'pointer',
          }}
        >
          Switch
        </button>
      </div>

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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Sparkles size={12} />
          {creator.profileDocuments ? 'Creator DNA · Synced with Backend' : 'Creator Profile'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => openModal('sign-in')}
            aria-label="Switch Creator / OAuth Sign In"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              color: 'var(--ai-accent)',
              border: '1px solid var(--ai-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
            }}
            title="Switch Creator Account via OAuth"
          >
            <Sparkles size={13} />
            <span>Switch Account</span>
          </button>
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
              cursor: 'pointer',
              border: 'none',
            }}
            title="Re-run Onboarding"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Creator Info & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-36px', padding: '0 12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          >
            {initials}
          </div>
          <div style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {creator.name}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{creator.niche}</span>
          </div>
        </div>

        <button
          onClick={handleDeepProfile}
          disabled={isProfiling}
          style={{
            marginTop: '28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: isProfiling ? 'var(--bg-surface-2)' : 'var(--ai-soft)',
            border: '1px solid var(--ai-border)',
            color: 'var(--ai-accent)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isProfiling ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={13} className={isProfiling ? 'spin' : ''} />
          <span>{isProfiling ? 'Analyzing...' : 'Deep Sync DNA'}</span>
        </button>
      </div>

      {/* Sync Status / Error Banner */}
      {profileError && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '12px',
            lineHeight: 1.4,
            marginBottom: '20px',
          }}
        >
          <strong>Profiling Notice:</strong> {profileError}
        </div>
      )}

      {/* Profiling Progress Bar if running */}
      {isProfiling && (
        <Card variant="surface" padding="16px" style={{ marginBottom: '22px', border: '1px solid var(--ai-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ai-accent)' }}>
              Analyzing YouTube videos, Shorts & transcripts...
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mining voice & hook patterns</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#202020', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: '80%',
                backgroundColor: 'var(--ai-accent)',
                animation: 'pulse 1s infinite',
              }}
            />
          </div>
        </Card>
      )}

      {/* Channel Source Manager Accordion */}
      <section style={{ marginBottom: '22px' }}>
        <div
          onClick={() => setShowSourcesEdit(!showSourcesEdit)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color="var(--ai-accent)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Channel & Feeds Source Links
            </span>
            {creator.connectedSources.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                ({creator.connectedSources.length} connected)
              </span>
            )}
          </div>
          {showSourcesEdit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {showSourcesEdit && (
          <div
            style={{
              padding: '16px',
              borderRadius: '0 0 14px 14px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderTop: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <Video size={14} color="#FF0000" /> YouTube Handle or Channel URL
              </label>
              <input
                type="text"
                value={sourceUrls.youtube}
                onChange={(e) => setSourceUrls({ ...sourceUrls, youtube: e.target.value })}
                placeholder="youtube.com/@channel or @channel"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <Share2 size={14} color="#1DA1F2" /> X / Twitter Handle
              </label>
              <input
                type="text"
                value={sourceUrls.twitter}
                onChange={(e) => setSourceUrls({ ...sourceUrls, twitter: e.target.value })}
                placeholder="@username or x.com/username"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <Globe size={14} color="#0A66C2" /> LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={sourceUrls.linkedin}
                onChange={(e) => setSourceUrls({ ...sourceUrls, linkedin: e.target.value })}
                placeholder="linkedin.com/in/username"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <FileText size={14} color="#FF6719" /> Substack Publication URL (Optional)
              </label>
              <input
                type="text"
                value={sourceUrls.substack}
                onChange={(e) => setSourceUrls({ ...sourceUrls, substack: e.target.value })}
                placeholder="publication.substack.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <Button
              variant="ai"
              size="sm"
              onClick={handleDeepProfile}
              disabled={isProfiling}
              style={{ marginTop: '6px', gap: '6px' }}
            >
              <RefreshCw size={13} className={isProfiling ? 'spin' : ''} />
              <span>Save & Run Deep Analysis</span>
            </Button>
          </div>
        )}
      </section>

      {/* Creator DNA Card */}
      <section style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Creator DNA</h3>
        <Card variant="surface" padding="18px">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ai-accent)', fontWeight: 700, marginBottom: '4px' }}>
            Vocal Profile & Tone
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.45 }}>
            {creator.dna.voice || 'Voice not yet calibrated. Click "Deep Sync DNA" to analyze your content.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {creator.dna.tone.length > 0 ? (
              creator.dna.tone.map((t) => (
                <Chip key={t} label={t} variant="ai" />
              ))
            ) : (
              <Chip label="Energetic" variant="ai" />
            )}
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Signature Opening Hooks
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "{creator.dna.hookStyle || 'Start with high-velocity curiosity gap...'}"
            </p>
          </div>
        </Card>
      </section>

      {/* Detailed Analysis Breakdown (Video length, thumbnails, frequent phrases) */}
      {analysis && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Deep Mined Intelligence
          </h3>

          {/* Grid of Video Length & Thumbnail Strategies */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            {/* Video Pacing & Duration */}
            <Card variant="surface" padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <Clock size={16} color="var(--ai-accent)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Video Length & Pacing
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {analysis.video_length.average_duration_formatted}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Recommended range: {analysis.video_length.recommended_duration_range}
              </p>

              {/* Shorts vs Long-Form bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Shorts: {analysis.video_length.shorts_ratio_percentage}%</span>
                  <span>Long-form: {analysis.video_length.long_form_ratio_percentage}%</span>
                </div>
                <div style={{ display: 'flex', height: '6px', borderRadius: '999px', overflow: 'hidden', backgroundColor: 'var(--bg-surface-3)' }}>
                  <div style={{ width: `${analysis.video_length.shorts_ratio_percentage}%`, backgroundColor: '#FF4560' }} />
                  <div style={{ width: `${analysis.video_length.long_form_ratio_percentage}%`, backgroundColor: '#2563EB' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {analysis.video_length.pacing_breakdown}
              </p>
            </Card>

            {/* Thumbnail Strategy */}
            <Card variant="surface" padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <Layers size={16} color="#00DC82" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Thumbnail Strategy
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {analysis.thumbnail_strategy.visual_style}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.35 }}>
                Expression: {analysis.thumbnail_strategy.facial_expression_patterns} · {analysis.thumbnail_strategy.text_density}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {analysis.thumbnail_strategy.color_palette_dominance.map((color) => (
                  <Chip key={color} label={color} />
                ))}
              </div>
            </Card>
          </div>

          {/* Authentic Spoken Phrases ("What User Says Often") */}
          {analysis.frequent_spoken_phrases && analysis.frequent_spoken_phrases.length > 0 && (
            <Card variant="surface" padding="16px" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <MessageSquare size={16} color="var(--ai-accent)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Signature Vocal Phrases & Mannerisms
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                Extracted verbatim from video transcripts & speech cadence:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.frequent_spoken_phrases.slice(0, 5).map((phrase, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff', display: 'block', marginBottom: '2px' }}>
                        "{phrase.phrase}"
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Context: {phrase.sample_context}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--ai-soft)',
                        color: 'var(--ai-accent)',
                        fontSize: '10px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {phrase.category} · {phrase.count}x
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      )}

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

      {/* Interactive Dossier Viewer (user.md and hook.md) */}
      {creator.profileDocuments && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Generated Production Dossiers
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Analyzed {new Date(creator.profileDocuments.analyzedAt).toLocaleDateString()}
            </span>
          </div>

          <Card variant="surface" padding="16px">
            {/* Dossier Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <button
                onClick={() => setActiveDocTab('user')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: activeDocTab === 'user' ? 'var(--ai-accent)' : 'transparent',
                  color: activeDocTab === 'user' ? '#080808' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={13} />
                <span>user.md (Creator Persona)</span>
              </button>

              <button
                onClick={() => setActiveDocTab('hook')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: activeDocTab === 'hook' ? 'var(--ai-accent)' : 'transparent',
                  color: activeDocTab === 'hook' ? '#080808' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Flame size={13} />
                <span>hook.md (Viral Formulas)</span>
              </button>

              <div style={{ marginLeft: 'auto' }}>
                <button
                  onClick={() => handleCopyMarkdown(activeDocTab === 'user' ? creator.profileDocuments!.userMd : creator.profileDocuments!.hookMd, activeDocTab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copiedType === activeDocTab ? <Check size={12} color="#00DC82" /> : <Copy size={12} />}
                  <span>{copiedType === activeDocTab ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
              </div>
            </div>

            {/* Dossier Text Container */}
            <div
              style={{
                maxHeight: '360px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid var(--border-color)',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  lineHeight: 1.55,
                  color: 'var(--text-secondary)',
                }}
              >
                {activeDocTab === 'user' ? creator.profileDocuments.userMd : creator.profileDocuments.hookMd}
              </pre>
            </div>
          </Card>
        </section>
      )}

      <Button
        variant="secondary"
        fullWidth
        onClick={() => openModal('onboarding')}
        style={{ marginTop: '8px' }}
      >
        Re-Calibrate Creator DNA
      </Button>
    </main>
  );
};
