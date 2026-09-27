import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wand2,
  Sparkles,
  Check,
  Play,
  Pause,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import {
  useEditorStore,
  EFFECT_PRESETS,
  type EffectPresetId,
} from '@/features/editor/editor.store';
import { files } from '@/utils/files';

export const EffectsStudioView: React.FC = () => {
  const { closeModal, openModal, showToast } = useAppStore();
  const { activeProject } = useProjectStore();
  const { selectEffect, selectedEffect, filterCss } = useEditorStore();

  const [activeEffect, setActiveEffect] = useState<EffectPresetId>(selectedEffect || 'cinematic_dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load project video or fallback demo video
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    if (activeProject?.mediaUrl) {
      setMediaUrl(activeProject.mediaUrl);
      return;
    }

    if (activeProject?.mediaId) {
      files.restore(activeProject.mediaId).then((source) => {
        if (cancelled || !source) return;
        url = URL.createObjectURL(source);
        setMediaUrl(url);
      }).catch(() => {});
    } else {
      // Default demo video for immediate effect inspection
      setMediaUrl('/legacy/static-analysis/demo_video/video_20260926_233851.mp4');
    }

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [activeProject]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const currentPreset = EFFECT_PRESETS.find((p) => p.id === activeEffect);
  const appliedFilterCss = currentPreset && currentPreset.id !== 'none' ? currentPreset.filterCss : 'none';

  const handleApplyAndEdit = () => {
    selectEffect(activeEffect);
    showToast(`Applied "${currentPreset?.name}" to editor!`);
    openModal('editor');
  };

  return (
    <div
      className="screen-container"
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--bg-primary)',
        padding: '16px 18px calc(48px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Top Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={closeModal}
          aria-label="Close Effects Studio"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Effects & Shaders Studio</span>
        <button
          onClick={handleApplyAndEdit}
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--ai-accent)',
            color: '#080808',
            border: 'none',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Use Effect</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Live Video Preview with Real Shaders/Filters */}
      <div
        style={{
          height: '280px',
          borderRadius: '20px',
          backgroundColor: '#080808',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mediaUrl ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            playsInline
            loop
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: appliedFilterCss,
              transition: 'filter 0.25s ease',
            }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading preview footage...</div>
        )}

        {/* Play/Pause Overlay Button */}
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
        </button>

        {/* Active Effect Pill Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            padding: '4px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: currentPreset?.badgeColor || '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Sparkles size={12} />
          <span>{currentPreset?.name}</span>
        </div>
      </div>

      {/* Preset List Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          Select Grade & Style
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time GPU Filter</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', flex: 1, overflowY: 'auto' }}>
        {EFFECT_PRESETS.map((preset) => {
          const isSelected = activeEffect === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setActiveEffect(preset.id)}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: isSelected ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
                border: isSelected ? '1.5px solid var(--ai-accent)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '14px', color: isSelected ? 'var(--ai-accent)' : '#fff' }}>
                    {preset.name}
                  </strong>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: preset.badgeColor,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {preset.category}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {preset.description}
                </div>
              </div>

              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ai-accent)', fontSize: '12px', fontWeight: 800 }}>
                  <Check size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleApplyAndEdit}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          backgroundColor: 'var(--ai-accent)',
          color: '#080808',
          border: 'none',
          fontSize: '14px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(216, 255, 0, 0.25)',
        }}
      >
        <Wand2 size={16} />
        <span>Apply Preset & Open Video Editor</span>
      </button>
    </div>
  );
};
