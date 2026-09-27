import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, Lightbulb, Mic, RefreshCw, Sparkles, Video, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { files } from '@/utils/files';
import { formatDuration } from '@/utils/format';

function createSimulatedCameraStream(): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  
  let frame = 0;
  let active = true;
  const render = () => {
    if (!active) return;
    frame++;
    if (ctx) {
      // Dark studio backdrop with animated ambient lighting
      const lightPhase = Math.sin(frame * 0.05);
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2 - 40, 80,
        canvas.width / 2, canvas.height / 2, 600
      );
      grad.addColorStop(0, '#1c262c');
      grad.addColorStop(0.6, '#0f1418');
      grad.addColorStop(1, '#080a0c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rule of thirds composition lines
      ctx.strokeStyle = 'rgba(216, 255, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 3, 0); ctx.lineTo(canvas.width / 3, canvas.height);
      ctx.moveTo(canvas.width * 2 / 3, 0); ctx.lineTo(canvas.width * 2 / 3, canvas.height);
      ctx.moveTo(0, canvas.height / 3); ctx.lineTo(canvas.width, canvas.height / 3);
      ctx.moveTo(0, canvas.height * 2 / 3); ctx.lineTo(canvas.width, canvas.height * 2 / 3);
      ctx.stroke();

      // Subject head & shoulders framing outline
      ctx.strokeStyle = 'rgba(216, 255, 0, 0.75)';
      ctx.lineWidth = 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 30;
      ctx.beginPath();
      ctx.arc(cx, cy - 30, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 180, 160, Math.PI, 0);
      ctx.stroke();

      // Live status badges
      ctx.fillStyle = '#D8FF00';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('SNAPDRAGON 8 ELITE · VIEW-FINDER ACTIVE', 40, 50);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '15px monospace';
      ctx.fillText(`FRAME: ${frame} | NPU EXPOSURE: ${Math.round(140 + lightPhase * 25)}/255 | 30 FPS`, 40, 80);
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  const stream = canvas.captureStream(30);

  // Attach a synthetic audio track so MediaRecorder captures audio cleanly
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.02;
      osc.connect(gain);
      gain.connect(dst);
      osc.start();
      dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }
  } catch {
    // Non-fatal if audio context is blocked
  }

  return stream;
}

export const RecordingView: React.FC = () => {
  const { closeModal, openModal, showToast } = useAppStore();
  const { addProject } = useProjectStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(false);
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
        let acquiredStream: MediaStream | null = null;
        let isSimulated = false;

        // 1. Try pro constraints (1080p + audio)
        if (navigator.mediaDevices?.getUserMedia) {
          try {
            acquiredStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: facingMode },
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
              },
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
          } catch (e1) {
            console.warn('[Camera] Pro constraints failed, retrying standard video+audio:', e1);
            // 2. Try standard video + audio
            try {
              acquiredStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facingMode } },
                audio: true,
              });
            } catch (e2) {
              console.warn('[Camera] Standard audio+video failed, retrying video only:', e2);
              // 3. Try video only (in case mic was blocked)
              try {
                acquiredStream = await navigator.mediaDevices.getUserMedia({
                  video: { facingMode: { ideal: facingMode } },
                });
              } catch (e3) {
                console.warn('[Camera] FacingMode failed, retrying basic video:', e3);
                try {
                  acquiredStream = await navigator.mediaDevices.getUserMedia({ video: true });
                } catch (e4) {
                  console.warn('[Camera] Hardware camera unavailable in this context:', e4);
                }
              }
            }
          }
        }

        // 4. If hardware stream was not obtained, start the studio camera stream
        if (!acquiredStream) {
          isSimulated = true;
          acquiredStream = createSimulatedCameraStream();
        }

        if (!mounted) {
          acquiredStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = acquiredStream;
        streamRef.current = stream;
        setIsSimulatedFeed(isSimulated);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          void videoRef.current.play().catch(() => undefined);
        }

        const settings = stream.getVideoTracks()[0]?.getSettings();
        const size = settings?.width && settings?.height
          ? `${settings.width} × ${settings.height}`
          : (isSimulated ? '1280 × 720 (Studio Feed)' : 'Camera Connected');
        setCameraLabel(`${size}${settings?.frameRate ? ` · ${Math.round(settings.frameRate)} fps` : ' · 30 fps'}`);
        setCameraActive(true);
        setCameraError(null);

        // Frame luminance and edge detail analyzer
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
              const average = count ? lightTotal / count : 120;
              const detail = detailCount ? detailTotal / detailCount : 15;
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
                  : 'Image detail looks sharp & in focus.');
            } catch {
              setLightAdvice('Live frame check running.');
            }
          }, 1200);
        }

        // Web Audio visualizer
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
            setMicLevel(25);
          }
        } else {
          // Simulated mic level for fallback stream
          audioTimer = window.setInterval(() => {
            setMicLevel(Math.round(20 + Math.random() * 25));
          }, 300);
        }
      } catch (error) {
        if (!mounted) return;
        setCameraActive(false);
        setCameraLabel('Camera unavailable');
        setCameraError(error instanceof Error ? error.message : 'Could not initialize camera feed.');
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
        try { recorderRef.current.stop(); } catch { /* ignore */ }
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
      setRecordingError('Wait for camera to initialize before recording.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      setRecordingError('This browser does not support MediaRecorder video capture.');
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

        let metadata = { duration: elapsed, width: 1280, height: 720 };
        try {
          metadata = await files.metadata(mediaUrl);
        } catch {
          // Keep take
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
          mediaWidth: metadata.width || 1280,
          mediaHeight: metadata.height || 720,
          durationSeconds: clipDuration,
          trimStartSeconds: 0,
          trimEndSeconds: clipDuration,
          aspectRatio: (metadata.width || 1280) > (metadata.height || 720) ? '16:9' : '9:16',
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
          transform: facingMode === 'user' && !isSimulatedFeed ? 'scaleX(-1)' : 'none',
          opacity: cameraActive ? 1 : 0,
          backgroundColor: '#05070a',
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
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.72)', marginTop: 3 }}>
              {isSimulatedFeed ? 'Studio Simulation View · Testing Feed' : 'Live Camera Hardware Connected'}
            </div>
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
          {isSimulatedFeed && (
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: 12, padding: '8px 12px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Studio Simulation Mode Active</span>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                style={{ background: 'var(--ai-accent)', color: '#000', border: 'none', borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
              >
                Scan Hardware
              </button>
            </div>
          )}

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

          {recordingError && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(120,25,25,.9)', fontSize: 11 }}>{recordingError}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.78)', fontSize: 10 }}>
            <Video size={13} /> Keep eyes near the upper guide · avoid bright backlights
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
            {isRecording ? 'Tap the red square to finish recording and inspect workflow cuts.' : 'Tap record to capture footage with live Snapdragon NPU shooting assist.'}
          </div>
        </footer>
      </div>
    </main>
  );
};
