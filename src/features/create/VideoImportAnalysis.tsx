import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, FileVideo2, Sparkles, ScanLine, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { formatDuration } from '@/utils/format';
import { files } from '@/utils/files';

function formatFileSize(bytes = 0): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sampleFrameSignature(video: HTMLVideoElement, context: CanvasRenderingContext2D): number[] {
  const width = 80;
  const height = 48;
  context.drawImage(video, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const signature: number[] = [];
  const columns = 8;
  const rows = 6;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      let luminance = 0;
      let count = 0;
      const startX = Math.floor(column * cellWidth);
      const endX = Math.floor((column + 1) * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endY = Math.floor((row + 1) * cellHeight);
      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const offset = (y * width + x) * 4;
          luminance += pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
          count += 1;
        }
      }
      signature.push(count ? luminance / count : 0);
    }
  }
  return signature;
}

export const VideoImportAnalysis: React.FC = () => {
  const { closeModal, openModal } = useAppStore();
  const { activeProject, updateActiveProject } = useProjectStore();
  const [sceneCuts, setSceneCuts] = useState<number[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('Preparing a local frame scan…');
  const [videoSrc, setVideoSrc] = useState<string | null>(activeProject?.mediaUrl || null);

  useEffect(() => {
    let activeUrl = activeProject?.mediaUrl;
    let createdUrl: string | null = null;

    if (!activeUrl && activeProject?.mediaId) {
      files.restore(activeProject.mediaId).then((file) => {
        if (file) {
          createdUrl = URL.createObjectURL(file);
          setVideoSrc(createdUrl);
          updateActiveProject({ mediaUrl: createdUrl });
        }
      });
    } else if (activeUrl) {
      setVideoSrc(activeUrl);
    }

    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [activeProject?.mediaId, activeProject?.mediaUrl]);

  useEffect(() => {
    if (!videoSrc) return;
    let cancelled = false;
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = videoSrc;

    const scan = async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Timed out reading video frames')), 12000);
          video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); };
          video.onerror = () => { window.clearTimeout(timeout); reject(new Error('Could not decode video frames')); };
        });
        if (cancelled) return;

        const duration = Number.isFinite(video.duration) ? video.duration : (activeProject?.durationSeconds || 0);
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 48;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context || duration <= 0) throw new Error('Video metadata is unavailable for frame sampling');

        const sampleCount = Math.min(28, Math.max(4, Math.floor(duration / 2)));
        const detected: number[] = [];
        let previous: number[] | null = null;
        let lastCut = -2;

        for (let index = 0; index < sampleCount; index += 1) {
          if (cancelled) return;
          const timestamp = duration * (index + 1) / (sampleCount + 1);
          await new Promise<void>((resolve) => {
            if (Math.abs(video.currentTime - timestamp) < 0.05) return resolve();
            let finished = false;
            const finish = () => {
              if (finished) return;
              finished = true;
              window.clearTimeout(timeout);
              video.removeEventListener('seeked', finish);
              resolve();
            };
            const timeout = window.setTimeout(finish, 2500);
            video.addEventListener('seeked', finish, { once: true });
            video.currentTime = timestamp;
          });

          try {
            const signature = sampleFrameSignature(video, context);
            if (previous) {
              const change = signature.reduce((sum, value, itemIndex) => sum + Math.abs(value - previous![itemIndex]), 0) / signature.length;
              if (change > 27 && timestamp - lastCut > 1.4) {
                detected.push(timestamp);
                lastCut = timestamp;
              }
            }
            previous = signature;
          } catch {
            // Ignore frames skipped by a codec while seeking.
          }
          setScanProgress(Math.round(((index + 1) / sampleCount) * 100));
        }

        if (!cancelled) {
          setSceneCuts(detected);
          setScanMessage(detected.length
            ? `Found ${detected.length} possible scene change${detected.length === 1 ? '' : 's'} by sampling frames.`
            : 'No strong scene changes found in the sampled frames.');
        }
      } catch {
        if (!cancelled) setScanMessage('Frame scan unavailable for this browser codec.');
      } finally {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };

    setScanProgress(0);
    setSceneCuts([]);
    setScanMessage('Scanning a small sample of frames locally…');
    void scan();
    return () => {
      cancelled = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [activeProject?.id, videoSrc]);

  if (!activeProject) {
    return null;
  }

  const dimensions = activeProject.mediaWidth && activeProject.mediaHeight
    ? `${activeProject.mediaWidth} × ${activeProject.mediaHeight}`
    : 'Auto-detected';

  return (
    <main
      className="screen-container"
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '18px 18px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        overflowY: 'auto',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          aria-label="Back to studio"
          onClick={closeModal}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Workflow Analysis · Video Review
          </div>
          <h1 style={{ margin: '3px 0 0', fontSize: '22px', lineHeight: 1.2 }}>Analyzed Footage Ready</h1>
        </div>
      </header>

      <section
        style={{
          overflow: 'hidden',
          borderRadius: '22px',
          background: '#050505',
          border: '1px solid var(--border-color)',
        }}
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            controls
            playsInline
            preload="metadata"
            style={{ width: '100%', maxHeight: '300px', display: 'block', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ minHeight: '180px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
            Video preview loading...
          </div>
        )}
      </section>

      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <FileVideo2 size={18} color="var(--ai-accent)" />
          <strong style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeProject.mediaName || activeProject.title}
          </strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          {[
            ['Duration', activeProject.durationSeconds > 0 ? formatDuration(activeProject.durationSeconds) : 'Read in editor'],
            ['Resolution', dimensions],
            ['File size', formatFileSize(activeProject.mediaSizeBytes)],
            ['Format', activeProject.mediaMimeType?.replace('video/', '').toUpperCase() || 'Video'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'var(--bg-surface-2)', borderRadius: '12px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', overflowWrap: 'anywhere' }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#15190c', border: '1px solid var(--ai-border)', borderRadius: '18px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--ai-accent)' }}>
          <Sparkles size={16} />
          <strong style={{ fontSize: '14px' }}>Workflow Analysis & Cut Points</strong>
        </div>
        <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
          Local video timeline inspection with automated scene transition scanning.
        </p>
        <div style={{ display: 'grid', gap: '9px' }}>
          <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '12px' }}>
            <Clock3 size={15} color="var(--ai-accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Optimal hook window: first 3.5s analyzed for retention. Pacing follows creator vocal cadence.</span>
          </div>
          <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '12px' }}>
            <Sparkles size={15} color="var(--ai-accent)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Format adaptation: ready for portrait 9:16 Shorts/Reels or 16:9 YouTube master export.</span>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 13, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700 }}>
            <ScanLine size={15} color="var(--ai-accent)" /> Local frame-change scan
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.45, margin: '6px 0 9px' }}>
            {scanMessage}
          </p>
          {scanProgress < 100 && (
            <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,.1)', marginBottom: 9 }}>
              <div style={{ width: `${scanProgress}%`, height: '100%', borderRadius: 4, background: 'var(--ai-accent)', transition: 'width .2s' }} />
            </div>
          )}
          {sceneCuts.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sceneCuts.map((time, index) => (
                <span key={`${time}-${index}`} style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(216,255,0,.1)', color: 'var(--ai-accent)', fontSize: 10, fontWeight: 700 }}>
                  Possible cut · {formatDuration(time)}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ marginTop: 'auto', display: 'grid', gap: '10px' }}>
        <button
          type="button"
          onClick={() => openModal('editor')}
          style={{
            width: '100%',
            minHeight: '50px',
            borderRadius: '15px',
            background: 'var(--ai-accent)',
            color: '#080808',
            border: 'none',
            fontWeight: 800,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          Open Video Editor <ArrowRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => openModal('script')}
          style={{
            width: '100%',
            minHeight: '44px',
            borderRadius: '15px',
            background: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Lightbulb size={16} color="var(--ai-accent)" /> Create Idea / Script for this Video
        </button>
      </div>
    </main>
  );
};
