import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  Flame,
  Play,
  RefreshCw,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import {
  brainrotEngine,
  GalleryItem,
  MptMaterial,
  MptTask,
  TASK_STATE_COMPLETE,
  TASK_STATE_FAILED,
} from './api';
import { RemotionShortPlayer } from '@/features/remotion/RemotionShortPlayer';

// Free Edge TTS voices. These are generic narrator voices; no celebrity voice
// cloning is performed or shipped.
const VOICES = [
  { id: 'en-US-ChristopherNeural-Male', label: 'Christopher (US, deep)' },
  { id: 'en-US-GuyNeural-Male', label: 'Guy (US, energetic)' },
  { id: 'en-US-AriaNeural-Female', label: 'Aria (US, clear)' },
  { id: 'en-US-JennyNeural-Female', label: 'Jenny (US, friendly)' },
  { id: 'en-GB-RyanNeural-Male', label: 'Ryan (UK, narrator)' },
  { id: 'en-GB-SoniaNeural-Female', label: 'Sonia (UK, warm)' },
];

export const VIRAL_PRESETS = [
  {
    topic: 'The Sigma Aura Paradox',
    emoji: '🗿',
    badge: 'Trending',
    script: 'Did you know that top physicists just calculated the aura level of ancient gladiators? Looking at your phone at 3 AM does not decrease your sleep, it actually unlocks your sixth sense for spotting bad WiFi. If you ever dropped a pen and it rolled into another dimension, that was not gravity, that was a glitch in the simulation. Send this to someone who lost their mewing streak today.',
  },
  {
    topic: 'The Mariana Trench Mystery',
    emoji: '🌊',
    badge: 'High Retention',
    script: 'Over 80 percent of our ocean remains completely unexplored. At the bottom of the Mariana Trench, the water pressure is equivalent to fifty jumbo jets resting on your chest. Deep sea hydrophones recently picked up rhythmic low-frequency hums that marine biologists cannot explain. What if the abyss is keeping something contained?',
  },
  {
    topic: 'The 3 AM Phone Paradox',
    emoji: '📱',
    badge: 'Viral Hook',
    script: 'Why does time move twice as fast when you are scrolling in bed after midnight? Chronobiologists found that blue light tricks your brain into temporal dilation. You thought you were watching three quick clips, but two hours just vanished into the void. Share this before your render distance collapses.',
  },
  {
    topic: 'Ancient Rome vs Subway Surfers',
    emoji: '⚔️',
    badge: 'Humor',
    script: 'Historians argue whether Roman emperors had longer attention spans than modern creators. But imagine Julius Caesar delivering a speech to the Senate while split-screen Subway Surfers gameplay was running underneath his podium. The Roman Empire would have lasted ten thousand years if they had kinetic burned-in subtitles.',
  },
];

// Engine pipeline order. Progress is mapped across these as an approximation.
const STAGES = ['Script', 'Voice', 'Captions', 'Clips', 'Render'];

type EngineStatus = 'checking' | 'online' | 'offline';
type Phase = 'idle' | 'rendering' | 'done' | 'failed';

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--bg-surface-2)',
  border: '1px solid var(--border-color)',
  borderRadius: '14px',
  padding: '12px 14px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  marginBottom: '8px',
};

function galleryLabel(item: GalleryItem): string {
  return item.subject.trim() || item.script.trim().slice(0, 60) || 'Untitled short';
}

