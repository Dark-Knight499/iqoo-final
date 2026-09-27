import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Clock, 
  Eye, 
  Tag, 
  Layers, 
  FileText, 
  CheckCircle2,
  Bookmark,
  RotateCcw
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { primaryDemoVideo } from '../data/mockMedia';
import { 
  mockTranscript, 
  mockScenes, 
  mockTopics, 
  mockEntities, 
  mockKeyMoments, 
  mockLLMUnderstanding 
} from '../data/mockAnalysis';
import { ContentPreview } from '../components/ContentPreview';
import { EntityChip } from '../components/EntityChip';
import { SceneCard } from '../components/SceneCard';
import { useAppStore } from '@/shared/state/app.store';

type DetailTab = 'overview' | 'transcript' | 'scenes' | 'entities' | 'moments';

export const ContentDetailScreen: React.FC = () => {
  const { goBack, resetFlow, navigateTo, selectedCatalogMedia, importedMedia, remoteSuggestions, isAnalysisComplete } = useMediaIntelligenceStore();
  const { showToast, closeModal, setActiveTab } = useAppStore();
  const [activeTab, setActiveTabLocal] = useState<DetailTab>('overview');

  const media = selectedCatalogMedia || importedMedia || primaryDemoVideo;
  const isDemo = !media.sourceUrl;

  if (!isDemo) return <div style={{ minHeight: '100%', padding: '24px 20px', background: '#F7F8FA', color: '#0F172A' }}>
     <button onClick={goBack} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer' }}><ArrowLeft size={16} aria-hidden="true" /> Catalog</button>
    <h1 style={{ fontSize: '22px' }}>{media.title}</h1>
    <p>Backend text analysis · {media.duration}. No video was uploaded or rendered in this app.</p>
    <p>Source URL: <a href={media.sourceUrl} target="_blank" rel="noreferrer">{media.sourceUrl}</a></p>
    <h2 style={{ fontSize: '16px' }}>Suggested clip ranges</h2>
    {remoteSuggestions?.length ? remoteSuggestions.map((suggestion) => <div key={suggestion.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 10 }}>
      <strong>{suggestion.title}</strong> · {suggestion.timestampRange}<p>{suggestion.reason}</p>
    </div>) : <p>No clip suggestions returned for this URL.</p>}
  </div>;

  const handleRestartDemo = () => {
    resetFlow();
    showToast('Demo reset: Ready to Import');
  };

  const handleOpenCreatorIntelligence = () => {
    closeModal();
    setActiveTab('insights');
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
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={goBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Catalog</span>
        </button>

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
          Step 8: Deep Knowledge
        </span>
      </div>

      {/* Large Media Preview at Top */}
      <div style={{ marginBottom: '16px' }}>
        <ContentPreview media={media} height="220px" />
      </div>

      {/* Title & Metadata Strip */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
          {media.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <span>{media.duration}</span>
          <span className="meta-separator" aria-hidden="true" />
          <span style={{ textTransform: 'capitalize' }}>{media.type}</span>
          <span className="meta-separator" aria-hidden="true" />
          <span style={{ color: '#16A34A', fontWeight: 600 }}>{isAnalysisComplete ? 'Sample analysis' : 'Sample metadata'}</span>
        </div>
      </div>

      {/* Tabs Bar: [Overview] [Transcript] [Scenes] [Entities] [Moments] */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '20px',
          scrollbarWidth: 'none',
        }}
      >
        {(['overview', 'transcript', 'scenes', 'entities', 'moments'] as DetailTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTabLocal(tab)}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#64748B',
                border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '12px', color: '#64748B' }}>Prewritten example for the sample video; not extracted from an uploaded file.</p>
          {/* Summary Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '8px' }}>
              Summary
            </span>
            <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.6 }}>
              {mockLLMUnderstanding.summary}
            </p>
          </div>

          {/* Topics & Entities */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
              Indexed Topics
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {mockTopics.map((t) => (
                <EntityChip key={t} label={t} variant="topic" />
              ))}
            </div>
          </div>

          {/* AI Insights Card */}
          <div style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', padding: '16px', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} color="#2563EB" />
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#1D4ED8' }}>
                Sample Creative Insights
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: 1.5 }}>
              This piece holds 3 prime moments for viral short-form syndication. The segment at 01:42 specifically has high conversational retention potential.
            </p>
          </div>
        </div>
      )}

      {/* 2. TRANSCRIPT */}
      {activeTab === 'transcript' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockTranscript.map((seg) => (
            <div
              key={seg.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  alignSelf: 'flex-start',
                }}
              >
                {seg.timestamp}
              </span>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  {seg.speaker}
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#0F172A', lineHeight: 1.5 }}>
                  "{seg.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SCENES */}
      {activeTab === 'scenes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockScenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </div>
      )}

      {/* 4. ENTITIES */}
      {activeTab === 'entities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Recognized Hardware & Brands
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {mockEntities.map((e) => (
                <EntityChip key={e} label={e} variant="entity" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MOMENTS */}
      {activeTab === 'moments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockKeyMoments.map((mom, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                  {mom.timestamp}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {mom.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {mom.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sticky Action Bar: Demo Complete Buttons */}
      <div
        style={{
          position: 'sticky',
          bottom: '20px',
          marginTop: 'auto',
          paddingTop: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '10px',
        }}
      >
        <button
          onClick={handleRestartDemo}
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          <span>Restart Demo</span>
        </button>

        <button
          onClick={handleOpenCreatorIntelligence}
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          }}
        >
          <Sparkles size={15} />
          <span>Open Intelligence</span>
        </button>
      </div>
    </div>
  );
};
