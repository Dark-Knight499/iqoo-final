import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Clapperboard, Download, LoaderCircle, Pause, Play, RefreshCw, Sparkles, Upload } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { clippingApi, ClipAnalysis, ClipSuggestion, OpenAIStatus } from './clippingApi';
import './clipping.css';

type Screen = 'input' | 'results' | 'detail';

const formatClipClock = (seconds: number) => {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};

export const ClippingView: React.FC = () => {
  const { closeModal } = useAppStore();
  const [screen, setScreen] = useState<Screen>('input');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [targetDuration, setTargetDuration] = useState(45);
  const [maxClips, setMaxClips] = useState(5);
  const [openAIStatus, setOpenAIStatus] = useState<OpenAIStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ClipAnalysis | null>(null);
  const [selectedClip, setSelectedClip] = useState<ClipSuggestion | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewElapsed, setPreviewElapsed] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(videoFile);
    setLocalPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [videoFile]);

  const checkOpenAI = async () => {
    setIsChecking(true);
    setStatusError(null);
    try {
      const status = await clippingApi.getOpenAIStatus();
      setOpenAIStatus(status);
    } catch (error) {
      setOpenAIStatus(null);
      setStatusError(error instanceof Error ? error.message : 'Could not check OpenAI configuration.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => { void checkOpenAI(); }, []);

  const runAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    setAnalysisError(null);
    setAnalysis(null);
    setSelectedClip(null);
    setIsAnalyzing(true);
    try {
      if (!videoFile) throw new Error('Choose a video file to analyze.');
      const result = await clippingApi.analyzeLocal(videoFile, targetDuration, maxClips);
      setAnalysis(result);
      setScreen('results');
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Video analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openClip = (clip: ClipSuggestion) => {
    setPreviewPlaying(false);
    setPreviewElapsed(0);
    setSelectedClip(clip);
    setScreen('detail');
  };

  const toggleClipPreview = async () => {
    const video = localVideoRef.current;
    if (!video || !selectedClip) return;
    if (!video.paused) {
      video.pause();
      setPreviewPlaying(false);
      return;
    }
    if (video.currentTime < selectedClip.start_seconds || video.currentTime >= selectedClip.end_seconds) {
      video.currentTime = selectedClip.start_seconds;
      setPreviewElapsed(0);
    }
    try {
      await video.play();
      setPreviewPlaying(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Could not play this clip preview.');
    }
  };

  const downloadSelectedClip = async () => {
    if (!videoFile || !selectedClip) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = await clippingApi.downloadClip(videoFile, selectedClip.start_seconds, selectedClip.end_seconds);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeTitle = videoFile.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '_');
      anchor.href = downloadUrl;
      anchor.download = `${safeTitle}_clip_${selectedClip.rank}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Could not download this clip.');
    } finally {
      setIsDownloading(false);
    }
  };

  const back = () => {
    if (screen === 'detail') setScreen('results');
    else if (screen === 'results') setScreen('input');
    else closeModal();
  };

  const canAnalyze = openAIStatus?.configured === true && !isAnalyzing && Boolean(videoFile);

  return (
    <main className="clip-shell">
      <header className="clip-topbar">
        <button className="clip-back" onClick={back} aria-label={screen === 'input' ? 'Exit clipping studio' : 'Go back'}>
          <ArrowLeft size={18} />
        </button>
        <div className="clip-brand"><span className="clip-brand-icon"><Clapperboard size={18} /></span><span>CLIPPING STUDIO</span></div>
        <span className="clip-model-chip">AI CLIPPING</span>
      </header>

      <div className="clip-content">
        {screen === 'input' && (
          <>
            <section className="clip-heading">
              <div className="clip-kicker">UPLOAD-ONLY CLIPPING</div>
              <h1>Find the moments<br />worth clipping.</h1>
              <p>Upload a video to find compelling moments using audio peaks, scene changes, and visual analysis.</p>
            </section>

            <section className={`clip-runtime ${openAIStatus?.configured ? 'is-online' : 'is-offline'}`} aria-live="polite">
              {isChecking ? <LoaderCircle className="clip-spin" size={18} /> : openAIStatus?.configured ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="clip-runtime-copy">
                <strong>{isChecking ? 'Checking analysis service' : openAIStatus?.configured ? 'AI analysis ready' : 'AI service unavailable'}</strong>
                <span>{openAIStatus?.configured ? 'Video frames are sent securely to the analysis service.' : statusError || 'Check the backend analysis service configuration.'}</span>
              </div>
              {!isChecking && !openAIStatus?.configured && <button className="clip-refresh" onClick={() => void checkOpenAI()} aria-label="Check analysis service"><RefreshCw size={16} /></button>}
            </section>

            <form onSubmit={runAnalysis} className="clip-form">
              <div className="clip-section-title"><span>01</span><h2>Upload a video</h2></div>
              <label className="clip-upload">
                <input type="file" accept=".mp4,.mov,.mkv,.webm,.avi,video/mp4,video/quicktime,video/webm" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />
                <span className="clip-upload-icon"><Upload size={19} /></span>
                <strong>{videoFile?.name || 'Choose a video file'}</strong>
                <small>{videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : 'MP4, MOV, MKV, WebM, or AVI'}</small>
              </label>

              <div className="clip-section-title clip-settings-title"><span>02</span><h2>Clip settings</h2></div>
              <div className="clip-settings">
                <label><span>TARGET LENGTH</span><select value={targetDuration} onChange={(event) => setTargetDuration(Number(event.target.value))}><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select></label>
                <label><span>RESULTS</span><select value={maxClips} onChange={(event) => setMaxClips(Number(event.target.value))}><option value={3}>3 clips</option><option value={5}>5 clips</option><option value={8}>8 clips</option><option value={10}>10 clips</option></select></label>
              </div>

              {analysisError && <div className="clip-error" role="alert">{analysisError}</div>}
              <button className="clip-submit" type="submit" disabled={!canAnalyze}>
                {isAnalyzing ? <><LoaderCircle className="clip-spin" size={18} />Analyzing video</> : <>Analyze video <ChevronRight size={18} /></>}
              </button>
              <p className="clip-form-note">Video analysis runs securely through the configured AI service.</p>
            </form>
          </>
        )}

        {screen === 'results' && analysis && (
          <section className="clip-results">
            <div className="clip-heading clip-results-heading">
              <div className="clip-kicker">ANALYSIS COMPLETE</div>
              <h1>{analysis.video_title}</h1>
              <p>{analysis.video_duration} source · {analysis.total_candidates_analyzed} candidates · AI-assisted analysis</p>
            </div>
            <div className="clip-signal-row">{analysis.signals_used.map((signal) => <span key={signal}>{signal.includes('vision') ? 'AI visual analysis' : signal.replace(/_/g, ' ')}</span>)}</div>
            {analysis.top_viral_clips.length === 0 ? <div className="clip-empty">No clip candidates were returned for this video.</div> : (
              <div className="clip-result-list">
                {analysis.top_viral_clips.map((clip) => (
                  <button className="clip-result-card" key={clip.clip_id} onClick={() => openClip(clip)}>
                    <span className="clip-rank">{String(clip.rank).padStart(2, '0')}</span>
                    <span className="clip-card-main"><strong>{clip.start_time} — {clip.end_time}</strong><span>{clip.suggested_title}</span><small>{clip.duration_seconds.toFixed(1)} sec · AI visual score {clip.visual_assessment.visual_hook_score}/10</small></span>
                    <span className="clip-score">{clip.virality_score}</span><ChevronRight size={17} />
                  </button>
                ))}
              </div>
            )}
            <button className="clip-secondary-action" onClick={() => { setScreen('input'); setAnalysisError(null); }}><RefreshCw size={15} /> Analyze another video</button>
          </section>
        )}

        {screen === 'detail' && selectedClip && analysis && (
          <section className="clip-detail">
            <div className="clip-heading clip-detail-heading">
              <div className="clip-kicker">CLIP {String(selectedClip.rank).padStart(2, '0')} · LOCAL VIDEO</div>
              <h1>{selectedClip.start_time}<br /><span>to {selectedClip.end_time}</span></h1>
              <p>{selectedClip.duration_seconds.toFixed(1)} seconds · 9:16 recommended</p>
            </div>
            {analysis.source_type === 'local_file' && localPreviewUrl && (
              <div className="clip-preview-wrap">
                <video
                  className="clip-preview-video"
                  ref={localVideoRef}
                  src={localPreviewUrl}
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={() => {
                    const video = localVideoRef.current;
                    if (!video) return;
                    video.currentTime = Math.min(selectedClip.start_seconds, video.duration);
                    setPreviewElapsed(0);
                  }}
                  onTimeUpdate={() => {
                    const video = localVideoRef.current;
                    if (!video) return;
                    if (video.currentTime >= selectedClip.end_seconds) {
                      video.pause();
                      video.currentTime = selectedClip.end_seconds;
                      setPreviewElapsed(selectedClip.duration_seconds);
                      setPreviewPlaying(false);
                      return;
                    }
                    setPreviewElapsed(Math.max(0, video.currentTime - selectedClip.start_seconds));
                  }}
                  onPause={() => setPreviewPlaying(false)}
                  onEnded={() => setPreviewPlaying(false)}
                />
                <div className="clip-preview-controls">
                  <button type="button" className="clip-preview-toggle" onClick={() => void toggleClipPreview()} aria-label={previewPlaying ? 'Pause clip preview' : 'Play clip preview'}>
                    {previewPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <input
                    aria-label="Clip preview position"
                    type="range"
                    min={0}
                    max={Math.max(selectedClip.duration_seconds, 0.1)}
                    step={0.1}
                    value={Math.min(previewElapsed, selectedClip.duration_seconds)}
                    onChange={(event) => {
                      const elapsed = Number(event.target.value);
                      setPreviewElapsed(elapsed);
                      if (localVideoRef.current) localVideoRef.current.currentTime = Math.min(selectedClip.start_seconds + elapsed, selectedClip.end_seconds);
                    }}
                  />
                  <span className="clip-preview-time">{formatClipClock(selectedClip.start_seconds + previewElapsed)} / {formatClipClock(selectedClip.end_seconds)}</span>
                </div>
              </div>
            )}
            <button className="clip-download-button" type="button" onClick={() => void downloadSelectedClip()} disabled={isDownloading}>
              {isDownloading ? <><LoaderCircle className="clip-spin" size={17} />Rendering clip</> : <><Download size={17} />Download clipped video</>}
            </button>
            {downloadError && <div className="clip-error" role="alert">{downloadError}</div>}
            <div className="clip-openai-panel">
              <div className="clip-section-title"><span><Sparkles size={15} /></span><h2>Visual assessment</h2></div>
              <div className="clip-visual-score"><strong>{selectedClip.visual_assessment.visual_hook_score.toFixed(1)}</strong><span>/ 10 visual hook</span></div>
              <p>{selectedClip.visual_assessment.facial_expression}</p>
              <small>{selectedClip.visual_assessment.visual_hook_summary}</small>
              <div className="clip-crop-value">9:16 crop center <b>{selectedClip.visual_assessment.face_crop_center_x.toFixed(1)}%</b></div>
            </div>
            {selectedClip.transcript_snippet && <div className="clip-transcript"><span>TRANSCRIPT</span><p>{selectedClip.transcript_snippet}</p></div>}
            <div className="clip-score-explanation"><span>RANKING SIGNAL</span><p>{selectedClip.why_viral}</p></div>
          </section>
        )}
      </div>
    </main>
  );
};
