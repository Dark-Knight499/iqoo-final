import React from 'react';

interface AnalysisProgressProps {
  progress: number | null;
  isAnalyzing: boolean;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress, isAnalyzing }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
          {isAnalyzing ? 'Uploading & running on-device models...' : 'Analysis finished'}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
          {isAnalyzing ? 'LIVE' : `${progress ?? 100}%`}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#1b1e24',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: isAnalyzing ? '45%' : `${progress ?? 100}%`,
            backgroundColor: 'var(--ai-accent)',
            boxShadow: '0 0 10px rgba(216, 255, 0, 0.8)',
            borderRadius: '999px',
            transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: isAnalyzing ? 'analysis-indeterminate 1.4s ease-in-out infinite alternate' : undefined,
          }}
        />
      </div>
    </div>
  );
};
