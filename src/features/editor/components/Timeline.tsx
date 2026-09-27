import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../editor.store';
import { formatDuration } from '@/utils/format';

interface TimelineProps {
  duration: number;
  trimStart?: number;
  trimEnd?: number;
  sourceName?: string;
  onSeek?: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  trimStart = 0,
  trimEnd,
  sourceName,
  onSeek,
}) => {
  const { currentTime, setCurrentTime } = useEditorStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalDuration = Math.max(0.1, duration);
  const effectiveEnd = trimEnd !== undefined ? trimEnd : totalDuration;
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  const startPercent = Math.min(100, Math.max(0, (trimStart / totalDuration) * 100));
  const endPercent = Math.min(100, Math.max(0, (effectiveEnd / totalDuration) * 100));

  const updateSeekFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = Number((ratio * totalDuration).toFixed(2));
    setCurrentTime(targetTime);
    onSeek?.(targetTime);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSeekFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSeekFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };
  const [hoverInfo, setHoverInfo] = useState<{ time: number; x: number; zone: string } | null>(null);

  const hookEndSec = Math.min(3, totalDuration * 0.25);
  const hookPercent = Math.min(25, Math.max(8, (hookEndSec / totalDuration) * 100));
  const ctaStartPercent = 85;

  const getZoneName = (time: number) => {
    if (time <= hookEndSec) return '⚡ 0-3s Hook Zone';
    if (time >= totalDuration * 0.85) return '🎯 Viral Climax & CTA';
    return '📈 Core Retention Body';
  };

  const handlePointerHover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = Number((ratio * totalDuration).toFixed(1));
    setHoverInfo({
      time: targetTime,
      x: e.clientX - rect.left,
      zone: getZoneName(targetTime),
    });
  };

  const jumpTo = (time: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, time));
    setCurrentTime(clamped);
    onSeek?.(clamped);
  };

  return (
    <div style={{ margin: '14px 0', userSelect: 'none' }}>
      {/* Quick Jump Marker Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => jumpTo(0)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(216, 255, 0, 0.12)',
            border: '1px solid var(--ai-border)',
            color: 'var(--ai-accent)',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⚡ Hook (0:00)
        </button>
        <button
          type="button"
          onClick={() => jumpTo(totalDuration * 0.5)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📈 Midpoint ({formatDuration(totalDuration * 0.5)})
        </button>
        <button
          type="button"
          onClick={() => jumpTo(totalDuration * 0.85)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🎯 CTA ({formatDuration(totalDuration * 0.85)})
        </button>
      </div>

      {/* Timecode row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ai-accent)', fontSize: '12px' }}>
            {formatDuration(currentTime)}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            ({getZoneName(currentTime)})
          </span>
        </div>
        <span style={{ fontSize: '10px' }}>
          {trimStart > 0 || (trimEnd !== undefined && trimEnd < totalDuration)
            ? `Trim: [${formatDuration(trimStart)} – ${formatDuration(effectiveEnd)}]`
            : 'Full Range'}
        </span>
        <span style={{ fontFamily: 'monospace' }}>{formatDuration(totalDuration)}</span>
      </div>

      {/* Interactive Timeline Container */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => {
          handlePointerMove(e);
          handlePointerHover(e);
        }}
        onPointerLeave={() => setHoverInfo(null)}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          padding: '6px 0',
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
        }}
      >
        {/* Hover / Drag Tooltip */}
        {hoverInfo && (
          <div
            style={{
              position: 'absolute',
              top: '-28px',
              left: `${hoverInfo.x}px`,
              transform: 'translateX(-50%)',
              backgroundColor: '#0c0e12',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              borderRadius: '6px',
              padding: '2px 8px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
              {formatDuration(hoverInfo.time)}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>{hoverInfo.zone}</span>
          </div>
        )}

        {/* Playhead Indicator Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${playheadPercent}%`,
            width: '2px',
            backgroundColor: '#D8FF00',
            boxShadow: '0 0 10px rgba(216, 255, 0, 0.8)',
            zIndex: 20,
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            transition: isDragging ? 'none' : 'left 0.05s linear',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#D8FF00',
              boxShadow: '0 0 6px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Video Track Strip with Retention Zones & Active Trim */}
        <div
          style={{
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#121418',
            marginBottom: '6px',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Waveform pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'repeating-linear-gradient(90deg, #18241e 0px, #18241e 18px, #20352b 18px, #20352b 36px)',
              opacity: 0.7,
            }}
          />

          {/* AI Retention Zone 1: Hook Window (0 - 3s) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: `${hookPercent}%`,
              background: 'linear-gradient(90deg, rgba(216, 255, 0, 0.22) 0%, rgba(216, 255, 0, 0.06) 100%)',
              borderRight: '1.5px dashed var(--ai-accent)',
              display: 'flex',
              alignItems: 'flex-start',
              padding: '3px 6px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: '8px',
                fontWeight: 800,
                color: 'var(--ai-accent)',
                letterSpacing: '0.4px',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              ⚡ HOOK
            </span>
          </div>

          {/* AI Retention Zone 2: CTA / Climax (Last 15%) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: `${100 - ctaStartPercent}%`,
              background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.06) 0%, rgba(244, 63, 94, 0.22) 100%)',
              borderLeft: '1.5px dashed #F43F5E',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '3px 6px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: '8px',
                fontWeight: 800,
                color: '#FB7185',
                letterSpacing: '0.4px',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              🎯 CTA
            </span>
          </div>

          {/* Active In/Out Trim Highlight Box */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${startPercent}%`,
              width: `${Math.max(2, endPercent - startPercent)}%`,
              backgroundColor: 'rgba(216, 255, 0, 0.12)',
              borderLeft: '2px solid var(--ai-accent)',
              borderRight: '2px solid var(--ai-accent)',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Track Title Label */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: '14px',
            }}
          >
            {sourceName || 'Video Track 1'}
          </div>
        </div>

        {/* Audio Track Strip */}
        <div
          style={{
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#0c0e12',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '14px',
              background:
                'repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 4px, transparent 4px, transparent 8px)',
              opacity: 0.65,
              borderRadius: '4px',
            }}
          />
          <span
            style={{
              position: 'absolute',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '9px',
              fontWeight: 700,
              paddingLeft: '6px',
            }}
          >
            AUDIO 1 · STEREO (48kHz)
          </span>
        </div>
      </div>
    </div>
  );
};
