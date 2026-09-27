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

      {/* ── Creator Header ────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div
          onClick={() => openModal('creator-intelligence')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-3)',
                color: 'var(--ai-accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '16px',
                fontWeight: 800,
                border: '2px solid var(--ai-border)',
              }}
            >
              {initials}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#00DC82',
                border: '2px solid var(--bg-primary)',
              }}
            />
          </div>

          {/* Name & niche */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {creator.name}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--ai-soft)',
                  color: 'var(--ai-accent)',
                  border: '1px solid var(--ai-border)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {creator.niche}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
      {aiShorts.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: 0 }}>
              AI Shorts · {aiShorts.length}
            </h2>
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
              Open Feed <ChevronRight size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {aiShorts.map((item) => {
              const url = brainrotEngine.mediaUrl(item.url);
              const label = item.subject.trim() || item.script.trim().slice(0, 60) || 'Untitled short';
              return (
                <article
                  key={`${item.task_id}-${item.file}`}
                  onClick={() => openModal('brainrot')}
                  style={{
                    minWidth: '130px',
                    width: '130px',
                    height: '180px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundColor: '#000',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <video
                    src={`${url}#t=0.5`}
                    muted
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
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
                      }}
                    >
                      {label}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

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

      {/* ── Quick Nav (replaces bottom bar) ────────────── */}
      <section style={{ marginBottom: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: 'Insights', icon: <BarChart3 size={18} />, action: () => setActiveTab('insights') },
            { label: 'Create', icon: <Plus size={18} />, action: () => setActiveTab('create') },
            { label: 'Profile', icon: <User size={18} />, action: () => setActiveTab('profile') },
          ].map((nav) => (
            <button
              key={nav.label}
              onClick={nav.action}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '14px 8px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              {nav.icon}
              {nav.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};
