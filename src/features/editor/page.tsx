import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Play,
  Pause,
  Scissors,
  Wand2,
  Volume2,
  Type,
  Crop,
  Sparkles,
  Check,
  Flame,
  Share2,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { useEditorStore } from './editor.store';
import { Timeline } from './components/Timeline';
import { CaptionPanel } from './components/CaptionPanel';
import { AudioPanel } from './components/AudioPanel';
import { ReframePanel } from './components/ReframePanel';
import { HighlightPanel } from './components/HighlightPanel';
import { EffectsPanel } from './components/EffectsPanel';
import { Button } from '@/shared/components/Button';
import { formatDuration } from '@/utils/format';
import { files } from '@/utils/files';
import { ciStore } from '@/features/creator-intelligence/state/creatorIntelligenceStore';
import { applyProposedTrim, proposeOpeningTrim, validTrim } from '@/shared/services/projectOperations';
import { MediaArt } from '@/shared/components/MediaArt';

export const EditorPage: React.FC = () => {
  const { closeModal, openCopilot, openModal, showToast } = useAppStore();
  const { activeProject, updateActiveProject } = useProjectStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const compareVideoRef = useRef<HTMLVideoElement>(null);

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [previewingProposal, setPreviewingProposal] = useState(false);
  const [trimError, setTrimError] = useState<string | null>(null);

  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    togglePlay,
    setPlaying,
    activePanel,
    setActivePanel,
    aspectRatio,
    filterCss,
    selectedEffect,
    videoScale,
    showSafeZones,
    showCompare,
    hasCaptions,
    captionStyle,
    customCaptionText,
    audioVolume,
    isMuted,
    playbackRate,
  } = useEditorStore();

  const hasMedia = Boolean(activeProject?.mediaId || activeProject?.mediaUrl || mediaUrl);
  const trimStart = activeProject?.trimStartSeconds ?? 0;
  const trimEnd = activeProject?.trimEndSeconds ?? activeProject?.durationSeconds ?? 0;
  const proposed = activeProject?.proposedTrim;
  const playbackStart = previewingProposal && proposed ? proposed.start : trimStart;
  const playbackEnd = previewingProposal && proposed ? proposed.end : (trimEnd > 0 ? trimEnd : activeProject?.durationSeconds || 16);
  const duration = Math.max(1, playbackEnd - playbackStart);

  useEffect(() => {
    setPreviewingProposal(false);
    setTrimError(null);
    setPlaying(false);
  }, [activeProject?.id, setPlaying]);

  const beginPlanning = () => {
    if (!activeProject) return;
    if (activeProject.blueprint) ciStore.openSavedBlueprint(activeProject.blueprint, activeProject.id);
    else ciStore.linkProjectForPlanning(activeProject.id);
    setPlaying(false);
    openModal('creator-intelligence');
  };

  const proposeTrim = () => {
    if (!activeProject) return;
    try {
      updateActiveProject({
        proposedTrim: activeProject.blueprint
          ? proposeOpeningTrim(activeProject)
          : { start: trimStart, end: trimEnd > 0 ? trimEnd : duration, origin: 'manual' },
      });
      setTrimError(null);
      setPreviewingProposal(false);
      setPlaying(false);
    } catch (error) {
      setTrimError(error instanceof Error ? error.message : 'Could not propose a trim.');
    }
  };

  const applyTrim = () => {
    if (!activeProject) return;
    try {
      updateActiveProject(applyProposedTrim(activeProject));
      setPreviewingProposal(false);
      setPlaying(false);
      setCurrentTime(0);
      setTrimError(null);
      showToast('Reviewed trim applied to this video project');
    } catch (error) {
      setTrimError(error instanceof Error ? error.message : 'Invalid trim range.');
    }
  };

  // Load project video or fallback demo video
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setMediaError(null);

    if (activeProject?.mediaUrl) {
      setMediaUrl(activeProject.mediaUrl);
      setCurrentTime(0);
      return;
    }

    if (activeProject?.mediaId) {
      files
        .restore(activeProject.mediaId)
        .then((source) => {
          if (cancelled) return;
          if (!source) {
            setMediaUrl('/legacy/static-analysis/demo_video/video_20260926_233851.mp4');
            return;
          }
          url = URL.createObjectURL(source);
          setMediaUrl(url);
          setCurrentTime(0);
        })
        .catch(() => {
          if (!cancelled) setMediaUrl('/legacy/static-analysis/demo_video/video_20260926_233851.mp4');
        });
    } else {
      // Default sample video so the editor always has a real interactive video loaded
      setMediaUrl('/legacy/static-analysis/demo_video/video_20260926_233851.mp4');
    }

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [activeProject?.mediaId, activeProject?.mediaUrl, setCurrentTime]);

  // Synchronize playback position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaUrl) return;
    const target = playbackStart + Math.min(Math.max(0, currentTime), Math.max(0, duration - 0.02));
    if (Math.abs(video.currentTime - target) > 0.35) {
      video.currentTime = target;
    }
    if (compareVideoRef.current && Math.abs(compareVideoRef.current.currentTime - target) > 0.35) {
      compareVideoRef.current.currentTime = target;
    }
  }, [currentTime, playbackStart, duration, mediaUrl]);

  // Synchronize play / pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaUrl) return;
    if (isPlaying) {
      video.play().catch(() => setPlaying(false));
      if (compareVideoRef.current) compareVideoRef.current.play().catch(() => {});
    } else {
      video.pause();
      if (compareVideoRef.current) compareVideoRef.current.pause();
    }
  }, [isPlaying, mediaUrl, setPlaying]);

  // Synchronize volume and speed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : Math.min(1, Math.max(0, audioVolume / 100));
    video.playbackRate = playbackRate;
  }, [audioVolume, isMuted, playbackRate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 18px calc(36px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <button
          onClick={closeModal}
          aria-label="Back to dashboard"
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

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
            {activeProject?.title || 'Project Editor'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {activeProject?.mediaName || 'Real-time Video Canvas'}
          </div>
        </div>

        <button
          onClick={() => openModal('export')}
          style={{
            backgroundColor: 'var(--ai-accent)',
            color: '#080808',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          Export <Share2 size={13} />
        </button>
      </div>

      {/* Video Preview Canvas */}
      <div
        className="media-bg"
        style={{
          height:
            (activeProject?.aspectRatio || aspectRatio) === '9:16'
              ? '380px'
              : (activeProject?.aspectRatio || aspectRatio) === '1:1'
              ? '300px'
              : '210px',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'var(--shadow-card)',
          transition: 'height 0.25s ease',
        }}
      >
        {/* Main Video Element with live effects & scale */}
        {mediaUrl && (
          <video
            ref={videoRef}
            src={mediaUrl}
            playsInline
            preload="auto"
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.currentTime = playbackStart;
            }}
            onTimeUpdate={() => {
              const video = videoRef.current;
              if (!video) return;
              if (video.currentTime >= playbackEnd - 0.04) {
                video.pause();
                setPlaying(false);
                setCurrentTime(duration);
              } else {
                setCurrentTime(Math.max(0, video.currentTime - playbackStart));
              }
            }}
            onError={() => setMediaError('This browser cannot play the saved video format.')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#080808',
              filter: showCompare ? 'none' : filterCss,
              transform: `scale(${videoScale})`,
              transition: 'transform 0.2s ease, filter 0.2s ease',
            }}
          />
        )}

        {/* Split Compare Mode: Right Half Filtered */}
        {showCompare && mediaUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '50%',
              overflow: 'hidden',
              borderLeft: '2px solid var(--ai-accent)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <video
              ref={compareVideoRef}
              src={mediaUrl}
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200%',
                height: '100%',
                objectFit: 'contain',
                filter: filterCss,
                transform: `scale(${videoScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'var(--ai-accent)',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              EFFECT APPLIED
            </div>
          </div>
        )}
        {showCompare && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              zIndex: 4,
            }}
          >
            ORIGINAL
          </div>
        )}

        {/* Dynamic Caption Overlay */}
        {hasCaptions && customCaptionText && (
          <div
            style={{
              position: 'absolute',
              bottom: '44px',
              left: '20px',
              right: '20px',
              textAlign: 'center',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            {captionStyle === 'tiktok_yellow' && (
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  fontFamily: 'system-ui, sans-serif',
                  color: '#FFE600',
                  textTransform: 'uppercase',
                  WebkitTextStroke: '1.5px #000',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                }}
              >
                {customCaptionText}
              </span>
            )}
            {captionStyle === 'minimal_white' && (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {customCaptionText}
              </span>
            )}
            {captionStyle === 'neon_cyber' && (
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#D8FF00',
                  textShadow: '0 0 10px rgba(216, 255, 0, 0.8), 0 2px 4px rgba(0,0,0,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {customCaptionText}
              </span>
            )}
          </div>
        )}

        {/* Safe Zones Overlay Guidelines */}
        {showSafeZones && (
          <div
            style={{
              position: 'absolute',
              inset: '24px 16px 56px',
              border: '1.5px dashed rgba(216, 255, 0, 0.6)',
              borderRadius: '12px',
              pointerEvents: 'none',
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '6px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--ai-accent)', letterSpacing: '.6px' }}>
              REELS / SHORTS SAFE HEADER
            </div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--ai-accent)', textAlign: 'right', letterSpacing: '.6px' }}>
              SAFE TITLE MARGIN
            </div>
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={() => {
            if (currentTime >= duration - 0.05) setCurrentTime(0);
            togglePlay();
          }}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          disabled={!mediaUrl}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            color: '#080808',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? (
            <Pause size={24} aria-hidden="true" />
          ) : (
            <Play size={24} aria-hidden="true" style={{ marginLeft: '3px' }} />
          )}
        </button>

        {/* Time overlay indicator */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            fontSize: '11px',
            color: '#fff',
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>

        {/* Active Effect Indicator Badge */}
        {selectedEffect !== 'none' && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '4px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(6px)',
              fontSize: '10px',
              color: 'var(--ai-accent)',
              fontWeight: 800,
              zIndex: 10,
              border: '1px solid var(--ai-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} />
            <span>FX: {selectedEffect.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      {mediaError && (
        <p role="alert" style={{ color: '#ff9ca5', fontSize: 12, margin: '6px 0 0' }}>
          {mediaError}
        </p>
      )}

      {/* Review Trim Section */}
      {hasMedia && activeProject && (
        <section
          aria-label="Review trim proposal"
          style={{
            padding: 14,
            marginTop: 12,
            borderRadius: 14,
            background: 'var(--bg-surface-2)',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <strong style={{ color: '#fff' }}>{proposed ? 'Proposed source cut' : 'Source cut'}</strong>
            {activeProject.appliedOperations?.length ? (
              <span style={{ fontSize: 10, color: 'var(--ai-accent)', fontWeight: 700 }}>
                {activeProject.appliedOperations.length} CUTS APPLIED
              </span>
            ) : null}
          </div>

          <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
            {proposed
              ? `Review ${proposed.start.toFixed(1)}–${proposed.end.toFixed(1)}s of ${activeProject.mediaName || 'video'}. ${
                  previewingProposal ? 'Previewing proposal.' : 'Press Preview to review before applying.'
                }`
              : 'Choose a trim range to refine your video.'}
          </p>

          {!proposed ? (
            <Button variant="secondary" size="sm" onClick={proposeTrim}>
              {activeProject.blueprint ? 'Propose opening cut' : 'Propose manual cut'}
            </Button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <label style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                  Start (seconds)
                  <input
                    aria-label="Proposed trim start"
                    type="number"
                    min="0"
                    max={activeProject.durationSeconds || duration}
                    step="0.1"
                    value={proposed.start}
                    onChange={(event) => {
                      setPreviewingProposal(false);
                      setPlaying(false);
                      updateActiveProject({ proposedTrim: { ...proposed, start: Number(event.target.value) } });
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0c0e12',
                      color: '#fff',
                      borderRadius: 8,
                      padding: 6,
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginTop: 4,
                    }}
                  />
                </label>
                <label style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                  End (seconds)
                  <input
                    aria-label="Proposed trim end"
                    type="number"
                    min="0"
                    max={activeProject.durationSeconds || duration}
                    step="0.1"
                    value={proposed.end}
                    onChange={(event) => {
                      setPreviewingProposal(false);
                      setPlaying(false);
                      updateActiveProject({ proposedTrim: { ...proposed, end: Number(event.target.value) } });
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0c0e12',
                      color: '#fff',
                      borderRadius: 8,
                      padding: 6,
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginTop: 4,
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!validTrim(activeProject, proposed.start, proposed.end)}
                  onClick={() => {
                    setPlaying(false);
                    setCurrentTime(0);
                    setPreviewingProposal(true);
                  }}
                >
                  Preview cut
                </Button>
                <Button
                  variant="ai"
                  size="sm"
                  disabled={!validTrim(activeProject, proposed.start, proposed.end)}
                  onClick={applyTrim}
                >
                  Apply cut
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPlaying(false);
                    setPreviewingProposal(false);
                    setCurrentTime(0);
                    updateActiveProject({ proposedTrim: undefined });
                    setTrimError(null);
                  }}
                >
                  Discard
                </Button>
              </div>
            </>
          )}

          {trimError && (
            <p role="alert" style={{ color: '#ff9ca5', margin: '8px 0 0' }}>
              {trimError}
            </p>
          )}
        </section>
      )}

      {/* Interactive Timeline Component with Smooth Scrubbing */}
      <Timeline
        duration={duration}
        trimStart={playbackStart}
        trimEnd={playbackEnd}
        sourceName={activeProject?.mediaName || activeProject?.title || 'Main Video Track'}
        onSeek={(seekTime) => {
          const video = videoRef.current;
          if (video) video.currentTime = playbackStart + seekTime;
        }}
      />

      {/* Editing Tool Row (6 Tools) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
          margin: '6px 0 14px',
        }}
      >
        <button
          onClick={() => setActivePanel(activePanel === 'cut' ? null : 'cut')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'cut' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'cut' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'cut' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Scissors size={16} />
          <span>Cut</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'effects' ? null : 'effects')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'effects' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'effects' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'effects' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Wand2 size={16} />
          <span>Effects</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'audio' ? null : 'audio')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'audio' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'audio' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'audio' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Volume2 size={16} />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'captions' ? null : 'captions')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'captions' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'captions' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'captions' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Type size={16} />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'reframe' ? null : 'reframe')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'reframe' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'reframe' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'reframe' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Crop size={16} />
          <span>Crop</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'highlights' ? null : 'highlights')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 2px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'highlights' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'highlights' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '10px',
            fontWeight: 700,
            border: activePanel === 'highlights' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Flame size={16} />
          <span>Highlights</span>
        </button>
      </div>

      {/* Active Subpanel Workspace */}
      {activePanel === 'effects' && <EffectsPanel />}
      {activePanel === 'captions' && <CaptionPanel />}
      {activePanel === 'audio' && <AudioPanel />}
      {activePanel === 'reframe' && <ReframePanel />}
      {activePanel === 'highlights' && <HighlightPanel />}

      {activePanel === 'cut' && (
        <div style={{ backgroundColor: 'var(--bg-surface-2)', borderRadius: '18px', padding: '16px', marginTop: '4px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
            Manual In / Out Cut Range (Seconds)
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)' }}>
              Start
              <input
                aria-label="Trim start"
                type="number"
                min="0"
                max={activeProject?.durationSeconds || duration}
                step="0.1"
                value={Number((proposed?.start ?? trimStart).toFixed(1))}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value)) {
                    setPlaying(false);
                    setPreviewingProposal(false);
                    setCurrentTime(0);
                    updateActiveProject({
                      proposedTrim: { start: value, end: proposed?.end ?? (trimEnd > 0 ? trimEnd : duration), origin: 'manual' },
                    });
                  }
                }}
                style={{ display: 'block', width: '100%', padding: 8, background: '#0c0e12', color: '#fff', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', marginTop: 4 }}
              />
            </label>
            <label style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)' }}>
              End
              <input
                aria-label="Trim end"
                type="number"
                min="0"
                max={activeProject?.durationSeconds || duration}
                step="0.1"
                value={Number((proposed?.end ?? (trimEnd > 0 ? trimEnd : duration)).toFixed(1))}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value)) {
                    setPlaying(false);
                    setPreviewingProposal(false);
                    setCurrentTime(0);
                    updateActiveProject({
                      proposedTrim: { start: proposed?.start ?? trimStart, end: value, origin: 'manual' },
                    });
                  }
                }}
                style={{ display: 'block', width: '100%', padding: 8, background: '#0c0e12', color: '#fff', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', marginTop: 4 }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Contextual Copilot Action Bar */}
      <div
        style={{
          marginTop: 'auto',
          backgroundColor: '#15190c',
          border: '1px solid var(--ai-border)',
          borderRadius: '22px',
          padding: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ai-accent)', fontWeight: 700, fontSize: '14px' }}>
            <Sparkles size={16} />
            Ask Copilot
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Project-aware AI</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
          "Apply cyberpunk color grade", "Auto-cut silence", or "Reframe to 9:16 for TikTok".
        </p>
        <Button
          variant="ai"
          fullWidth
          onClick={() => openCopilot('Apply cinematic color grade and trim silence')}
          style={{ gap: '6px' }}
        >
          <Sparkles size={15} />
          Open Copilot Assistant <Sparkles size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
