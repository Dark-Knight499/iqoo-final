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
  ArrowLeft,
  Download,
  Code,
  Eye,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  FileCode
} from 'lucide-react';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useAppStore } from '@/shared/state/app.store';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import { Button } from '@/shared/components/Button';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';
import { legacyBackend, mapProfileResponseToCreatorUpdate, ProfilingAnalysis } from '@/services/legacyBackend';

const FEATURED_CREATORS = [
  { name: 'Ali Abdaal', slug: 'ali_abdaal', niche: 'Productivity & Creator Systems', initials: 'AA' },
  { name: 'Marques Brownlee', slug: 'marques_brownlee', niche: 'Consumer Tech & Gadgets', initials: 'MB' },
  { name: 'Dhruv Rathee', slug: 'dhruv_rathee', niche: 'Civic Education & Analysis', initials: 'DR' },
  { name: 'Technical Guruji', slug: 'technical_guruji', niche: 'Technology Reviews & Unboxing', initials: 'TG' },
  { name: 'Finance with Sharan', slug: 'finance_with_sharan', niche: 'Personal Finance & Wealth', initials: 'FS' },
  { name: 'Lex Fridman', slug: 'lex_fridman', niche: 'AI, Science & Long-form Deep Dives', initials: 'LF' },
];

function getCreatorSlug(name: string): string {
  const n = (name || '').toLowerCase().trim();
  if (!n) return 'ali_abdaal';
  if (n.includes('abdaal')) return 'ali_abdaal';
  if (n.includes('rathee')) return 'dhruv_rathee';
  if (n.includes('brownlee') || n.includes('mkbhd')) return 'marques_brownlee';
  if (n.includes('guruji')) return 'technical_guruji';
  if (n.includes('sharan')) return 'finance_with_sharan';
  if (n.includes('fridman')) return 'lex_fridman';
  return n.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'ali_abdaal';
}

