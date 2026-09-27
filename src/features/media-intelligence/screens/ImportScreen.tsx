import React, { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Film, UploadCloud } from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';

const MAX_FILE_BYTES = 3 * 1024 * 1024 * 1024;

export const ImportScreen: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { importedMedia, selectedFile, analysisError, importVideo, startAnalysis, resetFlow } = useMediaIntelligenceStore();
  const [selectionError, setSelectionError] = useState('');

  const selectFile = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setSelectionError('This file exceeds the 3 GB upload limit.');
      return;
    }
    if (!file.type.startsWith('video/') && !/\.(mp4|mov|mkv|webm|m4v)$/i.test(file.name)) {
      setSelectionError('Choose an MP4, MOV, MKV, WebM, or M4V video.');
      return;
    }
    setSelectionError('');
    importVideo(file);
  };

  return (
    <main
      style={{
        minHeight: '100%',
        padding: '24px 20px calc(32px + env(safe-area-inset-bottom))',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            background: 'var(--ai-soft)',
            color: 'var(--ai-accent)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
          }}
        >
          Local video analysis
        </span>
        <h1 style={{ margin: '10px 0 6px', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>
          Analyze a video
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
          Choose a video from this device. Whisper transcription and YOLO vision run locally on your host.
        </p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mp4,.mov,.mkv,.webm,.m4v"
        hidden
        onChange={(event) => {
          selectFile(event.currentTarget.files?.[0]);
          event.currentTarget.value = '';
        }}
      />

      {!selectedFile || !importedMedia ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: '100%',
            minHeight: 190,
            padding: 24,
            borderRadius: 20,
            border: '2px dashed var(--ai-border)',
            background: 'var(--bg-surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            color: 'var(--ai-accent)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: 'var(--ai-soft)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <UploadCloud size={27} />
          </span>
          <strong style={{ color: '#fff', fontSize: 16 }}>Choose video</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>MP4, MOV, MKV, WebM or M4V · up to 3 GB</span>
        </button>
      ) : (
        <section
          style={{
            padding: 16,
            borderRadius: 20,
            background: 'var(--bg-surface-2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <video
            src={importedMedia.previewUrl}
            controls
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              maxHeight: 250,
              borderRadius: 14,
              background: '#020617',
              objectFit: 'contain',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <CheckCircle2 size={22} color="var(--ai-accent)" />
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', overflowWrap: 'anywhere', fontSize: 14, color: '#fff' }}>
                {importedMedia.title}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {importedMedia.size} · video stays on this local device
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                minHeight: 46,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1a1f26',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Choose another
            </button>
            <button
              type="button"
              onClick={() => void startAnalysis()}
              style={{
                minHeight: 46,
                borderRadius: 12,
                background: 'var(--ai-accent)',
                color: '#080808',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Film size={17} />
              <span>Start Analysis</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {(selectionError || analysisError) && (
        <p role="alert" style={{ marginTop: 14, color: '#FF5C6C', fontSize: 13 }}>
          {selectionError || analysisError}
        </p>
      )}

      <aside
        style={{
          marginTop: 22,
          padding: 14,
          borderRadius: 14,
          background: 'var(--bg-surface-2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--ai-accent)' }}>Use from your phone</strong>
        <br />
        Connect your phone to the same Wi-Fi, open the LAN host address on your mobile browser, and select any video directly from your camera roll.
      </aside>

      {importedMedia && (
        <button
          type="button"
          onClick={resetFlow}
          style={{
            marginTop: 14,
            color: 'var(--text-muted)',
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Clear selected video
        </button>
      )}
    </main>
  );
};
