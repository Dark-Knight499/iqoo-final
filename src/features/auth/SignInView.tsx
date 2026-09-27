import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { creatorStore } from '@/shared/state/creator.store';
import { getCreatorDossier } from '@/shared/data/creatorDossiers';
import { featuredCreators } from '@/features/onboarding/featuredCreators';

type OAuthProvider = 'google' | 'instagram' | 'tiktok' | 'twitter' | null;

interface CreatorAccount {
  name: string;
  handle: string;
  email: string;
  avatarText: string;
  color: string;
  subscribers: string;
  niche: string;
  platforms: string[];
  dossierSlug: string;
}

const PRESET_CREATORS: CreatorAccount[] = [
  {
    name: 'Ali Abdaal',
    handle: '@aliabdaal',
    email: 'ali@abdaal.com',
    avatarText: 'AA',
    color: '#D8FF00',
    subscribers: '5.4M YouTube Subs',
    niche: 'Productivity & Creator Systems',
    platforms: ['YouTube', 'Substack'],
    dossierSlug: 'ali_abdaal',
  },
  {
    name: 'Marques Brownlee',
    handle: '@mkbhd',
    email: 'marques@mkbhd.com',
    avatarText: 'MB',
    color: '#3B82F6',
    subscribers: '18.2M YouTube Subs',
    niche: 'Consumer Tech & Gadgets',
    platforms: ['YouTube', 'Twitter'],
    dossierSlug: 'marques_brownlee',
  },
  {
    name: 'Dhruv Rathee',
    handle: '@dhruvrathee',
    email: 'contact@dhruvrathee.com',
    avatarText: 'DR',
    color: '#10B981',
    subscribers: '24.1M YouTube Subs',
    niche: 'Civic Education & Analysis',
    platforms: ['YouTube', 'Twitter'],
    dossierSlug: 'dhruv_rathee',
  },
  {
    name: 'Finance with Sharan',
    handle: '@financewithsharan',
    email: 'sharan@financewithsharan.com',
    avatarText: 'FS',
    color: '#F59E0B',
    subscribers: '2.8M IG Followers',
    niche: 'Personal Finance & Wealth',
    platforms: ['Instagram', 'YouTube'],
    dossierSlug: 'finance_with_sharan',
  },
  {
    name: 'Lex Fridman',
    handle: '@lexfridman',
    email: 'lex@lexfridman.com',
    avatarText: 'LF',
    color: '#A855F7',
    subscribers: '4.2M YouTube Subs',
    niche: 'AI, Science & Long-form Dives',
    platforms: ['YouTube', 'Twitter', 'LinkedIn'],
    dossierSlug: 'lex_fridman',
  },
  {
    name: 'Technical Guruji',
    handle: '@technicalguruji',
    email: 'gaurav@technicalguruji.in',
    avatarText: 'TG',
    color: '#EF4444',
    subscribers: '23.5M YouTube Subs',
    niche: 'Technology Reviews & Unboxing',
    platforms: ['YouTube', 'Instagram'],
    dossierSlug: 'technical_guruji',
  },
];

