import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  ChevronRight,
  ArrowUpRight,
  Brain,
  Film,
  Flame,
  ArrowRight,
  Mic,
  Zap,
  X,
  Clock,
  Video,
  Scissors,
  Compass,
  User,
  BarChart3,
  Smartphone,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useProjectStore } from '@/shared/state/project.store';
import { Button } from '@/shared/components/Button';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { attachVideoToProject } from '@/shared/services/projectMedia';
import { formatDuration } from '@/utils/format';
import { MediaArt } from '@/shared/components/MediaArt';
import { brainrotEngine, GalleryItem } from '@/features/brainrot/api';
import { ciStore } from '@/features/creator-intelligence/state/creatorIntelligenceStore';

const ASSET_CATALOG_THUMBNAILS = [
  { url: '/assets/catalog/midnight-glow.svg', name: 'Midnight Glow' },
  { url: '/assets/catalog/obsidian-grid.svg', name: 'Obsidian Grid' },
  { url: '/assets/catalog/soft-spotlight.svg', name: 'Soft Spotlight' },
  { url: '/assets/catalog/glow-ring.svg', name: 'Glow Ring' },
  { url: '/assets/catalog/focus-frame.svg', name: 'Focus Frame' },
  { url: '/assets/catalog/porcelain.svg', name: 'Porcelain' },
];

const PRESET_AI_SHORTS = [
  {
    id: 'preset-sigma',
    title: 'The Secret Sigma Aura Paradox',
    asset: ASSET_CATALOG_THUMBNAILS[0],
    duration: '0:38',
  },
  {
    id: 'preset-ocean',
    title: 'Mariana Trench Deep Abyss Mystery',
    asset: ASSET_CATALOG_THUMBNAILS[1],
    duration: '0:45',
  },
  {
    id: 'preset-phone',
    title: 'The 3 AM Smartphone Screen Paradox',
    asset: ASSET_CATALOG_THUMBNAILS[2],
    duration: '0:32',
  },
  {
    id: 'preset-rome',
    title: 'Ancient Rome vs Subway Surfers Speed',
    asset: ASSET_CATALOG_THUMBNAILS[3],
    duration: '0:29',
  },
];

const PROMPT_SUGGESTIONS = [
  '⚡ 60s reel script',
  '🎬 Viral hook ideas',
  '📈 Trending topics',
  '🔍 Analyze my content',
];

/* ── Feature tile data ─────────────────────────────────── */
interface FeatureTile {
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverBorder: string;
  action: () => void;
}

