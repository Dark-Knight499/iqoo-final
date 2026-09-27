import React, { useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  CreatorShortComposition,
  CreatorShortCompositionProps,
} from './CreatorShortComposition';
import { Play, Pause, RotateCcw, Volume2, Sparkles, X } from 'lucide-react';

interface RemotionShortPlayerProps {
  videoUrl?: string;
  hookText?: string;
  creatorName?: string;
  creatorHandle?: string;
  subtitles?: string[];
  themeColor?: string;
  durationInSeconds?: number;
  onClose?: () => void;
  isModal?: boolean;
}

export const RemotionShortPlayer: React.FC<RemotionShortPlayerProps> = ({
  videoUrl,
  hookText = 'THE UNTOLD TRUTH ABOUT AI AGENTS',
  creatorName = 'Creator',
  creatorHandle = '@creator',
  subtitles,
  themeColor = '#D8FF00',
  durationInSeconds = 12,
  onClose,
  isModal = false,
}) => {
  const playerRef = React.useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customHook, setCustomHook] = useState(hookText);

  const fps = 30;
  const durationInFrames = Math.max(90, Math.floor(durationInSeconds * fps));

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  };

  const inputProps: CreatorShortCompositionProps = {
    videoUrl,
    hookText: customHook,
    creatorName,
    creatorHandle,
    subtitles: subtitles || [
      'Stop making the same mistakes',
      'that 99 percent of people make.',
      'Here is the exact framework',
      'top creators use right now.',
      'Save this video for later.',
    ],
    themeColor,
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        maxWidth: 380,
        margin: '0 auto',
      }}
    >
      {/* Player Header */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color={themeColor} />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
            Remotion Dynamic Preview
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 6,
              backgroundColor: 'rgba(216, 255, 0, 0.15)',
              color: themeColor,
            }}
          >
            9:16
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Remotion Player Container */}
      <div
        style={{
          width: '100%',
          aspectRatio: '9 / 16',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
          border: '1.5px solid var(--border-color)',
          backgroundColor: '#000',
          position: 'relative',
        }}
      >
        <Player
          ref={playerRef}
          component={CreatorShortComposition}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls={false}
          autoPlay={true}
          loop={true}
        />
      </div>

      {/* Control Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '8px 14px',
          borderRadius: 14,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={handleRestart}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            backgroundColor: 'var(--bg-surface-2)',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
          }}
          title="Restart from frame 0"
        >
          <RotateCcw size={14} />
          <span>Restart</span>
        </button>

        <button
          onClick={togglePlay}
          style={{
            padding: '8px 18px',
            borderRadius: 10,
            backgroundColor: themeColor,
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
      </div>

      {/* Live Hook Customizer */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: 6,
        }}
      >
        <input
          type="text"
          value={customHook}
          onChange={(e) => setCustomHook(e.target.value)}
          placeholder="Edit Remotion viral hook live..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 10,
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
