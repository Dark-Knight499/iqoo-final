import React from 'react';
import { MediaItem } from '../types/mediaIntelligence';
import { MediaArt } from '@/shared/components/MediaArt';

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
      <MediaArt src={media.thumbnail} label={media.title} kind={media.type} style={{ width: '100%', height: '100%' }} />

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
          <span />
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