export const ProfileView: React.FC = () => {
  const { creator, updateProfile } = useCreatorStore();
  const { setActiveTab, openModal, showToast } = useAppStore();
  const initials = (creator.name || 'Ali Abdaal').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

  const [isProfiling, setIsProfiling] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showSourcesEdit, setShowSourcesEdit] = useState(false);
  
  // Dossier interactive states
  const [activeDocTab, setActiveDocTab] = useState<'user' | 'hook' | 'comparison'>('user');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);

  const [sourceUrls, setSourceUrls] = useState({
    youtube: creator.profileSources?.youtube || '',
    substack: creator.profileSources?.substack || '',
    twitter: creator.profileSources?.twitter || '',
    linkedin: creator.profileSources?.linkedin || '',
  });

  // Attempt to load existing profile documents from backend if slug exists but documents not yet cached
  useEffect(() => {
    const slug = creator.profileDocuments?.creatorSlug || getCreatorSlug(creator.name);
    if (!creator.profileDocuments?.userMd && slug) {
      setIsLoadingDossier(true);
      legacyBackend.getProfile(slug)
        .then((res) => {
          if (res.user_md && res.hook_md) {
            updateProfile({
              name: creator.name || 'Ali Abdaal',
              niche: creator.niche || 'Productivity & Creator Systems',
              profileDocuments: {
                creatorSlug: res.creator_slug,
                analyzedAt: new Date().toISOString(),
                userMd: res.user_md,
                hookMd: res.hook_md,
                creatorComparisonMd: res.creator_comparison_md || undefined,
                catalogSummary: { cached_profile: 1 },
              },
            });
          }
        })
        .catch(() => {
          // Profile not yet generated on backend; silent fallback
        })
        .finally(() => {
          setIsLoadingDossier(false);
        });
    }
  }, [creator.name]);

  const handleSelectFeaturedCreator = async (fc: typeof FEATURED_CREATORS[0]) => {
    setIsLoadingDossier(true);
    setProfileError(null);
    try {
      const res = await legacyBackend.getProfile(fc.slug);
      if (res.user_md && res.hook_md) {
        updateProfile({
          name: fc.name,
          niche: fc.niche,
          profileDocuments: {
            creatorSlug: res.creator_slug,
            analyzedAt: new Date().toISOString(),
            userMd: res.user_md,
            hookMd: res.hook_md,
            creatorComparisonMd: res.creator_comparison_md || undefined,
            catalogSummary: { cached_profile: 1 },
          },
        });
        showToast(`Loaded ${fc.name}'s verified blueprint!`);
      }
    } catch {
      showToast(`Could not fetch dossier for ${fc.name}. Generating with default parameters...`);
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleDeepProfile = async () => {
    const targetName = creator.name.trim() || 'Ali Abdaal';
    setIsProfiling(true);
    setProfileError(null);

    try {
      const response = await legacyBackend.profile({
        creator_name: targetName,
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

  const getActiveContent = (): string => {
    if (!creator.profileDocuments) return '';
    if (activeDocTab === 'user') return creator.profileDocuments.userMd || '';
    if (activeDocTab === 'hook') return creator.profileDocuments.hookMd || '';
    if (activeDocTab === 'comparison') return creator.profileDocuments.creatorComparisonMd || '';
    return '';
  };

  const handleCopyMarkdown = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`Copied ${type === 'user' ? 'user.md' : type === 'hook' ? 'hook.md' : 'creator_comparison.md'} to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadMd = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  const analysis: ProfilingAnalysis | undefined = creator.profileDocuments?.analysis as ProfilingAnalysis | undefined;
  const activeContent = getActiveContent();
  const currentSlug = creator.profileDocuments?.creatorSlug || getCreatorSlug(creator.name);

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
          Creator Intelligence Profile
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-36px', padding: '0 12px', marginBottom: '16px' }}>
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
              {creator.name || 'Ali Abdaal'}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {creator.niche || 'Productivity & Creator Systems'}
            </span>
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

      {/* Quick Creator Blueprint Switcher */}
      <section style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Featured Creator Blueprints
          </span>
          <span style={{ fontSize: '10px', color: 'var(--ai-accent)', fontWeight: 600 }}>
            1-Tap Dossier Load
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {FEATURED_CREATORS.map((fc) => {
            const isSelected = currentSlug === fc.slug;
            return (
              <button
                key={fc.slug}
                onClick={() => handleSelectFeaturedCreator(fc)}
                disabled={isLoadingDossier}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#080808' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : 'var(--ai-soft)',
                    color: isSelected ? '#000' : 'var(--ai-accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 800,
                  }}
                >
                  {fc.initials}
                </span>
                <span>{fc.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Creator Performance Metrics 4-Grid */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <div
            style={{
              padding: '10px 8px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Views
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '2px 0' }}>
              {creator.metrics?.views || '2.4M'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700 }}>
              {creator.metrics?.viewsChange || '+14.2%'}
            </span>
          </div>

          <div
            style={{
              padding: '10px 8px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Watch
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '2px 0' }}>
              {creator.metrics?.watchTime || '4m 32s'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--ai-accent)', fontWeight: 700 }}>
              Top 5%
            </span>
          </div>

          <div
            style={{
              padding: '10px 8px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Engagement
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '2px 0' }}>
              {creator.metrics?.engagement || '6.8%'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700 }}>
              {creator.metrics?.engagementChange || '+0.8%'}
            </span>
          </div>

          <div
            style={{
              padding: '10px 8px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              30d Growth
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '2px 0' }}>
              {creator.metrics?.growth || '+8.5K'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 700 }}>
              Subscribers
            </span>
          </div>
        </div>
      </section>

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

      {/* PRODUCTION DOSSIER VIEWER (user.md, hook.md, creator_comparison.md) */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FileCode size={18} color="var(--ai-accent)" />
              <span>Production Dossier Studio</span>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Live analyzed markdown specifications used across all AI generation pipelines
            </span>
          </div>
          {creator.profileDocuments && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: '6px' }}>
              {new Date(creator.profileDocuments.analyzedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <Card variant="surface" padding="16px" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
          {/* Dossier Tabs & Action Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '10px',
            }}
          >
            {/* File Switcher Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                onClick={() => setActiveDocTab('user')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: activeDocTab === 'user' ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: activeDocTab === 'user' ? '#080808' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={13} />
                <span>user.md</span>
              </button>

              <button
                onClick={() => setActiveDocTab('hook')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: activeDocTab === 'hook' ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: activeDocTab === 'hook' ? '#080808' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Flame size={13} />
                <span>hook.md</span>
              </button>

              {creator.profileDocuments?.creatorComparisonMd && (
                <button
                  onClick={() => setActiveDocTab('comparison')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: activeDocTab === 'comparison' ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                    color: activeDocTab === 'comparison' ? '#080808' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BarChart3 size={13} />
                  <span>comparison.md</span>
                </button>
              )}
            </div>

            {/* Mode & Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              {/* View Mode Toggle: Rendered vs Raw */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  padding: '2px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <button
                  onClick={() => setViewMode('rendered')}
                  title="Rendered Rich Markdown View"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: viewMode === 'rendered' ? 'var(--bg-surface-3)' : 'transparent',
                    color: viewMode === 'rendered' ? 'var(--ai-accent)' : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={12} />
                  <span>Rendered</span>
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  title="Raw Markdown Source Code"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: viewMode === 'raw' ? 'var(--bg-surface-3)' : 'transparent',
                    color: viewMode === 'raw' ? 'var(--ai-accent)' : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Code size={12} />
                  <span>Raw .md</span>
                </button>
              </div>

              {/* Copy Markdown */}
              <button
                onClick={() => handleCopyMarkdown(activeContent, activeDocTab)}
                disabled={!activeContent}
                title="Copy full markdown to clipboard"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: activeContent ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copiedType === activeDocTab ? <Check size={12} color="#00DC82" /> : <Copy size={12} />}
                <span>{copiedType === activeDocTab ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Download Markdown */}
              <button
                onClick={() =>
                  handleDownloadMd(
                    activeContent,
                    activeDocTab === 'user'
                      ? 'user.md'
                      : activeDocTab === 'hook'
                      ? 'hook.md'
                      : 'creator_comparison.md'
                  )
                }
                disabled={!activeContent}
                title="Download this markdown file"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: activeContent ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Download size={12} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Quick Search within Markdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              marginBottom: '10px',
            }}
          >
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={`Search in ${activeDocTab === 'user' ? 'user.md' : activeDocTab === 'hook' ? 'hook.md' : 'comparison.md'} (e.g. Archetype, Tone, Retention)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '11px',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Dossier Content Body */}
          {isLoadingDossier ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="skeleton-shimmer" style={{ height: '24px', width: '60%', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ height: '14px', width: '75%', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ height: '80px', width: '100%', borderRadius: '8px', marginTop: '10px' }} />
              <div className="skeleton-shimmer" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
            </div>
          ) : activeContent ? (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              {viewMode === 'rendered' ? (
                <MarkdownRenderer content={activeContent} searchQuery={searchQuery} maxHeight="480px" />
              ) : (
                <pre
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    lineHeight: 1.6,
                    color: '#d4d4d4',
                    maxHeight: '480px',
                    overflowY: 'auto',
                  }}
                >
                  {activeContent}
                </pre>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
              }}
            >
              <FileCode size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                No {activeDocTab}.md cached yet
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                Run Deep Sync DNA or click one of the verified creator blueprints above to load their full dossier.
              </p>
              <Button
                variant="ai"
                size="sm"
                onClick={handleDeepProfile}
                disabled={isProfiling}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={isProfiling ? 'spin' : ''} />
                <span>Generate Dossier Now</span>
              </Button>
            </div>
          )}
        </Card>
      </section>

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
