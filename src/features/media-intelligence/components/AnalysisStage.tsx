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
        borderRadius: '12px',
        backgroundColor: stage.active
          ? 'var(--ai-soft)'
          : stage.status === 'failed'
          ? 'rgba(239, 68, 68, 0.1)'
          : 'var(--bg-surface-2)',
        border: stage.active
          ? '1px solid var(--ai-border)'
          : stage.status === 'failed'
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.06)',
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
            ? '#EF4444'
            : stage.status === 'partial'
            ? '#F59E0B'
            : stage.completed
            ? '#16A34A'
            : stage.active
            ? 'var(--ai-accent)'
            : '#22262d',
          color: stage.active ? '#080808' : '#FFFFFF',
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
              border: '2px solid #080808',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
          <Circle size={6} fill="#64748B" stroke="none" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: stage.active ? 'var(--ai-accent)' : '#fff' }}>
          {stage.label}
        </div>
      </div>

      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: stage.status === 'failed'
            ? '#EF4444'
            : stage.completed
            ? '#16A34A'
            : stage.active
            ? 'var(--ai-accent)'
            : 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '.4px',
        }}
      >
        {stage.status === 'failed'
          ? 'Failed'
          : stage.completed
          ? 'Complete'
          : stage.active
          ? 'Running'
          : 'Pending'}
      </span>
    </div>
  );
};
