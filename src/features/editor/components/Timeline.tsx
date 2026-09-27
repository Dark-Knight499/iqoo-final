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

  return (
    <div style={{ margin: '14px 0', userSelect: 'none' }}>
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
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--ai-accent)' }}>
          {formatDuration(currentTime)}
        </span>
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
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          padding: '6px 0',
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
        }}
      >
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

        {/* Video Track Strip with Active Trim Region */}
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
            }}
          />

          {/* Track Title Label */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
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
