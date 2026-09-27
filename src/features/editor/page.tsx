import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Play, Pause, Scissors, Volume2, Type, Crop, Sparkles, Check, Flame, Share2 } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { useEditorStore } from './editor.store';
import { Timeline } from './components/Timeline';
import { CaptionPanel } from './components/CaptionPanel';
import { AudioPanel } from './components/AudioPanel';
import { ReframePanel } from './components/ReframePanel';
import { HighlightPanel } from './components/HighlightPanel';
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
  } = useEditorStore();

  const hasMedia = Boolean(activeProject?.mediaId);
  const trimStart = activeProject?.trimStartSeconds ?? 0;
  const trimEnd = activeProject?.trimEndSeconds ?? activeProject?.durationSeconds ?? 0;
  const proposed = activeProject?.proposedTrim;
  const playbackStart = previewingProposal && proposed ? proposed.start : trimStart;
  const playbackEnd = previewingProposal && proposed ? proposed.end : trimEnd;
  const duration = hasMedia ? playbackEnd - playbackStart : activeProject?.durationSeconds || 42;

  useEffect(() => { setPreviewingProposal(false); setTrimError(null); setPlaying(false); }, [activeProject?.id, setPlaying]);

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
      updateActiveProject({ proposedTrim: activeProject.blueprint
        ? proposeOpeningTrim(activeProject)
        : { start: trimStart, end: trimEnd, origin: 'manual' } });
      setTrimError(null);
      setPreviewingProposal(false);
      setPlaying(false);
    } catch (error) { setTrimError(error instanceof Error ? error.message : 'Could not propose a trim.'); }
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
    } catch (error) { setTrimError(error instanceof Error ? error.message : 'Invalid trim range.'); }
  };

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setMediaUrl(null);
    setMediaError(null);
    if (activeProject?.mediaId) {
      files.restore(activeProject.mediaId).then((source) => {
        if (cancelled) return;
        if (!source) { setMediaError('Source video is missing from this browser. Reimport it to edit.'); return; }
        url = URL.createObjectURL(source);
        setMediaUrl(url);
        setCurrentTime(0);
      }).catch(() => { if (!cancelled) setMediaError('Could not load the saved video.'); });
    }
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [activeProject?.mediaId, setCurrentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaUrl) return;
    const target = playbackStart + Math.min(Math.max(0, currentTime), Math.max(0, duration - 0.02));
    if (Math.abs(video.currentTime - target) > 0.35) video.currentTime = target;
  }, [currentTime, playbackStart, duration, mediaUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaUrl) return;
    if (isPlaying) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [isPlaying, mediaUrl, setPlaying]);


  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 16px 28px',
      }}
    >
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <button
          onClick={closeModal}
          aria-label="Close editor"
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

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeProject?.title || 'Video Project'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {hasMedia ? activeProject?.aspectRatio : aspectRatio} · {formatDuration(duration)}
          </div>
        </div>

        <button
          onClick={() => { setPlaying(false); setPreviewingProposal(false); openModal('export'); }}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--ai-accent)',
            color: '#080808',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Export <Share2 size={13} />
        </button>
      </div>

      {/* Video Preview Canvas */}
      <div
        className="media-bg"
        style={{
           height: (hasMedia ? activeProject?.aspectRatio : aspectRatio) === '9:16' ? '390px' : (hasMedia ? activeProject?.aspectRatio : aspectRatio) === '1:1' ? '320px' : '220px',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'var(--shadow-card)',
          transition: 'height 0.25s ease',
        }}
      >
        <MediaArt mediaId={activeProject?.mediaId} src={activeProject?.thumbnailUrl}
          label={activeProject?.mediaId ? activeProject.mediaName || 'Source video' : 'No source video attached'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {mediaUrl && <video ref={videoRef} src={mediaUrl} playsInline preload="auto"
           onLoadedMetadata={() => { if (videoRef.current) videoRef.current.currentTime = playbackStart; }}
          onTimeUpdate={() => {
            const video = videoRef.current;
            if (!video) return;
             if (video.currentTime >= playbackEnd - 0.04) {
              video.pause();
              setPlaying(false);
              setCurrentTime(duration);
             } else setCurrentTime(Math.max(0, video.currentTime - playbackStart));
          }}
          onError={() => setMediaError('This browser cannot play the saved video.')}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#080808' }} />}
        {!hasMedia && <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.15)',
          }}
        />}

        {/* Play/Pause Button */}
        <button
          onClick={() => { if (hasMedia && currentTime >= duration - 0.05) setCurrentTime(0); togglePlay(); }}
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
            zIndex: 4,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" style={{ marginLeft: '3px' }} />}
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
          }}
        >
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>
      </div>

      {mediaError && <p role="alert" style={{ color: '#ff9ca5', fontSize: 12 }}>{mediaError}</p>}
      {!hasMedia && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sample project preview · import a video from Create to play, trim and export.</p>}

      {activeProject?.blueprint ? (
        <details style={{ padding: 14, marginTop: 12, borderRadius: 14, background: 'var(--bg-surface-2)', fontSize: 12 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Content blueprint · {activeProject.blueprint.title}</summary>
          <p>Hook: {activeProject.blueprint.hook}</p>
          <p>References: {activeProject.blueprint.references.map(item => item.title).join(', ') || 'None'}</p>
          <p>Plan only: no scenes, captions, or music are rendered onto the source video.</p>
          <button onClick={beginPlanning} style={{ color: 'var(--ai-accent)' }}>Review / refine blueprint</button>
        </details>
       ) : hasMedia && <button onClick={beginPlanning} style={{ color: 'var(--ai-accent)', textAlign: 'left', padding: 12 }}>Create a content blueprint for this project <ArrowRight size={14} aria-hidden="true" /></button>}

      {hasMedia && activeProject && (
        <section aria-label="Review trim proposal" style={{ padding: 14, marginTop: 12, borderRadius: 14, background: 'var(--bg-surface-2)', fontSize: 12 }}>
          <strong>{proposed ? 'Proposed source cut · not applied' : 'Source cut'}</strong>
          <p style={{ color: 'var(--text-secondary)' }}>
            {proposed ? `Review ${proposed.start.toFixed(1)}–${proposed.end.toFixed(1)}s of ${activeProject.mediaName}. ${previewingProposal ? 'Previewing proposal; export still uses the applied cut.' : 'Current playback/export is unchanged.'}`
              : activeProject.blueprint ? 'Suggest an opening range based only on the blueprint duration, not video analysis. Adjust it to fit your footage.' : 'Choose a range yourself; nothing is changed until you apply it.'}
          </p>
          {!proposed ? <Button variant="secondary" onClick={proposeTrim}>{activeProject.blueprint ? 'Propose opening cut' : 'Propose manual cut'}</Button> : <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <label style={{ flex: 1, minWidth: 0 }}>Start (seconds)
                <input aria-label="Proposed trim start" type="number" min="0" max={activeProject.durationSeconds} step="0.1" value={proposed.start}
                  onChange={event => { setPreviewingProposal(false); setPlaying(false); updateActiveProject({ proposedTrim: { ...proposed, start: Number(event.target.value) } }); }} style={{ display: 'block', width: '100%', boxSizing: 'border-box' }} />
              </label>
              <label style={{ flex: 1, minWidth: 0 }}>End (seconds)
                <input aria-label="Proposed trim end" type="number" min="0" max={activeProject.durationSeconds} step="0.1" value={proposed.end}
                  onChange={event => { setPreviewingProposal(false); setPlaying(false); updateActiveProject({ proposedTrim: { ...proposed, end: Number(event.target.value) } }); }} style={{ display: 'block', width: '100%', boxSizing: 'border-box' }} />
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Button variant="secondary" disabled={!validTrim(activeProject, proposed.start, proposed.end)} onClick={() => { setPlaying(false); setCurrentTime(0); setPreviewingProposal(true); }}>Preview proposed cut</Button>
              <Button variant="ai" disabled={!validTrim(activeProject, proposed.start, proposed.end)} onClick={applyTrim}>Apply cut</Button>
              <Button variant="secondary" onClick={() => { setPlaying(false); setPreviewingProposal(false); setCurrentTime(0); updateActiveProject({ proposedTrim: undefined }); setTrimError(null); }}>Discard</Button>
            </div>
            {previewingProposal && <p>Preview mode: press Play above to review this proposed range. Nothing is applied or exported until you select Apply cut.</p>}
          </>}
          {trimError && <p role="alert" style={{ color: '#ff9ca5' }}>{trimError}</p>}
          {activeProject.appliedOperations?.length ? <p>Applied cuts: {activeProject.appliedOperations.length} · Current export range: {trimStart.toFixed(1)}–{trimEnd.toFixed(1)}s</p> : null}
          {activeProject.lastExport && <p>Last rendered in this browser: {activeProject.lastExport.name} (downloaded file is not stored in Projects).</p>}
        </section>
      )}

      {/* Timeline Component */}
       <Timeline duration={duration} sourceName={activeProject?.mediaId ? activeProject.mediaName || activeProject.title : undefined} />

      {/* Editing Tool Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          margin: '10px 0 16px',
        }}
      >
        <button
          onClick={() => setActivePanel(activePanel === 'cut' ? null : 'cut')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 4px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'cut' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'cut' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            border: activePanel === 'cut' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Scissors size={17} />
          <span>Cut</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'audio' ? null : 'audio')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 4px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'audio' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'audio' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            border: activePanel === 'audio' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Volume2 size={17} />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'captions' ? null : 'captions')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 4px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'captions' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'captions' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            border: activePanel === 'captions' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Type size={17} />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'reframe' ? null : 'reframe')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 4px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'reframe' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'reframe' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            border: activePanel === 'reframe' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Crop size={17} />
          <span>Crop</span>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'highlights' ? null : 'highlights')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 4px',
            borderRadius: '14px',
            backgroundColor: activePanel === 'highlights' ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
            color: activePanel === 'highlights' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontSize: '11px',
            border: activePanel === 'highlights' ? '1px solid var(--ai-border)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Flame size={17} />
          <span>Highlights</span>
        </button>
      </div>

      {/* Subpanels */}
      {hasMedia && activePanel && !['cut'].includes(activePanel) && (
        <div style={{ background: 'var(--bg-surface-2)', borderRadius: 18, padding: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          This tool is a preview concept. Imported video export currently supports source playback and trimming only.
        </div>
      )}
      {!hasMedia && activePanel === 'captions' && <CaptionPanel />}
      {!hasMedia && activePanel === 'audio' && <AudioPanel />}
      {!hasMedia && activePanel === 'reframe' && <ReframePanel />}
      {!hasMedia && activePanel === 'highlights' && <HighlightPanel />}
      {activePanel === 'cut' && hasMedia && (
        <div style={{ backgroundColor: 'var(--bg-surface-2)', borderRadius: '18px', padding: '16px', marginTop: '12px' }}>
           <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Propose a source range (seconds) · Apply it in Review trim proposal above</div>
           <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, fontSize: 11 }}>Start
               <input aria-label="Trim start" type="number" min="0" max={activeProject?.durationSeconds} step="0.1" value={Number((proposed?.start ?? trimStart).toFixed(1))}
                 onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) { setPlaying(false); setPreviewingProposal(false); setCurrentTime(0); updateActiveProject({ proposedTrim: { start: value, end: proposed?.end ?? trimEnd, origin: 'manual' } }); } }}
                style={{ display: 'block', width: '100%', padding: 8, background: 'var(--bg-surface)', borderRadius: 8 }} />
            </label>
            <label style={{ flex: 1, fontSize: 11 }}>End
               <input aria-label="Trim end" type="number" min="0" max={activeProject?.durationSeconds} step="0.1" value={Number((proposed?.end ?? trimEnd).toFixed(1))}
                 onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) { setPlaying(false); setPreviewingProposal(false); setCurrentTime(0); updateActiveProject({ proposedTrim: { start: proposed?.start ?? trimStart, end: value, origin: 'manual' } }); } }}
                style={{ display: 'block', width: '100%', padding: 8, background: 'var(--bg-surface)', borderRadius: 8 }} />
             </label>
           </div>
           {proposed && <button type="button" onClick={() => document.querySelector('[aria-label="Review trim proposal"]')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ color: 'var(--ai-accent)', marginTop: 10 }}>Preview / apply or discard proposed cut <ArrowUp size={14} aria-hidden="true" /></button>}
         </div>
      )}
      {activePanel === 'cut' && !hasMedia && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Import a video to trim a real clip.</p>}

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
          "Make this a 30s Reel", "Remove filler words", or "Add auto-zooms to highlights".
        </p>
        <Button
          variant="ai"
          fullWidth
          onClick={() => openCopilot('Make this a 30 second Instagram reel')}
          style={{ gap: '6px' }}
        >
          <Sparkles size={15} />
           Open Copilot Assistant <Sparkles size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