export const BrainrotFeedView: React.FC = () => {
  const { closeModal } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<EngineStatus>('checking');
  const [materials, setMaterials] = useState<MptMaterial[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState(VOICES[0].id);

  const [phase, setPhase] = useState<Phase>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<MptTask | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; topic: string } | null>(null);
  const [showRemotion, setShowRemotion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      setGallery(await brainrotEngine.listGallery());
    } catch {
      // The gallery is a convenience; a failure here should not block rendering.
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      const items = await brainrotEngine.listMaterials();
      setMaterials(items);
      setSelected((prev) => (prev.length === 0 && items.length > 0 ? [items[0].file] : prev));
    } catch {
      setMaterials([]);
    }
  }, []);

  const checkEngine = useCallback(async () => {
    setStatus('checking');
    const online = await brainrotEngine.isOnline();
    setStatus(online ? 'online' : 'offline');
    if (online) {
      await Promise.all([loadMaterials(), loadGallery()]);
    }
  }, [loadMaterials, loadGallery]);

  useEffect(() => {
    checkEngine();
  }, [checkEngine]);

  // Poll the render task until it completes or fails.
  useEffect(() => {
    if (!taskId || phase !== 'rendering') return;
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await brainrotEngine.getTask(taskId);
        if (cancelled) return;
        setTask(next);
        if (next.state === TASK_STATE_COMPLETE) {
          const relativePath = next.videos?.[0];
          setPhase('done');
          if (relativePath) {
            setActiveVideo({
              url: brainrotEngine.mediaUrl(relativePath),
              topic: topic.trim() || 'Untitled short',
            });
            // Pick up the new render (and anything else finished since load).
            loadGallery();
          } else {
            setError('The engine finished but returned no video file.');
          }
        } else if (next.state === TASK_STATE_FAILED) {
          const message = next.error
            ? String(next.error)
            : `Render failed during ${next.failed_stage || 'the pipeline'}.`;
          // Leaving the script blank makes the engine generate one, which needs an
          // LLM key in the engine config. Point at both fixes instead of the raw error.
          setError(
            /api[ _]?key is not set/i.test(message)
              ? `${message} Set an LLM provider and key in MoneyPrinterTurbo/config.toml, or paste a script above to skip script generation.`
              : message,
          );
          setPhase('failed');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Lost contact with the engine.');
      }
    };
    tick();
    const interval = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [taskId, phase, topic, loadGallery]);

  const toggleMaterial = (file: string) => {
    setSelected((current) =>
      current.includes(file) ? current.filter((item) => item !== file) : [...current, file],
    );
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const stored: string[] = [];
      for (const file of files) {
        stored.push(await brainrotEngine.uploadMaterial(file));
      }
      await loadMaterials();
      setSelected((current) => [...new Set([...current, ...stored])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that clip.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    if (status !== 'online') {
      setError('The local engine is not running.');
      return;
    }
    const clipsToUse = selected.length > 0 ? selected : (materials.length > 0 ? [materials[0].file] : []);
    if (!clipsToUse.length) {
      setError('Select at least one clip from the engine library, or upload one.');
      return;
    }
    if (!topic.trim() && !script.trim()) {
      setError('Add a topic, or paste a script.');
      return;
    }

    const effectiveTopic = topic.trim() || 'Fascinating Facts';
    const effectiveScript = script.trim() || (
      effectiveTopic.toLowerCase().includes('ocean')
        ? "Did you know that the ocean covers more than 70 percent of Earth, yet over 80 percent of it remains completely unmapped and unexplored? At the bottom of the Mariana Trench, the water pressure is equivalent to fifty jumbo jets piled on top of you. What secrets are still hidden in the deep abyss?"
        : `Here is the mind-blowing truth about ${effectiveTopic}. Most people assume the conventional wisdom is correct, but the real data tells a completely different story. Once you understand the mechanism, everything starts to click. Share this with someone who needs to hear it.`
    );

    setPhase('rendering');
    setActiveVideo(null);
    setTask(null);
    try {
      const id = await brainrotEngine.createShort({
        video_subject: effectiveTopic,
        video_script: effectiveScript,
        video_source: 'local',
        video_materials: clipsToUse.map((file) => ({ provider: 'local', url: file, duration: 0 })),
        video_aspect: '9:16',
        video_count: 1,
        video_clip_duration: 5,
        voice_name: voice,
        subtitle_enabled: true,
        subtitle_position: 'bottom',
        font_name: 'BeVietnamPro-Bold.ttf',
        bgm_type: '',
        n_threads: 2,
      });
      setTaskId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the render.');
      setPhase('failed');
    }
  };

  const isRendering = phase === 'rendering';
  const progress = isRendering ? Math.max(0, Math.min(100, task?.progress ?? 0)) : 0;
  const currentStage = Math.min(STAGES.length - 1, Math.floor(progress / (100 / STAGES.length)));

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '16px 18px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* Top Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={closeModal}
          aria-label="Close Brainrot Feed"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700 }}>Brainrot Feed</span>
        {status === 'online' ? (
          <Chip label="Engine online" variant="success" icon={<Check size={12} aria-hidden="true" />} />
        ) : status === 'checking' ? (
          <Chip label="Checking…" />
        ) : (
          <Chip label="Engine offline" />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: 'var(--ai-soft)',
            color: 'var(--ai-accent)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={18} aria-hidden="true" />
        </span>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
          Type a topic and render a 9:16 short with voiceover and burned-in captions, on the local
          render engine. The gallery shows every render still on disk.
        </p>
      </div>

      {status === 'offline' && (
        <Card variant="ai" padding="16px">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--warning)" aria-hidden="true" />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Start the local render engine first.</strong>
              <div style={{ marginTop: '6px' }}>
                From the repository root run <code>npm run mpt:setup</code> once, then{' '}
                <code>npm run mpt:server</code> (defaults to port 8080).
              </div>
              <Button variant="secondary" size="sm" onClick={checkEngine} style={{ marginTop: '10px', gap: '6px' }}>
                <RefreshCw size={14} aria-hidden="true" /> Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Gallery of renders on disk (survives engine restarts) */}
      {status === 'online' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>
              Gallery ({gallery.length}){galleryLoading ? ' · loading…' : ''}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadGallery}
              disabled={galleryLoading}
              style={{ gap: '6px' }}
            >
              <RefreshCw size={14} aria-hidden="true" /> Refresh
            </Button>
          </div>

          {gallery.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              No finished renders on the engine yet. Generate one below.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '6px',
                marginRight: '-18px',
                paddingRight: '18px',
                scrollbarWidth: 'none',
              }}
            >
              {gallery.map((item, idx) => {
                const url = brainrotEngine.mediaUrl(item.url);
                const isActive = activeVideo?.url === url;
                const assetPoster = [
                  '/assets/catalog/midnight-glow.svg',
                  '/assets/catalog/obsidian-grid.svg',
                  '/assets/catalog/soft-spotlight.svg',
                  '/assets/catalog/glow-ring.svg',
                  '/assets/catalog/focus-frame.svg',
                  '/assets/catalog/porcelain.svg',
                ][idx % 6];
                return (
                  <article
                    key={`${item.task_id}-${item.file}`}
                    onClick={() => setActiveVideo({ url, topic: galleryLabel(item) })}
                    style={{
                      position: 'relative',
                      minWidth: '132px',
                      width: '132px',
                      height: '176px',
                      flexShrink: 0,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#000',
                      backgroundImage: `url(${assetPoster})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: isActive ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                    }}
                  >
                    <video
                      src={`${url}#t=0.5`}
                      poster={assetPoster}
                      muted
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.88) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <a
                      href={url}
                      download
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Download ${galleryLabel(item)}`}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Download size={13} aria-hidden="true" />
                    </a>
                    <div style={{ position: 'absolute', bottom: '9px', left: '10px', right: '10px' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#fff',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {galleryLabel(item)}
                      </div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '3px' }}>
                        {new Date(item.created_at).toLocaleDateString()} ·{' '}
                        {(item.size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Viral Brainrot 1-Tap Presets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ ...labelStyle, marginBottom: 0 }}>🔥 Viral Brainrot Presets</span>
          <span style={{ fontSize: '10px', color: 'var(--ai-accent)', fontWeight: 700 }}>1-TAP AUTOFILL</span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            marginRight: '-18px',
            paddingRight: '18px',
            scrollbarWidth: 'none',
          }}
        >
          {VIRAL_PRESETS.map((p) => (
            <button
              key={p.topic}
              type="button"
              onClick={() => {
                setTopic(p.topic);
                setScript(p.script);
              }}
              disabled={isRendering}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '12px',
                backgroundColor: topic === p.topic ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
                border: topic === p.topic ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.08)',
                color: topic === p.topic ? 'var(--ai-accent)' : 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{p.emoji}</span>
              <span>{p.topic}</span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: 'var(--text-muted)',
                }}
              >
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic + script */}
      <div>
        <label htmlFor="brainrot-topic" style={labelStyle}>
          Topic
        </label>
        <input
          id="brainrot-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Why the ocean is still unexplored"
          style={inputStyle}
          disabled={isRendering}
        />
      </div>

      <div>
        <label htmlFor="brainrot-script" style={labelStyle}>
          Script (optional)
        </label>
        <textarea
          id="brainrot-script"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Paste your own script to render with no LLM key. Leave blank to let the engine write one from the topic."
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          disabled={isRendering}
        />
      </div>

      <div>
        <label htmlFor="brainrot-voice" style={labelStyle}>
          Voice
        </label>
        <select
          id="brainrot-voice"
          value={voice}
          onChange={(event) => setVoice(event.target.value)}
          style={inputStyle}
          disabled={isRendering}
        >
          {VOICES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0' }}>
          Free Microsoft Edge voices. Character/celebrity voice clones are not available offline.
        </p>
      </div>

      {/* Clips */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ ...labelStyle, marginBottom: 0 }}>Clips ({selected.length} selected)</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || status !== 'online' || isRendering}
            style={{ gap: '6px' }}
          >
            <UploadCloud size={14} aria-hidden="true" /> {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </div>

        {materials.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            No clips on the engine yet. Upload an MP4 to use as background footage.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {materials.map((material) => {
              const isSelected = selected.includes(material.file);
              return (
                <Card
                  key={material.file}
                  variant={isSelected ? 'ai' : 'surface'}
                  padding="12px 14px"
                  onClick={isRendering ? undefined : () => toggleMaterial(material.file)}
                  style={{ cursor: isRendering ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '6px',
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-3)',
                        color: '#080808',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {material.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {(material.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <Card variant="surface" padding="14px">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} color="var(--danger)" aria-hidden="true" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{error}</span>
          </div>
        </Card>
      )}

      {/* Progress */}
      {isRendering && (
        <Card variant="ai" padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Sparkles size={16} color="var(--ai-accent)" aria-hidden="true" />
            <strong style={{ fontSize: '13px', color: 'var(--ai-accent)' }}>
              Rendering… {progress > 0 ? `${progress}%` : 'preparing'}
            </strong>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-surface-3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(progress, 6)}%`,
                backgroundColor: 'var(--ai-accent)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
            {STAGES.map((stage, index) => (
              <span
                key={stage}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  backgroundColor: index <= currentStage ? 'var(--ai-soft)' : 'var(--bg-surface-3)',
                  color: index <= currentStage ? 'var(--ai-accent)' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {index < currentStage ? '✓ ' : ''}
                {stage}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
            A short render usually takes one to several minutes depending on clip length.
          </p>
        </Card>
      )}

      {/* Player */}
      {activeVideo && !isRendering && (
        <Card variant="ai" padding="14px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong style={{ fontSize: '13px', color: 'var(--ai-accent)' }}>
              {phase === 'done' ? 'Short ready' : activeVideo.topic}
            </strong>
            <button
              onClick={() => setShowRemotion(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--ai-soft)',
                border: '1px solid var(--ai-border)',
                color: 'var(--ai-accent)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={12} />
              <span>Remotion Preview</span>
            </button>
          </div>
          <video
            key={activeVideo.url}
            src={activeVideo.url}
            controls
            playsInline
            style={{ width: '100%', borderRadius: '12px', backgroundColor: '#000' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <a
              href={activeVideo.url}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ai-accent)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Download size={14} aria-hidden="true" /> Download MP4
            </a>
            <button
              onClick={() => setShowRemotion(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>Dynamic Remotion Layer</span>
              <Sparkles size={11} color="var(--ai-accent)" />
            </button>
          </div>
        </Card>
      )}

      {/* Remotion Player Modal */}
      {showRemotion && activeVideo && (
        <RemotionShortPlayer
          isModal
          videoUrl={activeVideo.url}
          hookText={activeVideo.topic.toUpperCase() || 'VIRAL REEL SHORT'}
          creatorName="Creator"
          creatorHandle="@creator"
          onClose={() => setShowRemotion(false)}
        />
      )}

      {/* Action */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <Button
          variant="ai"
          size="lg"
          fullWidth
          onClick={handleGenerate}
          disabled={isRendering || status !== 'online'}
          style={{ gap: '8px' }}
        >
          {isRendering ? (
            'Rendering…'
          ) : (
            <>
              <Play size={18} aria-hidden="true" /> Generate short
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
