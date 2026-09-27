import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Play,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpRight,
  Brain,
  Film,
  ArrowRight,
  Mic,
  TrendingUp,
  Zap,
  X,
  FileText,
  Clock,
  Video,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useProjectStore } from '@/shared/state/project.store';
import { Button } from '@/shared/components/Button';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { ciStore } from '@/features/creator-intelligence/state/creatorIntelligenceStore';
import { attachVideoToProject } from '@/shared/services/projectMedia';
import { formatDuration } from '@/utils/format';
import { MediaArt } from '@/shared/components/MediaArt';

const PROMPT_SUGGESTIONS = [
  '⚡ 60s high-retention reel script',
  '🎬 Contrarian teardown hook',
  '📈 Explain on-device AI agents',
  '🔍 Analyze viral trends in tech',
];

export const HomeView: React.FC = () => {
  const { creator } = useCreatorStore();
  const { projects, setActiveProjectId } = useProjectStore();
  const { openCopilot, openModal, setActiveTab, showToast } = useAppStore();
  const [quickInput, setQuickInput] = useState('');
  const [reviewProjectId, setReviewProjectId] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);

  const reviewProject = projects.find((project) => project.id === reviewProjectId);
  const initials = creator.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';
  const firstName = creator.name.trim().split(/\s+/)[0] || 'Creator';

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Top daily hook from creator profile DNA
  const topHook = creator.hookPatterns?.[0] || {
    id: 'h1',
    title: 'The "Why Everyone Is Wrong" Teardown',
    example: 'Stop believing AI agents only run in giant cloud datacenters...',
    virality: 94,
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      openCopilot(quickInput);
      setQuickInput('');
    }
  };

  const handlePromptChipClick = (prompt: string) => {
    openCopilot(prompt);
  };

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    if (projects.find((project) => project.id === id)?.mediaId) {
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

  return (
    <main className="screen-container" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div
          onClick={() => setActiveTab('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-3)',
                color: 'var(--ai-accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '15px',
                fontWeight: 800,
                border: '2px solid var(--ai-border)',
                transition: 'transform 0.15s ease',
              }}
            >
              {initials}
            </div>
            {/* Active AI Status Indicator */}
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

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />
          <button
            onClick={() => openModal('script')}
            aria-label="Script Studio"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            title="Script Studio"
          >
            <SlidersHorizontal size={17} />
          </button>
          <button
            onClick={() => openModal('teleprompter')}
            aria-label="Teleprompter"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            title="AI Teleprompter"
          >
            <Mic size={17} />
          </button>
        </div>
      </div>

      {/* Greeting Headline */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {greeting}, {firstName} 👋
        </div>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          Turn what you know into <span style={{ color: 'var(--ai-accent)' }}>viral content</span>.
        </h1>
      </div>

      {/* Creator Context Metric Row */}
      {creator.metrics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '20px',
            padding: '12px 14px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.4px', display: 'block' }}>
              Views
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {creator.metrics.views}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00DC82' }}>
                {creator.metrics.viewsChange}
              </span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.4px', display: 'block' }}>
              Engagement
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {creator.metrics.engagement}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00DC82' }}>
                {creator.metrics.engagementChange}
              </span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.4px', display: 'block' }}>
              Growth
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {creator.metrics.growth}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ai-accent)' }}>
                monthly
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Command Bar */}
      <div style={{ marginBottom: '22px' }}>
        <form
          onSubmit={handleQuickSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--ai-border)',
            borderRadius: '18px',
            padding: '8px 8px 8px 14px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <Sparkles size={18} color="var(--ai-accent)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask Copilot: create script, hooks, or analyze media..."
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
            aria-label="Send prompt to Copilot"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'var(--ai-accent)',
              color: '#080808',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.15s ease',
            }}
          >
            <ArrowUpRight size={18} />
          </button>
        </form>

        {/* One-Tap Prompt Suggestions */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingTop: '8px',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
          }}
        >
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handlePromptChipClick(suggestion)}
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
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ai-border)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Daily AI Viral Hook Inspiration Card */}
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            borderRadius: '20px',
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--ai-accent)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'var(--ai-soft)',
                color: 'var(--ai-accent)',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid var(--ai-border)',
              }}
            >
              <Zap size={12} />
              DAILY VIRAL HOOK · {topHook.virality}% VIRALITY
            </span>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Tailored to {creator.niche.split('&')[0].trim()}
            </span>
          </div>

          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              "{topHook.example}"
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Pattern: <strong>{topHook.title}</strong> — Start with an unexpected contrast, then explain the mechanism.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={() => openCopilot(`Draft a high-retention video script using this hook: "${topHook.example}"`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--ai-accent)',
                color: '#080808',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
            >
              <Sparkles size={13} />
              <span>Draft this Hook</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>Explore Trends</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Studio Hub (Primary Workflow Navigation) */}
      <section style={{ marginBottom: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', margin: 0 }}>
            Creator AI Studio Hub
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 Core Capabilities</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {/* Tile 1: Creator Intelligence */}
          <div
            onClick={() => openModal('creator-intelligence')}
            style={{
              padding: '16px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--ai-soft)',
                  color: 'var(--ai-accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Trend Radar
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Discover trends & reference blueprints
              </div>
            </div>
          </div>

          {/* Tile 2: Media Intelligence */}
          <div
            onClick={() => openModal('media-intelligence')}
            style={{
              padding: '16px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.4)';
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
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  color: '#60A5FA',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Brain size={18} />
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Media AI
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Extract scenes, quotes & key moments
              </div>
            </div>
          </div>

          {/* Tile 3: AI Teleprompter */}
          <div
            onClick={() => openModal('teleprompter')}
            style={{
              padding: '16px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
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
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#F59E0B',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Mic size={18} />
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                AI Prompter
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Smart-scrolling speech recording
              </div>
            </div>
          </div>

          {/* Tile 4: Video Editor */}
          <div
            onClick={() => openModal('editor')}
            style={{
              padding: '16px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
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
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  color: '#C084FC',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Film size={18} />
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Video Studio
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                Timeline trim & multitrack export
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recent Projects
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} in workspace
            </span>
          </div>

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
            <span>Open Studio</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            style={{
              padding: '30px 20px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px dashed var(--border-color)',
              textAlign: 'center',
            }}
          >
            <Video size={32} color="var(--text-muted)" style={{ marginBottom: '10px', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
              No projects started yet
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Generate a blueprint in Creator Intelligence or start a clean project.
            </p>
            <Button variant="ai" size="sm" onClick={() => setActiveTab('create')}>
              <Plus size={14} /> Start New Project
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginRight: '-18px',
              paddingRight: '18px',
              scrollbarWidth: 'none',
            }}
          >
            {projects.map((proj) => (
              <article
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                style={{
                  minWidth: '190px',
                  width: '190px',
                  height: '220px',
                  borderRadius: '20px',
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

                {/* Aspect Ratio Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '3px 7px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(6px)',
                    fontSize: '10px',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {proj.aspectRatio || '9:16'}
                </div>

                {/* Status Indicator Pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
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
                  {proj.mediaId ? 'Ready to Cut' : proj.blueprint ? 'Blueprint' : 'Plan'}
                </div>

                {/* Bottom Card Details */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 2 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: '4px',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {proj.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    <span>
                      {proj.mediaId
                        ? formatDuration((proj.trimEndSeconds ?? proj.durationSeconds) - (proj.trimStartSeconds ?? 0))
                        : proj.durationSeconds ? `${proj.durationSeconds}s target` : 'Blueprint outline'}
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
                borderRadius: '24px',
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
                      {reviewProject.blueprint ? 'Saved AI Blueprint' : 'Draft Project Plan'}
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
                This project has no video file attached yet. You can attach a recording to edit it or open its AI blueprint.
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
                  <span>Refine Blueprint in Creator AI</span>
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

      {/* Primary New Project CTA */}
      <Button
        variant="ai"
        fullWidth
        size="lg"
        onClick={() => setActiveTab('create')}
        style={{ gap: '8px' }}
      >
        <Plus size={18} aria-hidden="true" />
        <span>New Project</span>
      </Button>
    </main>
  );
};

