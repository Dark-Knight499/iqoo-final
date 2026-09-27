import React from 'react';

interface AnalysisProgressProps {
  progress: number | null;
  isAnalyzing: boolean;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress, isAnalyzing }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
          {isAnalyzing ? 'Uploading and analyzing on the host device' : 'Analysis finished'}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
          {isAnalyzing ? '—' : `${progress ?? 0}%`}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#E2E8F0',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
          width: isAnalyzing ? '38%' : `${progress ?? 0}%`,
          backgroundColor: isAnalyzing ? '#60A5FA' : '#2563EB',
            borderRadius: '999px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: isAnalyzing ? 'analysis-indeterminate 1.4s ease-in-out infinite alternate' : undefined,
          }}
        />
      </div>
    </div>
  );
};
