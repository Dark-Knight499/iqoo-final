import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  Layers, 
  Users, 
  Box, 
  Tag, 
  Clock, 
  Sparkles,
  Bot
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { 
  mockMetrics, 
  mockTranscript, 
  mockScenes, 
  mockObjects, 
  mockTopics 
} from '../data/mockAnalysis';
import { MetricCard } from '../components/MetricCard';
import { TranscriptView } from '../components/TranscriptView';
import { SceneCard } from '../components/SceneCard';
import { EntityChip } from '../components/EntityChip';

export const ContentAnalysisScreen: React.FC = () => {
  const { navigateTo, goBack } = useMediaIntelligenceStore();

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
      {/* Top Bar with Back */}
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
          <span>Back</span>
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
          Step 3: ML Extraction
        </span>
      </div>

      {/* Screen Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Content Analysis
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Prewritten analysis of the sample video, not extracted from an uploaded file.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
        <MetricCard label="Video" value={mockMetrics.duration} icon={<Video size={14} />} />
        <MetricCard label="Scenes" value={mockMetrics.scenesCount} icon={<Layers size={14} />} />
        <MetricCard label="Speakers" value={mockMetrics.speakersCount} icon={<Users size={14} />} />
        <MetricCard label="Objects" value={mockMetrics.objectsCount} icon={<Box size={14} />} />
        <MetricCard label="Topics" value={mockMetrics.topicsCount} icon={<Tag size={14} />} />
        <MetricCard label="Key Moments" value={mockMetrics.momentsCount} icon={<Clock size={14} />} />
      </div>

      {/* Section 1: TRANSCRIPT */}
      <div style={{ marginBottom: '28px' }}>
        <TranscriptView segments={mockTranscript} />
      </div>

      {/* Section 2: SCENES */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Detected Scenes
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>12 cuts identified</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mockScenes.slice(0, 3).map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </div>
      </div>

      {/* Section 3: OBJECTS */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Detected Objects
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>18 items tagged</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {mockObjects.map((obj) => (
            <EntityChip key={obj} label={obj} variant="object" />
          ))}
        </div>
      </div>

      {/* Section 4: TOPICS */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Identified Topics
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Semantic concepts</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {mockTopics.map((topic) => (
            <EntityChip key={topic} label={topic} variant="topic" />
          ))}
        </div>
      </div>

      {/* Bottom Floating Navigation: Proceed to LLM Understanding */}
      <div style={{ position: 'sticky', bottom: '20px', marginTop: 'auto' }}>
        <button
          onClick={() => navigateTo('llm-understanding')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
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
          <Bot size={18} />
          <span>Next: AI Understanding</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
