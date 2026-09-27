import React from 'react';
import { AISuggestion, MediaItem } from '../types/mediaIntelligence';
import { Check, Sparkles } from 'lucide-react';
import { MediaArt } from '@/shared/components/MediaArt';

interface SuggestionPreviewProps {
  suggestion: AISuggestion;
  media: MediaItem;
  onReject: () => void;
  onApproveAndCreate: () => void;
}

export const SuggestionPreview: React.FC<SuggestionPreviewProps> = ({
  suggestion,
  media,
  onReject,
  onApproveAndCreate,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#2563EB',
              backgroundColor: '#EFF6FF',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            {suggestion.tag}
          </span>
           <span style={{ fontSize: '12px', color: '#64748B' }}>Text plan · no rendered preview</span>
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
          {suggestion.title}
        </h3>
      </div>

       {/* Source reference for a text-only crop plan, not a rendered clip. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
           height: '200px',
          backgroundColor: '#0F172A',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
         <MediaArt src={media.thumbnail} label={media.title} kind={media.type} style={{ width: '100%', height: '100%' }} />

       </div>
       <p style={{ margin: '-10px 0 0', fontSize: '12px', color: '#64748B' }}>
         Proposed 9:16 crop · {suggestion.quote || 'Suggested text only — no rendered captions'}
       </p>

      {/* Timeline Bar */}
      <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
          <span style={{ color: '#2563EB' }}>Selected Region</span>
           <span style={{ color: '#0F172A' }}>{suggestion.timestampRange || 'Range not provided'}</span>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '999px' }}>
          <div
            style={{
              position: 'absolute',
              left: '20%',
              width: '35%',
              height: '100%',
              backgroundColor: '#2563EB',
              borderRadius: '999px',
            }}
          />
        </div>
      </div>

      {/* AI PLAN Checklist */}
      <div>
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
           Suggested plan (not applied)
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
           {(suggestion.plan || [suggestion.reason]).map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <span style={{ fontWeight: 500 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: [ Reject ] [ Approve & Create ] */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          onClick={onReject}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reject
        </button>

        <button
           onClick={onApproveAndCreate}
          style={{
            flex: 1.6,
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          }}
        >
           <Sparkles size={16} />
           <span>Save review draft</span>
        </button>
      </div>
    </div>
  );
};