export const SignInView: React.FC = () => {
  const { completeOnboarding, openModal, showToast } = useAppStore();
  const [activeProvider, setActiveProvider] = useState<OAuthProvider>(null);
  const [oauthStep, setOauthStep] = useState<'choose' | 'authorizing' | 'success'>('choose');
  const [selectedCreator, setSelectedCreator] = useState<CreatorAccount | null>(null);
  const [customName, setCustomName] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const startOAuth = (provider: OAuthProvider) => {
    setActiveProvider(provider);
    setOauthStep('choose');
  };

  const handleSelectAccount = (creator: CreatorAccount) => {
    setSelectedCreator(creator);
    setOauthStep('authorizing');

    // Simulate realistic OAuth handshake timing
    setTimeout(() => {
      // Step 2: Sync profile into creatorStore
      const dossier = getCreatorDossier(creator.name);
      creatorStore.beginNewWorkspace();
      creatorStore.updateProfile({
        name: creator.name,
        niche: creator.niche,
        platforms: creator.platforms,
        profileSources: { youtube: `https://youtube.com/${creator.handle}` },
        connectedSources: creator.platforms,
        profileDocuments: dossier ? {
          creatorSlug: dossier.slug,
          analyzedAt: new Date().toISOString(),
          userMd: dossier.userMd,
          hookMd: dossier.hookMd,
          catalogSummary: { youtube_videos: 40, analyzed_dossiers: 1 },
        } : undefined,
        metrics: {
          views: creator.subscribers.split(' ')[0] || '12.4M',
          viewsChange: '+18.2%',
          engagement: '7.4%',
          engagementChange: '+1.2%',
          watchTime: '5:42',
          growth: '+14%',
        },
      });
      creatorStore.saveWorkspace();

      setOauthStep('success');

      setTimeout(() => {
        completeOnboarding();
        showToast(`Authenticated as ${creator.name} via ${activeProvider?.toUpperCase()}`);
      }, 900);
    }, 1400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customAccount: CreatorAccount = {
      name: customName.trim(),
      handle: `@${customName.trim().toLowerCase().replace(/\s+/g, '')}`,
      email: `${customName.trim().toLowerCase().replace(/\s+/g, '')}@creator.ai`,
      avatarText: customName.slice(0, 2).toUpperCase(),
      color: '#D8FF00',
      subscribers: 'Custom Creator',
      niche: customNiche.trim() || 'Digital Content & AI',
      platforms: ['YouTube', 'Instagram'],
      dossierSlug: 'custom',
    };

    handleSelectAccount(customAccount);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(216, 255, 0, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Logo & Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            backgroundColor: 'var(--ai-soft)',
            border: '1px solid var(--ai-border)',
            color: 'var(--ai-accent)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          <Sparkles size={13} />
          <span>Creator AI Studio</span>
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
          }}
        >
          Creator Sign In
        </h1>
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            margin: '0 0 28px 0',
            maxWidth: '340px',
          }}
        >
          Connect your creator channels to unlock AI-assisted video production, voice DNA analysis, and automated publishing.
        </p>

        {/* OAuth Buttons Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Google / YouTube OAuth Button */}
          <button
            onClick={() => startOAuth('google')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Google G / YouTube icon */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#EA4335',
                  color: '#FFF',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                G
              </div>
              <span>Continue with Google / YouTube</span>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </button>

          {/* Instagram OAuth Button */}
          <button
            onClick={() => startOAuth('instagram')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                  color: '#FFF',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                📸
              </div>
              <span>Continue with Instagram</span>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </button>

          {/* TikTok OAuth Button */}
          <button
            onClick={() => startOAuth('tiktok')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 242, 234, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  color: '#00F2FE',
                  border: '1px solid #FF0050',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                🎵
              </div>
              <span>Continue with TikTok</span>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </button>

          {/* Twitter / X OAuth Button */}
          <button
            onClick={() => startOAuth('twitter')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  color: '#FFF',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                𝕏
              </div>
              <span>Continue with X (Twitter)</span>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              margin: '8px 0',
              color: 'var(--text-muted)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-color)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-color)' }} />
          </div>

          {/* Custom Account Input Option */}
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px',
                textAlign: 'center',
              }}
            >
              Enter custom creator channel details →
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                placeholder="Creator / Channel Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Niche (e.g. AI & Tech, Fitness, Finance)"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px',
                  borderRadius: 10,
                  backgroundColor: 'var(--ai-accent)',
                  color: '#080808',
                  fontSize: 12,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In as Custom Creator
              </button>
            </form>
          )}
        </div>

        {/* Security / Privacy notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 20,
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <Lock size={12} />
          <span>OAuth 2.0 Secure Local Sandbox Authentication</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIMULATED OAUTH MODAL (POPUP)                            */}
      {/* ========================================================= */}
      {activeProvider && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 24,
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              color: 'var(--text-primary)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: activeProvider === 'google' ? '#EA4335' : activeProvider === 'instagram' ? '#DD2A7B' : '#000',
                    color: '#FFF',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {activeProvider === 'google' ? 'G' : activeProvider === 'instagram' ? '📸' : activeProvider === 'tiktok' ? '🎵' : '𝕏'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                    Sign in with {activeProvider.toUpperCase()}
                  </h3>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    to continue to Creator AI Studio
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveProvider(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {oauthStep === 'choose' && (
              <>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Choose a verified creator channel to link. Your video transcripts, hook archetypes, and metrics will be synced locally.
                </p>

                {/* Creator List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PRESET_CREATORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleSelectAccount(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 14,
                        backgroundColor: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-color)',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ai-border)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-surface-3)',
                            border: `2px solid ${c.color}`,
                            color: c.color,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          {c.avatarText}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {c.name}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              {c.handle}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {c.subscribers} · {c.niche}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </button>
                  ))}
                </div>

                {/* Scopes notice */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-surface-2)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Permissions requested by Creator AI:
                  </div>
                  <div>✓ Read channel metrics, view retention, and audience demographics</div>
                  <div>✓ Ingest transcripts to extract Creator Hook DNA</div>
                  <div>✓ Authorize Composio automated publishing queue</div>
                </div>
              </>
            )}

            {oauthStep === 'authorizing' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px 10px',
                  gap: 16,
                  textAlign: 'center',
                }}
              >
                <Loader2 size={36} color="var(--ai-accent)" className="animate-spin" />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 800 }}>
                    Authenticating with {activeProvider.toUpperCase()} OAuth 2.0...
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Exchanging authorization code and syncing {selectedCreator?.name}'s Hook DNA and multi-platform analytics.
                  </p>
                </div>
              </div>
            )}

            {oauthStep === 'success' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px 10px',
                  gap: 16,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 220, 130, 0.15)',
                    color: '#00DC82',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 800 }}>
                    Connected as {selectedCreator?.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                    Workspace initialized. Launching Creator AI Studio...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
