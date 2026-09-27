import React, { useState } from 'react';
import { 
  Video, 
  Mic, 
  Image as ImageIcon, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { primaryDemoVideo } from '../data/mockMedia';
import { useCreatorStore } from '@/shared/state/creator.store';

export const ImportScreen: React.FC = () => {
  const { importedMedia, importMedia, startAnalysis, isAnalyzing, analysisError } = useMediaIntelligenceStore();
  const { creator } = useCreatorStore();
  const [videoUrl, setVideoUrl] = useState('');

  const handleImportVideo = () => {
    importMedia(primaryDemoVideo);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#F7F8FA',
        padding: '24px 20px 80px 20px',
        color: '#0F172A',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            Step 1: Input
          </span>
        </div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Add Content
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Analyze a reachable video URL, or explore a sample video dataset.
        </p>
      </div>

      {/* Three Large Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', marginBottom: '24px' }}>
        <button
          onClick={handleImportVideo}
          style={{
            padding: '16px 4px',
            borderRadius: '16px',
            backgroundColor: '#EFF6FF',
            border: '2px solid #2563EB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={20} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8' }}>
            Sample video
          </span>
        </button>

        <button
          disabled
          style={{
            padding: '16px 4px',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'not-allowed',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mic size={20} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
            Audio (unavailable)
          </span>
        </button>

        <button
          disabled
          style={{
            padding: '16px 4px',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'not-allowed',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon size={20} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
            Image (unavailable)
          </span>
        </button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', marginBottom: '18px', border: '1px solid #E2E8F0' }}>
        <label htmlFor="clipping-video-url" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '7px' }}>
          Find text clip suggestions from a video URL
        </label>
        <input
          id="clipping-video-url"
          type="url"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '13px' }}
        />
        <p style={{ margin: '7px 0 10px', fontSize: '11px', lineHeight: 1.4, color: '#64748B' }}>
          The backend analyzes a reachable URL and returns suggested ranges and text. It does not upload, cut, or render a video here.
        </p>
        <button
          onClick={() => startAnalysis(videoUrl, creator.name)}
          disabled={!videoUrl.trim() || isAnalyzing}
          style={{ width: '100%', padding: '11px', border: 'none', borderRadius: '10px', background: !videoUrl.trim() || isAnalyzing ? '#CBD5E1' : '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: !videoUrl.trim() || isAnalyzing ? 'not-allowed' : 'pointer' }}
        >
          {isAnalyzing ? 'Requesting suggestions…' : 'Find clip suggestions'}
        </button>
        {analysisError && <p role="alert" style={{ margin: '9px 0 0', color: '#B91C1C', fontSize: '12px' }}>{analysisError}</p>}
      </div>

      {/* Primary Import Action Box */}
      {!importedMedia ? (
        <div
          onClick={handleImportVideo}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px dashed #CBD5E1',
            padding: '32px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '28px',
            textAlign: 'center',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <UploadCloud size={28} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
             Explore sample video
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
             Loads sample metadata and a prewritten analysis dataset; no file is uploaded.
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleImportVideo();
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
             Select sample
          </button>
        </div>
      ) : (
        /* Successful Import Box */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #86EFAC',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#16A34A" />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                {importedMedia.title}
              </h4>
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748B' }}>
                <span>{importedMedia.duration}</span>
                 <span className="meta-separator" aria-hidden="true" />
                 <span>{importedMedia.sourceUrl ? 'Backend text suggestions (no upload here)' : 'Sample dataset (no upload)'}</span>
              </div>
            </div>
          </div>

          <button
             onClick={() => importedMedia.sourceUrl ? startAnalysis(importedMedia.sourceUrl, creator.name) : startAnalysis()}
             disabled={isAnalyzing}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Sparkles size={18} />
             <span>{importedMedia.sourceUrl ? (isAnalyzing ? 'Requesting suggestions…' : 'Refresh text suggestions') : 'Explore sample analysis'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Recent Files Section */}
      <div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#64748B',
            display: 'block',
            marginBottom: '12px',
          }}
        >
           Available sample
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
           {[primaryDemoVideo].map((file) => (
            <div
              key={file.id}
               onClick={() => importMedia(file)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: file.type === 'video' ? '#EFF6FF' : '#F8FAFC',
                    color: file.type === 'video' ? '#2563EB' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {file.type === 'video' ? <Video size={18} /> : file.type === 'audio' ? <Mic size={18} /> : <ImageIcon size={18} />}
                </div>
                <div>
                  <h5 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {file.title}
                  </h5>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {file.duration} · Sample dataset
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                 Select <ArrowRight size={12} aria-hidden="true" style={{ verticalAlign: 'middle' }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