export const HomeView: React.FC = () => {
  const { creator } = useCreatorStore();
  const { projects, setActiveProjectId } = useProjectStore();
  const { openCopilot, openModal, setActiveTab, showToast } = useAppStore();
  const [quickInput, setQuickInput] = useState('');
  const [reviewProjectId, setReviewProjectId] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [aiShorts, setAiShorts] = useState<GalleryItem[]>([]);
  const [showExpoModal, setShowExpoModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    brainrotEngine
      .listGallery()
      .then((items) => { if (!cancelled) setAiShorts(items); })
      .catch(() => { if (!cancelled) setAiShorts([]); });
    return () => { cancelled = true; };
  }, []);

  const reviewProject = projects.find((p) => p.id === reviewProjectId);
  const initials = creator.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'C';
  const firstName = creator.name.trim().split(/\s+/)[0] || 'Creator';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      openCopilot(quickInput);
      setQuickInput('');
    }
  };

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    if (projects.find((p) => p.id === id)?.mediaId) {
      openModal('editor');
    } else {
      setReviewProjectId(id);
    }
  };

  const handleAttach = async (id: string) => {
    setAttaching(true);
    setAttachError(null);
    try {
      if (await attachVideoToProject(id)) {
        setReviewProjectId(null);
        openModal('editor');
        showToast('Video attached to this project. Review any trim proposal before applying.');
      }
    } catch (error) {
      setAttachError(error instanceof Error ? error.message : 'Could not attach video.');
    } finally {
      setAttaching(false);
    }
  };

  /* Feature tiles — each opens a full-screen modal or tab */
  const features: FeatureTile[] = [
    {
      label: 'Creator Intelligence',
      desc: 'Hooks, comparisons & roadmap',
      icon: <Sparkles size={20} />,
      color: 'var(--ai-accent)',
      bgColor: 'var(--ai-soft)',
      hoverBorder: 'var(--ai-border)',
      action: () => openModal('creator-intelligence'),
    },
    {
      label: 'Media AI',
      desc: 'Scenes, quotes & key moments',
      icon: <Brain size={20} />,
      color: '#60A5FA',
      bgColor: 'rgba(37, 99, 235, 0.12)',
      hoverBorder: 'rgba(37, 99, 235, 0.4)',
      action: () => openModal('media-intelligence'),
    },
    {
      label: 'Video Studio',
      desc: 'Timeline, trim & export',
      icon: <Film size={20} />,
      color: '#C084FC',
      bgColor: 'rgba(168, 85, 247, 0.12)',
      hoverBorder: 'rgba(168, 85, 247, 0.4)',
      action: () => openModal('editor'),
    },
    {
      label: 'AI Prompter',
      desc: 'Smart-scroll teleprompter',
      icon: <Mic size={20} />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      hoverBorder: 'rgba(245, 158, 11, 0.4)',
      action: () => openModal('teleprompter'),
    },
    {
      label: 'Brainrot Feed',
      desc: 'Topic → vertical short',
      icon: <Flame size={20} />,
      color: '#F87171',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      hoverBorder: 'rgba(239, 68, 68, 0.4)',
      action: () => openModal('brainrot'),
    },
    {
      label: 'AI Clipping',
      desc: 'Find moments worth clipping',
      icon: <Scissors size={20} />,
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.12)',
      hoverBorder: 'rgba(52, 211, 153, 0.4)',
      action: () => openModal('clipping'),
    },
  ];

  return (
    <main className="screen-container" style={{ paddingBottom: '24px' }}>

      {/* ── Creator Header (Sticky Mobile Top Bar - Short & Compact) ───────── */}
      <div
        style={{
          position: 'sticky',
          top: '-14px',
          zIndex: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
          backgroundColor: 'rgba(8, 8, 8, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '12px',
        }}
      >
        <div
          onClick={() => openModal('creator-intelligence')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-3)',
                color: 'var(--ai-accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '13px',
                fontWeight: 800,
                border: '1.5px solid var(--ai-border)',
              }}
            >
              {initials}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#00DC82',
                border: '1.5px solid var(--bg-primary)',
              }}
            />
          </div>

          {/* Name & niche */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {creator.name}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--ai-soft)',
                  color: 'var(--ai-accent)',
                  border: '1px solid var(--ai-border)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {creator.niche}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowExpoModal(true)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#818CF8',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Scan with Expo Go on your phone"
          >
            <Smartphone size={12} color="#818CF8" />
            <span>Expo Go</span>
          </button>
          <button
            onClick={() => openModal('sign-in')}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Switch Creator Account via OAuth"
          >
            <Sparkles size={12} color="var(--ai-accent)" />
            <span>Switch</span>
          </button>
          <ThemeToggle />
          <button
            onClick={() => setActiveTab('profile')}
            aria-label="Profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            title="Profile & Settings"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* ── Greeting ──────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          {greeting}, {firstName}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          What do you want to create today?
        </p>
      </div>

      {/* ── AI Prompt Bar ─────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <form
          onSubmit={handleQuickSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--ai-border)',
            borderRadius: '16px',
            padding: '8px 8px 8px 14px',
          }}
        >
          <Sparkles size={18} color="var(--ai-accent)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask AI: scripts, hooks, ideas..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            aria-label="Send"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'var(--ai-accent)',
              color: '#080808',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowUpRight size={16} />
          </button>
        </form>

        {/* Prompt chips */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingTop: '8px',
            scrollbarWidth: 'none',
          }}
        >
          {PROMPT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => openCopilot(s)}
              style={{
                padding: '5px 11px',
                borderRadius: '999px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feature Tiles Grid ────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            margin: '0 0 12px',
          }}
        >
          Tools
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {features.map((f) => (
            <div
              key={f.label}
              onClick={f.action}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '100px',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = f.hoverBorder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: f.bgColor,
                    color: f.color,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {f.icon}
                </div>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Shorts Gallery ─────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: 0 }}>
              AI Shorts · {aiShorts.length > 0 ? aiShorts.length : 'Viral Showcase'}
            </h2>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--ai-accent)',
                backgroundColor: 'var(--ai-soft)',
                padding: '1px 6px',
                borderRadius: '999px',
                border: '1px solid var(--ai-border)',
              }}
            >
              Asset Themed
            </span>
          </div>
          <button
            onClick={() => openModal('brainrot')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ai-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: 0,
            }}
          >
            <span>Open Feed</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollbarWidth: 'none',
          }}
        >
          {(aiShorts.length > 0 ? aiShorts : PRESET_AI_SHORTS).map((item, idx) => {
            const isRendered = 'url' in item;
            const videoUrl = isRendered ? brainrotEngine.mediaUrl(item.url) : null;
            const label = isRendered
              ? item.subject.trim() || item.script.trim().slice(0, 60) || 'Untitled short'
              : item.title;
            const assetThumbnail = ASSET_CATALOG_THUMBNAILS[idx % ASSET_CATALOG_THUMBNAILS.length];

            return (
              <article
                key={isRendered ? `${item.task_id}-${item.file}` : item.id}
                onClick={() => openModal('brainrot')}
                style={{
                  minWidth: '136px',
                  width: '136px',
                  height: '188px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: '#050706',
                  backgroundImage: `url(${assetThumbnail.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                {/* Real video if rendered, with the asset as poster */}
                {videoUrl && (
                  <video
                    src={`${videoUrl}#t=0.5`}
                    poster={assetThumbnail.url}
                    muted
                    playsInline
                    preload="metadata"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.9,
                    }}
                  />
                )}

                {/* Vignette gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.88) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Top badges: Asset name and format */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: 'var(--ai-accent)',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(6px)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 220, 130, 0.3)',
                    }}
                  >
                    {assetThumbnail.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#fff',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      padding: '2px 5px',
                      borderRadius: '4px',
                    }}
                  >
                    9:16
                  </span>
                </div>

                {/* Bottom title & metadata */}
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#FFF',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>
                    {isRendered ? 'Tap to play' : `${item.duration} · High Retention`}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Recent Projects ───────────────────────────── */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: 0 }}>
            Projects · {projects.length}
          </h2>
          <button
            onClick={() => openModal('editor')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ai-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: 0,
            }}
          >
            Open Studio <ChevronRight size={14} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-color)',
              textAlign: 'center',
            }}
          >
            <Video size={28} color="var(--text-muted)" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              No projects yet. Start one from Creator Intelligence or the editor.
            </p>
            <Button variant="ai" size="sm" onClick={() => setActiveTab('create')}>
              <Plus size={14} /> New Project
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {projects.map((proj) => (
              <article
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                style={{
                  minWidth: '170px',
                  width: '170px',
                  height: '200px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--ai-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <MediaArt
                  mediaId={proj.mediaId}
                  kind="project"
                  label={proj.mediaId ? proj.mediaName || proj.title : proj.blueprint ? 'Blueprint' : 'Draft'}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: proj.mediaId ? 'rgba(0, 220, 130, 0.2)' : 'rgba(0, 0, 0, 0.7)',
                    border: proj.mediaId ? '1px solid rgba(0, 220, 130, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '9px',
                    color: proj.mediaId ? '#00DC82' : 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {proj.mediaId ? 'Ready' : proj.blueprint ? 'Blueprint' : 'Plan'}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', zIndex: 2 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#FFF',
                      marginBottom: '3px',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {proj.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} />
                    <span>
                      {proj.mediaId
                        ? formatDuration((proj.trimEndSeconds ?? proj.durationSeconds) - (proj.trimStartSeconds ?? 0))
                        : proj.durationSeconds ? `${proj.durationSeconds}s target` : 'Blueprint'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Project Review Dialog */}
        {reviewProject && (
          <div
            role="dialog"
            aria-label="Project review"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 150,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: reviewProject.blueprint ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
                        color: reviewProject.blueprint ? 'var(--ai-accent)' : 'var(--text-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {reviewProject.blueprint ? 'AI Blueprint' : 'Draft'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {reviewProject.aspectRatio}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                    {reviewProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setReviewProjectId(null)}
                  aria-label="Close dialog"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {reviewProject.description && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {reviewProject.description}
                </div>
              )}

              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>
                No video attached yet. Attach a recording or open the AI blueprint.
              </p>

              {reviewProject.blueprint && (
                <Button
                  variant="ai"
                  onClick={() => {
                    ciStore.openSavedBlueprint(reviewProject.blueprint!, reviewProject.id);
                    setReviewProjectId(null);
                    openModal('creator-intelligence');
                  }}
                  style={{ gap: '6px' }}
                >
                  <Sparkles size={16} />
                  <span>Refine Blueprint</span>
                </Button>
              )}

              {attachError && (
                <div role="alert" style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '12px' }}>
                  {attachError}
                </div>
              )}

              <Button
                variant="secondary"
                disabled={attaching}
                onClick={() => handleAttach(reviewProject.id)}
                style={{ gap: '6px' }}
              >
                {attaching ? 'Importing sample video…' : (
                  <>
                    <Video size={16} />
                    <span>Attach Video & Open in Studio</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── Native Mobile Floating Navigation Dock (Short & Compact) ────────────── */}
      <nav
        aria-label="Mobile Navigation Dock"
        style={{
          position: 'sticky',
          bottom: '10px',
          zIndex: 40,
          margin: '12px auto 0',
          width: 'fit-content',
          maxWidth: '260px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          borderRadius: '999px',
          backgroundColor: 'rgba(17, 17, 20, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
        }}
      >
        {[
          { label: 'Insights', icon: <BarChart3 size={14} />, action: () => setActiveTab('insights'), isPrimary: false },
          { label: 'Create', icon: <Plus size={15} />, action: () => setActiveTab('create'), isPrimary: true },
          { label: 'Profile', icon: <User size={14} />, action: () => setActiveTab('profile'), isPrimary: false },
        ].map((nav) => (
          <button
            key={nav.label}
            onClick={nav.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: nav.isPrimary ? 'var(--ai-accent)' : 'transparent',
              color: nav.isPrimary ? '#080808' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {nav.icon}
            <span>{nav.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Expo Go Modal ────────────────────────────────────── */}
      {showExpoModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowExpoModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: 'var(--shadow-modal)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowExpoModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818CF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Smartphone size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Launch with Expo Go
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.45 }}>
              Scan the QR code with the <strong>Expo Go</strong> app on your Android phone or Camera app on iOS to open the native mobile experience.
            </p>

            {/* QR Code Container */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '16px',
                display: 'inline-block',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <img
                src="/expo-qr.png"
                alt="Expo Go QR Code"
                style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }}
              />
            </div>

            {/* Server & Status Info */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '12px',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                textAlign: 'left',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Metro Bundler:</span>
                <span style={{ fontSize: '10px', color: '#00DC82', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00DC82' }} />
                  Active · Port 8081
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              >
                <code style={{ fontSize: '11px', color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
                  exp://10.2.36.170:8081
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('exp://10.2.36.170:8081');
                    showToast('Copied Expo Metro URL!');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 4px',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="http://10.2.36.170:8081"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
                <span>Web Preview</span>
              </a>
              <button
                onClick={() => setShowExpoModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--ai-accent)',
                  color: '#080808',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
