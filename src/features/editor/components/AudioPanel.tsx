import React from 'react';
import { useEditorStore } from '../editor.store';
import { Volume2, VolumeX, Sparkles, Gauge, Zap } from 'lucide-react';

export const AudioPanel: React.FC = () => {
  const {
    audioNoiseReduction,
    toggleNoiseReduction,
    audioVolume,
    setAudioVolume,
    isMuted,
    toggleMute,
    playbackRate,
    setPlaybackRate,
  } = useEditorStore();

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        borderRadius: '18px',
        padding: '16px',
        marginTop: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={16} color="var(--ai-accent)" />
          <strong style={{ fontSize: '14px', color: '#fff' }}>Audio & Speech Optimization</strong>
        </div>
        <button
          onClick={toggleMute}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '10px',
            backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : '#0e1014',
            color: isMuted ? '#EF4444' : 'var(--text-muted)',
            border: isMuted ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {isMuted ? 'Muted' : 'Unmuted'}
        </button>
      </div>

      {/* AI FFT Denoise Filter Toggle */}
      <div
        onClick={toggleNoiseReduction}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0c0e12',
          borderRadius: '14px',
          padding: '12px 14px',
          cursor: 'pointer',
          border: audioNoiseReduction ? '1.5px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: audioNoiseReduction ? 'var(--ai-soft)' : '#181b20',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Sparkles size={16} color={audioNoiseReduction ? 'var(--ai-accent)' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: audioNoiseReduction ? 'var(--ai-accent)' : '#fff' }}>
              FFmpeg FFT Denoise (afftdn)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Removes room hum, fan noise, and background static
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: audioNoiseReduction ? 'var(--ai-soft)' : '#1a1a1a',
            color: audioNoiseReduction ? 'var(--ai-accent)' : 'var(--text-muted)',
          }}
        >
          {audioNoiseReduction ? 'ACTIVE' : 'OFF'}
        </span>
      </div>

      {/* Volume Slider */}
      <div style={{ backgroundColor: '#0c0e12', borderRadius: '14px', padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Master Video Volume</span>
          <span style={{ color: 'var(--ai-accent)', fontWeight: 700 }}>{isMuted ? 0 : audioVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : audioVolume}
          onChange={(e) => setAudioVolume(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
        />
      </div>

      {/* Playback Speed */}
      <div style={{ backgroundColor: '#0c0e12', borderRadius: '14px', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <Gauge size={13} color="var(--ai-accent)" />
          <span>Playback Speed</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPlaybackRate(s)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '8px',
                backgroundColor: playbackRate === s ? 'var(--ai-soft)' : '#181b20',
                border: playbackRate === s ? '1px solid var(--ai-accent)' : '1px solid transparent',
                color: playbackRate === s ? 'var(--ai-accent)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
