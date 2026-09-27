import React from 'react';
import {
  Wand2,
  Sparkles,
  Sliders,
  RotateCcw,
  Eye,
  EyeOff,
  ZoomIn,
  Grid3X3,
  SplitSquareVertical,
  Check,
} from 'lucide-react';
import {
  useEditorStore,
  EFFECT_PRESETS,
  type EffectPresetId,
} from '../editor.store';

export const EffectsPanel: React.FC = () => {
  const {
    selectedEffect,
    selectEffect,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    warmth,
    setWarmth,
    blur,
    setBlur,
    videoScale,
    setVideoScale,
    showSafeZones,
    toggleSafeZones,
    showCompare,
    toggleCompare,
    resetEffects,
  } = useEditorStore();

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
        gap: '16px',
      }}
    >
      {/* Header with Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wand2 size={16} color="var(--ai-accent)" />
          <strong style={{ fontSize: '14px', color: '#fff' }}>Live Video Effects & Shaders</strong>
        </div>
        <button
          onClick={resetEffects}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
          title="Reset all filters and sliders"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Preset Cards Grid */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.6px', fontWeight: 700 }}>
          Color Grading Presets
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '8px',
          }}
        >
          {EFFECT_PRESETS.map((preset) => {
            const isSelected = selectedEffect === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectEffect(preset.id)}
                style={{
                  padding: '10px 10px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--ai-soft)' : '#111317',
                  border: isSelected ? '1.5px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: preset.badgeColor,
                      textTransform: 'uppercase',
                      letterSpacing: '.4px',
                    }}
                  >
                    {preset.category}
                  </span>
                  {isSelected && <Check size={12} color="var(--ai-accent)" />}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--ai-accent)' : '#fff' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {preset.description.slice(0, 48)}...
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      <div style={{ backgroundColor: '#0e1014', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
          <Sliders size={14} color="var(--ai-accent)" />
          <span>Manual Color & Light Tuning</span>
        </div>

        {/* Brightness */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Brightness</span>
            <span style={{ color: 'var(--ai-accent)', fontWeight: 600 }}>{brightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
          />
        </div>

        {/* Contrast */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Contrast</span>
            <span style={{ color: 'var(--ai-accent)', fontWeight: 600 }}>{contrast}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="160"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
          />
        </div>

        {/* Saturation */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Vibrance / Saturation</span>
            <span style={{ color: 'var(--ai-accent)', fontWeight: 600 }}>{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
          />
        </div>

        {/* Warmth (Sepia) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Warmth / Golden Glow</span>
            <span style={{ color: 'var(--ai-accent)', fontWeight: 600 }}>{warmth}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={warmth}
            onChange={(e) => setWarmth(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
          />
        </div>

        {/* Soft Dream Blur */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Soft Focus / Glow Diffusion</span>
            <span style={{ color: 'var(--ai-accent)', fontWeight: 600 }}>{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.2"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--ai-accent)' }}
          />
        </div>
      </div>

      {/* Camera Motion & View Modes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {/* Dynamic Punch-In Zoom */}
        <button
          type="button"
          onClick={() => {
            const nextScale = videoScale === 1 ? 1.15 : videoScale === 1.15 ? 1.25 : 1;
            setVideoScale(nextScale);
          }}
          style={{
            padding: '10px 8px',
            borderRadius: '12px',
            backgroundColor: videoScale > 1 ? 'var(--ai-soft)' : '#111317',
            border: videoScale > 1 ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
            color: videoScale > 1 ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ZoomIn size={15} />
          <span>Zoom {videoScale}x</span>
        </button>

        {/* Safe Zones Overlay */}
        <button
          type="button"
          onClick={toggleSafeZones}
          style={{
            padding: '10px 8px',
            borderRadius: '12px',
            backgroundColor: showSafeZones ? 'var(--ai-soft)' : '#111317',
            border: showSafeZones ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
            color: showSafeZones ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Grid3X3 size={15} />
          <span>{showSafeZones ? 'Guides ON' : 'Safe Zones'}</span>
        </button>

        {/* Split Compare Mode */}
        <button
          type="button"
          onClick={toggleCompare}
          style={{
            padding: '10px 8px',
            borderRadius: '12px',
            backgroundColor: showCompare ? 'var(--ai-soft)' : '#111317',
            border: showCompare ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
            color: showCompare ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <SplitSquareVertical size={15} />
          <span>{showCompare ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>
    </div>
  );
};
