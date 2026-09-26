import React from 'react';
import { AISuggestion } from '../types/mediaIntelligence';
import { Sparkles, Play, Check, Plus, Layers, Video } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  isApproved: boolean;
  onPreview: (sug: AISuggestion) => void;
  onApprove: (sug: AISuggestion) => void;
  onAddToStoryboard?: (sug: AISuggestion) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isApproved,
  onPreview,
  onApprove,
  onAddToStoryboard,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: isApproved ? '2px solid #2563EB' : '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Tag & Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#2563EB',
              backgroundColor: '#EFF6FF',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            {suggestion.tag}
          </span>
          {suggestion.relevanceScore && (
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
              {suggestion.relevanceScore}% match
            </span>
          )}
        </div>

        {suggestion.timestampRange && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748B',
              backgroundColor: '#F8FAFC',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #F1F5F9',
            }}
          >
            {suggestion.timestampRange}
          </span>
        )}
      </div>

      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          {suggestion.title}
        </h4>
        {suggestion.quote && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderLeft: '3px solid #2563EB',
              fontSize: '13px',
              color: '#334155',
              fontStyle: 'italic',
              marginBottom: '6px',
              lineHeight: 1.45,
            }}
          >
            {suggestion.quote}
          </div>
        )}
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
          {suggestion.reason}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <button
          onClick={() => onPreview(suggestion)}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#1E293B',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Play size={14} fill="#1E293B" />
          <span>{suggestion.actionLabel}</span>
        </button>

        {suggestion.type === 'opportunity' ? (
          <button
            onClick={() => onAddToStoryboard?.(suggestion)}
            style={{
              flex: 1.2,
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: isApproved ? '#DCFCE7' : '#EFF6FF',
              border: isApproved ? '1px solid #86EFAC' : '1px solid #BFDBFE',
              color: isApproved ? '#166534' : '#1D4ED8',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            {isApproved ? <Check size={14} /> : <Layers size={14} />}
            <span>{isApproved ? 'In Storyboard' : 'Add to Storyboard'}</span>
          </button>
        ) : (
          <button
            onClick={() => onApprove(suggestion)}
            style={{
              flex: 1.2,
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: isApproved ? '#16A34A' : '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: isApproved ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            {isApproved ? <Check size={14} /> : <Sparkles size={14} />}
            <span>{isApproved ? 'Approved' : suggestion.secondaryActionLabel || 'Approve'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
