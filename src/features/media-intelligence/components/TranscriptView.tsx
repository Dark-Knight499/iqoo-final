import React, { useState } from 'react';
import { TranscriptSegment } from '../types/mediaIntelligence';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TranscriptViewProps {
  segments: TranscriptSegment[];
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ segments }) => {
  const [showFull, setShowFull] = useState(false);
  const displaySegments = showFull ? segments : segments.slice(0, 4);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          Transcript
        </h4>
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
          {segments.length} segments indexed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displaySegments.map((seg) => (
          <div
            key={seg.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #F1F5F9',
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
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {seg.timestamp}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#1E293B',
                lineHeight: 1.5,
              }}
            >
              "{seg.text}"
            </p>
          </div>
        ))}
      </div>

      {segments.length > 4 && (
        <button
          onClick={() => setShowFull(!showFull)}
          style={{
            marginTop: '4px',
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <span>{showFull ? 'Show Less' : 'View Full Transcript'}</span>
          {showFull ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
};
