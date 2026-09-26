import React from 'react';
import { X, Bookmark, Plus, Check, Eye, Heart, TrendingUp, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { ContentItem } from '../types/creatorIntelligence';

interface ContentDetailSheetProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  isInStoryboard: boolean;
  onToggleBookmark: (id: string) => void;
  onAddToStoryboard: (id: string) => void;
}

export const ContentDetailSheet: React.FC<ContentDetailSheetProps> = ({
  item,
  isOpen,
  onClose,
  isBookmarked,
  isInStoryboard,
  onToggleBookmark,
  onAddToStoryboard,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          backgroundColor: '#121212',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Thumbnail & Close Button */}
        <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#1E1E1E', flexShrink: 0 }}>
          <img
            src={item.thumbnail}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #121212 0%, rgba(18, 18, 18, 0.4) 50%, rgba(0, 0, 0, 0.6) 100%)',
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          {/* Platform & Trend badge */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', gap: '8px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(216, 255, 0, 0.2)',
                backdropFilter: 'blur(8px)',
                color: 'var(--ai-accent, #D8FF00)',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid rgba(216, 255, 0, 0.4)',
              }}
            >
              <TrendingUp size={13} />
              +{item.trendScore}% Trending
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {item.platform}
            </span>
          </div>
        </div>

        {/* Scrollable Details */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.35 }}>
              {item.title}
            </h2>

            {/* Creator metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#2A2A2A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ai-accent, #D8FF00)',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {item.creatorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{item.creatorName}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>Published {item.publishedAt}</div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#181818',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '3px' }}>Views</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Eye size={14} color="rgba(255, 255, 255, 0.6)" />
                {item.views}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '3px' }}>Engagement</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FF4560', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Heart size={14} fill="#FF4560" />
                {item.engagement}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '3px' }}>Type</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textTransform: 'capitalize' }}>
                {item.type}
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(216, 255, 0, 0.06)',
              border: '1px solid rgba(216, 255, 0, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ai-accent, #D8FF00)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Why this matters
            </span>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
              {item.whyTrending || 'High engagement around on-device AI + strong creator discussion velocity.'}
            </p>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Summary
              </span>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          )}

          {/* Related Topics */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Related Topics
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {item.topics.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '12px',
                  }}
                >
                  <Tag size={11} color="rgba(255, 255, 255, 0.4)" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#161616',
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={() => onToggleBookmark(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: isBookmarked ? 'rgba(216, 255, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)',
              border: isBookmarked ? '1px solid rgba(216, 255, 0, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isBookmarked ? 'var(--ai-accent, #D8FF00)' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => onAddToStoryboard(item.id)}
            style={{
              flex: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: isInStoryboard ? 'rgba(0, 220, 130, 0.15)' : 'var(--ai-accent, #D8FF00)',
              border: isInStoryboard ? '1px solid rgba(0, 220, 130, 0.4)' : 'none',
              color: isInStoryboard ? '#00DC82' : '#000000',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isInStoryboard ? 'none' : '0 4px 14px rgba(216, 255, 0, 0.25)',
            }}
          >
            {isInStoryboard ? <Check size={16} /> : <Plus size={16} />}
            <span>{isInStoryboard ? 'In Storyboard' : 'Add to Storyboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
