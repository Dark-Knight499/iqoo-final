import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';

export interface CreatorShortCompositionProps {
  videoUrl?: string;
  hookText: string;
  creatorName: string;
  creatorHandle: string;
  subtitles?: string[];
  themeColor?: string;
}

export const CreatorShortComposition: React.FC<CreatorShortCompositionProps> = ({
  videoUrl,
  hookText = 'THE UNTOLD TRUTH ABOUT AI AGENTS',
  creatorName = 'Ali Abdaal',
  creatorHandle = '@aliabdaal',
  subtitles = [
    'Most creators think',
    'growth is about posting every day.',
    'Here is what the algorithm',
    'actually prioritizes in 2026.',
    'Double tap if this resonates.',
  ],
  themeColor = '#D8FF00',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Animated hook entrance scale with spring bounce
  const hookSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      mass: 0.5,
      stiffness: 120,
    },
  });

  const hookOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Calculate active subtitle index based on elapsed frames
  const framesPerSub = Math.max(15, Math.floor(durationInFrames / (subtitles.length || 1)));
  const activeSubIndex = Math.min(
    subtitles.length - 1,
    Math.floor(frame / framesPerSub)
  );
  const activeSubtitle = subtitles[activeSubIndex] || '';

  // Pulsing scale for active subtitle word
  const subScale = 1 + 0.04 * Math.sin(frame * 0.25);

  // Audio wave bars simulation
  const numBars = 16;
  const bars = Array.from({ length: numBars }).map((_, i) => {
    const barHeight = 12 + 28 * Math.abs(Math.sin((frame + i * 7) * 0.18));
    return barHeight;
  });

  // Progress percentage
  const progressPercent = Math.min(100, (frame / durationInFrames) * 100);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0c',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#FFFFFF',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Background Video or Animated Gradient Backdrop */}
      {videoUrl ? (
        <Video
          src={videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
        />
      ) : (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 50% 30%, #1e2612 0%, #0d0f0b 60%, #050604 100%)',
          }}
        >
          {/* Subtle animated ambient mesh */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '80%',
              height: '40%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${themeColor}18 0%, transparent 70%)`,
              transform: `scale(${1 + 0.1 * Math.sin(frame * 0.05)})`,
              filter: 'blur(40px)',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Dark gradient overlay for readability */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP: Creator Watermark Badge */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 28,
          right: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px',
            borderRadius: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: themeColor,
              color: '#000',
              fontWeight: 900,
              fontSize: 11,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {creatorName.charAt(0)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>
            {creatorHandle}
          </span>
        </div>

        <div
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: 'rgba(216, 255, 0, 0.18)',
            border: `1px solid ${themeColor}`,
            color: themeColor,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          AI Remotion
        </div>
      </div>

      {/* TOP CENTER: Viral Hook Box */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 24,
          right: 24,
          transform: `scale(${hookSpring})`,
          opacity: hookOpacity,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 16,
            backgroundColor: 'rgba(12, 12, 14, 0.85)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${themeColor}`,
            boxShadow: `0 8px 30px ${themeColor}22`,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: themeColor,
              display: 'block',
              marginBottom: 4,
            }}
          >
            ⚡ VIRAL PATTERN INTERRUPT
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
            }}
          >
            {hookText}
          </h2>
        </div>
      </div>

      {/* CENTER: Kinetic Subtitle Typography */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: 20,
          right: 20,
          transform: 'translateY(-50%)',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            transform: `scale(${subScale})`,
            padding: '12px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            maxWidth: '92%',
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              lineHeight: 1.35,
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {activeSubtitle.split(' ').map((word, wIdx) => {
              const isHighlight = wIdx % 2 === 0;
              return (
                <span
                  key={wIdx}
                  style={{
                    color: isHighlight ? themeColor : '#FFFFFF',
                    marginRight: 6,
                    display: 'inline-block',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </span>
        </div>
      </div>

      {/* BOTTOM: Audio Visualizer Waveform & Live Tag */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 28,
          right: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        {/* Waveform bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {bars.map((h, bIdx) => (
            <div
              key={bIdx}
              style={{
                width: 3.5,
                height: h,
                borderRadius: 4,
                backgroundColor: themeColor,
                opacity: 0.85,
              }}
            />
          ))}
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.65)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#00DC82',
              display: 'inline-block',
            }}
          />
          Studio Audio 48kHz
        </div>
      </div>

      {/* BOTTOM EDGE: Dynamic Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: themeColor,
            boxShadow: `0 0 8px ${themeColor}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
