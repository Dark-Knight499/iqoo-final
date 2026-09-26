import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  FileText, 
  Layers, 
  Box, 
  Tag, 
  UserCheck, 
  Bot, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { mockLLMUnderstanding } from '../data/mockAnalysis';

const PIPELINE_STEPS = [
  { label: 'ML Analysis', icon: <Cpu size={12} /> },
  { label: 'Transcript', icon: <FileText size={12} /> },
  { label: 'Scenes', icon: <Layers size={12} /> },
  { label: 'Entities', icon: <Box size={12} /> },
  { label: 'Topics', icon: <Tag size={12} /> },
  { label: 'Creator Profile', icon: <UserCheck size={12} /> },
  { label: 'LLM Reasoning', icon: <Bot size={12} /> },
  { label: 'Creative Understanding', icon: <Sparkles size={12} /> },
];

export const AIUnderstandingScreen: React.FC = () => {
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
          Step 4: LLM Reasoning
        </span>
      </div>

      {/* Screen Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          AI Understanding
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Turning extracted signals into creative context.
        </p>
      </div>

      {/* Visual Pipeline Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#64748B',
            display: 'block',
            marginBottom: '10px',
          }}
        >
          Reasoning Pipeline
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {PIPELINE_STEPS.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: idx === PIPELINE_STEPS.length - 1 ? '#EFF6FF' : '#F8FAFC',
                  border: idx === PIPELINE_STEPS.length - 1 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  color: idx === PIPELINE_STEPS.length - 1 ? '#1D4ED8' : '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {step.icon}
                <span>{step.label}</span>
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <ChevronRight size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Cards Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {/* 1. CONTENT SUMMARY */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#2563EB' }}>
              CONTENT SUMMARY
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.6, fontWeight: 500 }}>
            "{mockLLMUnderstanding.summary}"
          </p>
        </div>

        {/* 2. KEY THEMES */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
            KEY THEMES
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {mockLLMUnderstanding.keyThemes.map((th) => (
              <span
                key={th}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {th}
              </span>
            ))}
          </div>
        </div>

        {/* 3. CONTENT STRUCTURE */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
            CONTENT STRUCTURE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            {mockLLMUnderstanding.contentStructure.map((st, i) => (
              <React.Fragment key={st}>
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {st}
                </span>
                {i < mockLLMUnderstanding.contentStructure.length - 1 && (
                  <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 4. CREATOR STYLE */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
            CREATOR STYLE FINGERPRINT
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {mockLLMUnderstanding.creatorStyle.map((cs) => (
              <span
                key={cs}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#6D28D9',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {cs}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button: Generate Suggestions */}
      <div style={{ position: 'sticky', bottom: '20px', marginTop: 'auto' }}>
        <button
          onClick={() => navigateTo('suggestions')}
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
          <Sparkles size={18} />
          <span>Generate Suggestions</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
