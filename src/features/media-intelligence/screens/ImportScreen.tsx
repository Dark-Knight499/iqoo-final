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
    <main style={{ minHeight: '100%', padding: '24px 20px calc(32px + env(safe-area-inset-bottom))', background: '#F7F8FA', color: '#0F172A' }}>
      <header style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase' }}>Local video analysis</span>
        <h1 style={{ margin: '10px 0 6px', fontSize: 27, fontWeight: 800, letterSpacing: '-.5px' }}>Analyze a video</h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Choose a video from this device. Analysis runs on the computer hosting this app.</p>
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
          style={{ width: '100%', minHeight: 190, padding: 24, borderRadius: 20, border: '2px dashed #93C5FD', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 10, color: '#1D4ED8' }}
        >
          <span style={{ width: 54, height: 54, borderRadius: 18, background: '#EFF6FF', display: 'grid', placeItems: 'center' }}><UploadCloud size={27} /></span>
          <strong style={{ color: '#0F172A', fontSize: 16 }}>Choose video</strong>
          <span style={{ color: '#64748B', fontSize: 13 }}>MP4, MOV, MKV, WebM or M4V · up to 3 GB</span>
        </button>
      ) : (
        <section style={{ padding: 16, borderRadius: 20, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <video src={importedMedia.previewUrl} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 250, borderRadius: 12, background: '#020617', objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <CheckCircle2 size={22} color="#16A34A" />
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', overflowWrap: 'anywhere', fontSize: 14 }}>{importedMedia.title}</strong>
              <span style={{ color: '#64748B', fontSize: 12 }}>{importedMedia.size} · video stays on this local network</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" onClick={() => inputRef.current?.click()} style={{ minHeight: 46, borderRadius: 12, border: '1px solid #CBD5E1', color: '#334155', fontWeight: 700 }}>Choose another</button>
            <button type="button" onClick={() => void startAnalysis()} style={{ minHeight: 46, borderRadius: 12, background: '#2563EB', color: '#FFFFFF', fontWeight: 700, gap: 8 }}><Film size={17} /> Analyze <ArrowRight size={17} /></button>
          </div>
        </section>
      )}

      {(selectionError || analysisError) && <p role="alert" style={{ marginTop: 14, color: '#B91C1C', fontSize: 13 }}>{selectionError || analysisError}</p>}
      <aside style={{ marginTop: 22, padding: 14, borderRadius: 14, background: '#EFF6FF', color: '#334155', fontSize: 12, lineHeight: 1.6 }}>
        <strong style={{ color: '#1D4ED8' }}>Use from your phone</strong><br />
        Connect the phone and host computer to the same Wi-Fi, run <code>npm run mobile</code> on the computer, then open the Network URL printed in that terminal. Select a video from the phone’s gallery or files.
      </aside>
      {importedMedia && <button type="button" onClick={resetFlow} style={{ marginTop: 14, color: '#64748B', fontSize: 13 }}>Clear selected video</button>}
    </main>
  );
};
