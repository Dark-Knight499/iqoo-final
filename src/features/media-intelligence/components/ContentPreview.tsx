import React from 'react';
import { Play } from 'lucide-react';
import { MediaItem } from '../types/mediaIntelligence';

interface ContentPreviewProps {
  media: MediaItem;
  height?: string;
  showOverlayStats?: boolean;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  media,
  height = '200px',
  showOverlayStats = true,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
      }}
    >
      <img
        src={media.thumbnail}
        alt={media.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: 0.9,
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)',
        }}
      />

      {/* Center Play Button */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
        }}
      >
        <Play size={20} fill="#FFFFFF" style={{ marginLeft: '2px' }} />
      </div>

      {/* Bottom info bar */}
      {showOverlayStats && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '14px',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            fontSize: '12px',
          }}
        >
          <span style={{ fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {media.title}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {media.resolution && (
              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                {media.resolution}
              </span>
            )}
            <span
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              {media.duration}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
