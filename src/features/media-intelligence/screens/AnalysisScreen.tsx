import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, Video } from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { primaryDemoVideo } from '../data/mockMedia';
import { ContentPreview } from '../components/ContentPreview';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { AnalysisStage } from '../components/AnalysisStage';

export const AnalysisScreen: React.FC = () => {
  const {
    importedMedia,
    analysisStages,
    analysisProgress,
    isAnalysisComplete,
    navigateTo,
  } = useMediaIntelligenceStore();

  const currentMedia = importedMedia || primaryDemoVideo;

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
      <div style={{ marginBottom: '20px' }}>
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
            Step 2: Processing
          </span>
        </div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Exploring sample analysis
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
          Playing back prewritten demo results for {currentMedia.title}; no media is being processed.
        </p>
      </div>

      {/* Video Preview at Top */}
      <div style={{ marginBottom: '20px' }}>
        <ContentPreview media={currentMedia} height="180px" />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <AnalysisProgress progress={analysisProgress} />
      </div>

      {/* Analysis Modules / Progressive Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#64748B',
            marginBottom: '4px',
          }}
        >
           Sample analysis stages
        </span>
        {analysisStages.map((stage) => (
          <AnalysisStage key={stage.id} stage={stage} />
        ))}
      </div>

      {/* Action CTA: View Analysis (Enabled once complete) */}
      <div
        style={{
          position: 'sticky',
          bottom: '20px',
          marginTop: 'auto',
          paddingTop: '12px',
        }}
      >
        <button
          onClick={() => navigateTo('ml-analysis')}
          disabled={!isAnalysisComplete}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: isAnalysisComplete ? '#2563EB' : '#E2E8F0',
            color: isAnalysisComplete ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isAnalysisComplete ? 'pointer' : 'not-allowed',
            boxShadow: isAnalysisComplete ? '0 4px 16px rgba(37, 99, 235, 0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
           <span>{isAnalysisComplete ? 'View sample analysis' : 'Loading sample results...'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
