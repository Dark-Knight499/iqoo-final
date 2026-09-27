import React from 'react';
import { AlertCircle, Check, Circle } from 'lucide-react';
import { AnalysisStage as StageType } from '../types/mediaIntelligence';

interface AnalysisStageProps {
  stage: StageType;
}

export const AnalysisStage: React.FC<AnalysisStageProps> = ({ stage }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '10px',
        backgroundColor: stage.active ? '#EFF6FF' : stage.status === 'failed' ? '#FEF2F2' : '#FFFFFF',
        border: stage.active ? '1px solid #BFDBFE' : stage.status === 'failed' ? '1px solid #FECACA' : '1px solid #F1F5F9',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: stage.status === 'failed'
            ? '#DC2626'
            : stage.status === 'partial'
            ? '#D97706'
            : stage.completed
            ? '#2563EB'
            : stage.active
            ? '#3B82F6'
            : '#F1F5F9',
          color: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        {stage.status === 'failed' ? (
          <AlertCircle size={14} />
        ) : stage.completed ? (
          <Check size={13} strokeWidth={3} />
        ) : stage.active ? (
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: '2px solid #FFFFFF',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
          <Circle size={8} fill="#CBD5E1" stroke="none" />
        )}
      </div>

      <span
        style={{
          fontSize: '13px',
          fontWeight: stage.completed || stage.active ? 600 : 500,
          color: stage.completed ? '#0F172A' : stage.active ? '#1D4ED8' : '#64748B',
        }}
      >
        {stage.label}
      </span>
      {stage.message && <span style={{ marginLeft: 'auto', fontSize: '10px', color: stage.status === 'failed' ? '#B91C1C' : '#92400E' }}>{stage.message}</span>}
    </div>
  );
};
