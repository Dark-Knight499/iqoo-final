import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, Lightbulb, Mic, RefreshCw, Sparkles, Video } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { files } from '@/utils/files';
import { formatDuration } from '@/utils/format';

export const RecordingView: React.FC = () => {
  const { closeModal, openModal, showToast } = useAppStore();
  const { addProject } = useProjectStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLabel, setCameraLabel] = useState('Starting camera…');
  const [brightness, setBrightness] = useState(0);
  const [lightAdvice, setLightAdvice] = useState('Checking image brightness…');
  const [detailAdvice, setDetailAdvice] = useState('Hold steady while detail is checked.');
  const [micLevel, setMicLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const discardOnUnmountRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;
    let frameTimer = 0;
    let audioTimer = 0;
    let audioContext: AudioContext | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access needs a secure browser context and camera permission.');
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
        const settings = stream.getVideoTracks()[0]?.getSettings();
        const size = settings?.width && settings?.height ? `${settings.width} × ${settings.height}` : 'Camera connected';
        setCameraLabel(`${size}${settings?.frameRate ? ` · ${Math.round(settings.frameRate)} fps` : ''}`);
        setCameraActive(true);
        setCameraError(null);

        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 54;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          frameTimer = window.setInterval(() => {
            const video = videoRef.current;
            if (!video || video.readyState < 2 || !video.videoWidth) return;
            try {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
              const luma = (x: number, y: number) => {
                const offset = (y * canvas.width + x) * 4;
                return pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
              };
              let lightTotal = 0;
              let count = 0;
              let detailTotal = 0;
              let detailCount = 0;
              for (let y = 1; y < canvas.height - 1; y += 2) {
                for (let x = 1; x < canvas.width - 1; x += 2) {
                  const value = luma(x, y);
                  lightTotal += value;
                  count += 1;
                  detailTotal += Math.abs(value - luma(x + 1, y)) + Math.abs(value - luma(x, y + 1));
                  detailCount += 2;
                }
              }
              const average = count ? lightTotal / count : 0;
              const detail = detailCount ? detailTotal / detailCount : 0;
              setBrightness(Math.round(average));
              setLightAdvice(average < 52
                ? 'Too dim — face a window or add a soft light.'
                : average < 82
                  ? 'A little dark — add light to your face.'
                  : average > 212
                    ? 'Very bright — turn away from direct light to protect highlights.'
                    : average > 190
                      ? 'Bright scene — check that highlights are not washing out.'
                      : 'Scene brightness looks balanced.');
              setDetailAdvice(detail < 7
                ? 'Image may be soft — wipe the lens, add light, and hold steady.'
                : detail < 12
                  ? 'Check focus and keep the phone steady.'
                  : 'Image detail looks clear.');
            } catch {
              setLightAdvice('Live frame check is unavailable for this camera.');
            }
          }, 1200);
        }

        if (typeof AudioContext !== 'undefined' && stream.getAudioTracks().length) {
          try {
            audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            audioContext.createMediaStreamSource(stream).connect(analyser);
            void audioContext.resume().catch(() => undefined);
            const samples = new Uint8Array(analyser.fftSize);
            audioTimer = window.setInterval(() => {
              analyser.getByteTimeDomainData(samples);
              let energy = 0;
              for (const sample of samples) {
                const value = (sample - 128) / 128;
                energy += value * value;
              }
              setMicLevel(Math.min(100, Math.round(Math.sqrt(energy / samples.length) * 300)));
            }, 180);
          } catch {
            setMicLevel(0);
          }
        }
      } catch (error) {
        if (!mounted) return;
        setCameraActive(false);
        setCameraLabel('Camera unavailable');
        setCameraError(error instanceof Error ? error.message : 'Could not access the camera or microphone.');
      }
    };

    void startCamera();
    return () => {
      mounted = false;
      window.clearInterval(frameTimer);
      window.clearInterval(audioTimer);
      if (audioContext && audioContext.state !== 'closed') void audioContext.close();
      if (recorderRef.current?.state === 'recording') {
        discardOnUnmountRef.current = true;
        recorderRef.current.onstop = null;
        try { recorderRef.current.stop(); } catch { /* Camera shutdown can race recorder shutdown. */ }
      }
      stream?.getTracks().forEach((track) => track.stop());
      if (streamRef.current === stream) streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facingMode, retryCount]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setRecordSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      return;
    }
    const stream = streamRef.current;
    if (!stream || !cameraActive) {
      setRecordingError('Wait for camera and microphone access before recording.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      setRecordingError('This browser does not support video recording. Try Android Chrome or a recent WebView.');
      return;
    }

    try {
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      discardOnUnmountRef.current = false;
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setRecordingError('The browser could not continue recording this stream.');
      recorder.onstop = async () => {
        if (discardOnUnmountRef.current) return;
        const elapsed = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        chunksRef.current = [];
        recorderRef.current = null;
        if (!blob.size) {
          setRecordingError('No video data was captured. Please try again.');
          return;
        }

        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = `Creator-Take-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
        const file = new File([blob], filename, { type: blob.type || 'video/webm' });
        const mediaUrl = URL.createObjectURL(file);
        let mediaId: string | null = null;
        try {
          mediaId = await files.store(file);
        } catch {
          // IndexedDB fallback
        }

        let metadata = { duration: elapsed, width: 0, height: 0 };
        try {
          metadata = await files.metadata(mediaUrl);
        } catch {
          // Keep take even if metadata read is slow
        }

        const clipDuration = metadata.duration || elapsed;
        addProject({
          title: `Recording ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          description: 'Video recorded with live camera assistance.',
          thumbnailUrl: '',
          mediaUrl,
          mediaId,
          mediaName: filename,
          mediaMimeType: file.type,
          mediaSizeBytes: file.size,
          mediaWidth: metadata.width,
          mediaHeight: metadata.height,
          durationSeconds: clipDuration,
          trimStartSeconds: 0,
          trimEndSeconds: clipDuration,
          aspectRatio: metadata.width > metadata.height ? '16:9' : '9:16',
          clips: [{
            id: `clip_${Date.now()}`,
            mediaUrl,
            title: filename,
            start: 0,
            duration: clipDuration,
            cutIn: 0,
            cutOut: clipDuration,
            speed: 1,
            volume: 1,
          }],
        });
        showToast('Recording saved! Analyzing workflow…');
        openModal('video-analysis');
      };
      recorder.start(250);
      startedAtRef.current = Date.now();
      setRecordSeconds(0);
      setRecordingError(null);
      setIsRecording(true);
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : 'Could not start recording.');
    }
  };

  const handleClose = () => {
    if (isRecording) {
      showToast('Stop recording before leaving the camera.');
      return;
    }
    closeModal();
  };

  const micAdvice = micLevel < 5 ? 'Quiet — move closer to the microphone.' : micLevel > 78 ? 'Loud — move slightly back.' : 'Audio level looks healthy.';

  return (
    <main style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden', color: '#fff' }}>
      <div
        className="media-bg"
        style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/creator-setup.jpg')", backgroundSize: 'cover', opacity: cameraActive ? 0 : 1 }}
      />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          opacity: cameraActive ? 1 : 0,
        }}
      />

      {cameraActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '12% 8%',
            pointerEvents: 'none',
            backgroundImage: [
              'linear-gradient(to right, transparent 33.1%, rgba(255,255,255,.34) 33.3%, transparent 33.6%)',
              'linear-gradient(to right, transparent 66.4%, rgba(255,255,255,.34) 66.7%, transparent 66.9%)',
              'linear-gradient(to bottom, transparent 33.1%, rgba(255,255,255,.34) 33.3%, transparent 33.6%)',
              'linear-gradient(to bottom, transparent 66.4%, rgba(255,255,255,.34) 66.7%, transparent 66.9%)',
            ].join(','),
            borderLeft: '1px solid rgba(255,255,255,.32)',
            borderRight: '1px solid rgba(255,255,255,.32)',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 18px 30px', background: 'linear-gradient(180deg, rgba(0,0,0,.66), rgba(0,0,0,.04) 36%, rgba(0,0,0,.78))' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button onClick={handleClose} aria-label="Back" style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(0,0,0,.58)', color: '#fff', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={19} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: isRecording ? '#FF6B78' : 'var(--ai-accent)' }}>
              {isRecording ? `● RECORDING · ${formatDuration(recordSeconds)}` : cameraLabel}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.72)', marginTop: 3 }}>Live Viewfinder · Snapdragon AI Guidance</div>
          </div>
          <button
            onClick={() => setFacingMode((previous) => previous === 'user' ? 'environment' : 'user')}
            disabled={isRecording}
            aria-label="Switch front or rear camera"
            title={facingMode === 'user' ? 'Switch to rear camera' : 'Switch to front camera'}
            style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(0,0,0,.58)', color: '#fff', display: 'grid', placeItems: 'center', opacity: isRecording ? .45 : 1, border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <section style={{ width: 'min(100%, 440px)', alignSelf: 'center', display: 'grid', gap: 10 }}>
          {cameraError ? (
            <div style={{ background: 'rgba(18,18,18,.92)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 16, padding: 15 }}>
              <strong style={{ fontSize: 14 }}>Camera access needed</strong>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, lineHeight: 1.5, margin: '7px 0 12px' }}>{cameraError}</p>
              <button onClick={() => setRetryCount((count) => count + 1)} style={{ padding: '9px 13px', borderRadius: 10, background: 'var(--ai-accent)', color: '#080808', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Try again</button>
            </div>
          ) : (
            <div style={{ background: 'rgba(10,12,8,.84)', border: '1px solid rgba(216,255,0,.3)', borderRadius: 17, padding: '14px 15px', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ai-accent)', fontSize: 12, fontWeight: 800 }}>
                  <Sparkles size={15} /> SHOOTING ASSIST
                </div>
                <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 9 }}>FRAME ESTIMATE & AUDIO METER</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ width: 48, color: 'rgba(255,255,255,.66)', fontSize: 10 }}>Light</span>
                <div style={{ flex: 1, height: 5, borderRadius: 5, background: 'rgba(255,255,255,.18)' }}>
                  <div style={{ width: `${Math.min(100, brightness / 2.55)}%`, height: '100%', borderRadius: 5, background: brightness < 55 || brightness > 212 ? '#FFCC66' : '#A7F36B', transition: 'width .25s' }} />
                </div>
                <span style={{ minWidth: 35, textAlign: 'right', fontSize: 10 }}>{brightness}/255</span>
              </div>
              <div style={{ fontSize: 11, marginBottom: 5 }}>{lightAdvice}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginBottom: 11 }}>{detailAdvice}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mic size={13} color="var(--ai-accent)" />
                <div style={{ flex: 1, height: 5, borderRadius: 5, background: 'rgba(255,255,255,.18)' }}>
                  <div style={{ width: `${micLevel}%`, height: '100%', borderRadius: 5, background: micLevel < 5 || micLevel > 78 ? '#FFCC66' : '#A7F36B', transition: 'width .15s' }} />
                </div>
                <span style={{ minWidth: 150, textAlign: 'right', color: 'rgba(255,255,255,.72)', fontSize: 10 }}>{micAdvice}</span>
              </div>
            </div>
          )}

          {recordingError && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(120,25,25,.9)', fontSize: 11 }}>{recordingError}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.78)', fontSize: 10 }}>
            <Video size={13} /> Keep eyes near the upper guide · avoid bright windows behind you
          </div>
        </section>

        <footer style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', maxWidth: 360 }}>
            <div style={{ width: 48, display: 'grid', placeItems: 'center', color: 'var(--ai-accent)' }}><Lightbulb size={20} /></div>
            <button
              onClick={toggleRecording}
              disabled={!cameraActive}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              style={{ width: 76, height: 76, borderRadius: '50%', padding: 5, border: '4px solid #fff', background: 'transparent', display: 'grid', placeItems: 'center', opacity: cameraActive ? 1 : .45, cursor: 'pointer' }}
            >
              <span style={{ width: isRecording ? 32 : 58, height: isRecording ? 32 : 58, borderRadius: isRecording ? 8 : '50%', background: '#FF455C', transition: 'all .18s' }} />
            </button>
            <div style={{ width: 48, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.82)' }}><Activity size={20} /></div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.68)', fontSize: 10 }}>
            {isRecording ? 'Tap the red square to finish and analyze the workflow.' : 'Camera and microphone are processed with live NPU shooting guidance.'}
          </div>
        </footer>
      </div>
    </main>
  );
};
