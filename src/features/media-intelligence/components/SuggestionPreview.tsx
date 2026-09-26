import React, { useState } from 'react';
import { AISuggestion, MediaItem } from '../types/mediaIntelligence';
import { Check, X, Sparkles, Film, Music, Type, Sliders, CheckCircle2 } from 'lucide-react';

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
  const [isApproving, setIsApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setApprovedSuccess(true);
      setTimeout(() => {
        onApproveAndCreate();
      }, 1000);
    }, 800);
  };

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
          <span style={{ fontSize: '12px', color: '#64748B' }}>Ready to Generate</span>
        </div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
          {suggestion.title}
        </h3>
      </div>

      {/* Video Preview with 9:16 reframe overlay mockup */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: '#0F172A',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={media.thumbnail}
          alt="Preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
        />

        {/* 9:16 vertical crop guide box */}
        <div
          style={{
            position: 'absolute',
            width: '135px',
            height: '220px',
            borderRadius: '10px',
            border: '2px solid #2563EB',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '8px',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: '#2563EB',
              padding: '2px 5px',
              borderRadius: '4px',
              alignSelf: 'flex-start',
            }}
          >
            9:16 Reframe
          </span>
          <div
            style={{
              padding: '4px 6px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '10px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            "Local AI is going to change mobile computing..."
          </div>
        </div>
      </div>

      {/* Timeline Bar */}
      <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
          <span style={{ color: '#2563EB' }}>Selected Region</span>
          <span style={{ color: '#0F172A' }}>{suggestion.timestampRange || '01:42 ───────── 02:18'}</span>
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
          AI PLAN
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(suggestion.plan || [
            'Extract strongest section',
            'Reframe to 9:16 with subject tracking',
            'Add synchronized dynamic captions',
            'Apply Creator Style color profile',
            'Add curated background music',
          ]).map((step, i) => (
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

      {/* Success alert message if approved */}
      {approvedSuccess && (
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#16A34A" />
          <span>Added to Project! Redirecting to Catalog...</span>
        </div>
      )}

      {/* Action Buttons: [ Reject ] [ Approve & Create ] */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          onClick={onReject}
          disabled={isApproving || approvedSuccess}
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
          onClick={handleApprove}
          disabled={isApproving || approvedSuccess}
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
          {isApproving ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #FFFFFF',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <>
              <Sparkles size={16} />
              <span>Approve & Create</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
