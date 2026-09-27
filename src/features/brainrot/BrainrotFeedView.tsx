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
  MptMaterial,
  MptTask,
  TASK_STATE_COMPLETE,
  TASK_STATE_FAILED,
} from './api';

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

export const BrainrotFeedView: React.FC = () => {
  const { closeModal } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<EngineStatus>('checking');
  const [materials, setMaterials] = useState<MptMaterial[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState(VOICES[0].id);

  const [phase, setPhase] = useState<Phase>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<MptTask | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    try {
      setMaterials(await brainrotEngine.listMaterials());
    } catch {
      // A missing material list should not hide the engine status.
      setMaterials([]);
    }
  }, []);

  const checkEngine = useCallback(async () => {
    setStatus('checking');
    const online = await brainrotEngine.isOnline();
    setStatus(online ? 'online' : 'offline');
    if (online) await loadMaterials();
  }, [loadMaterials]);

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
          const first = next.videos?.[0];
          setResultUrl(first ? brainrotEngine.mediaUrl(first) : null);
          setPhase('done');
        } else if (next.state === TASK_STATE_FAILED) {
          setError(
            next.error ? String(next.error) : `Render failed during ${next.failed_stage || 'the pipeline'}.`,
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
  }, [taskId, phase]);

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
    if (!selected.length) {
      setError('Select at least one clip from the engine library, or upload one.');
      return;
    }
    if (!topic.trim() && !script.trim()) {
      setError('Add a topic, or paste a script.');
      return;
    }

    setPhase('rendering');
    setResultUrl(null);
    setTask(null);
    try {
      const id = await brainrotEngine.createShort({
        video_subject: topic.trim() || 'Untitled short',
        video_script: script.trim(),
        video_source: 'local',
        video_materials: selected.map((file) => ({ provider: 'local', url: file, duration: 0 })),
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
          render engine.
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
          placeholder="Paste your own script to render with no LLM key. Leave blank to let the engine write one from the topic (needs an LLM key in the engine config)."
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
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
            A short render usually takes one to several minutes depending on clip length.
          </p>
        </Card>
      )}

      {/* Result */}
      {phase === 'done' && resultUrl && (
        <Card variant="ai" padding="14px">
          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ai-accent)', marginBottom: '10px' }}>
            Short ready
          </strong>
          <video
            src={resultUrl}
            controls
            playsInline
            style={{ width: '100%', borderRadius: '12px', backgroundColor: '#000' }}
          />
          <a
            href={resultUrl}
            download
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--ai-accent)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
          >
            <Download size={14} aria-hidden="true" /> Download MP4
          </a>
        </Card>
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
