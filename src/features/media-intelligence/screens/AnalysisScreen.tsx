import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    isAnalyzing,
    navigateTo,
    goBack,
    analysisError,
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
          Understanding your content
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
          {isAnalysisComplete ? `Static analysis for ${currentMedia.title}` : `Analyzing ${currentMedia.title} on the host computer`}
        </p>
      </div>

      {/* Video Preview at Top */}
      <div style={{ marginBottom: '20px' }}>
        <ContentPreview media={currentMedia} height="180px" />
      </div>

      {/* Progress Bar */}
      {!analysisError && <div style={{ marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <AnalysisProgress progress={analysisProgress} isAnalyzing={isAnalyzing} />
      </div>}
      {analysisError && <p role="alert" style={{ marginBottom: 18, color: '#B91C1C', fontSize: 13 }}>{analysisError}</p>}

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
          Analysis Modules
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
          onClick={() => isAnalysisComplete ? navigateTo('ml-analysis') : goBack()}
          disabled={isAnalyzing}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: isAnalysisComplete || analysisError ? '#2563EB' : '#E2E8F0',
            color: isAnalysisComplete || analysisError ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isAnalyzing ? 'wait' : 'pointer',
            boxShadow: isAnalysisComplete ? '0 4px 16px rgba(37, 99, 235, 0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {isAnalysisComplete ? <><span>View Analysis</span><ArrowRight size={18} /></> : <><ArrowLeft size={18} /><span>{analysisError ? 'Choose another video' : 'Back to video'}</span></>}
        </button>
      </div>
    </div>
  );
};
