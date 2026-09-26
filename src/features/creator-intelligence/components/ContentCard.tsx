import React from 'react';
import { Bookmark, Plus, Check, Eye, Heart, TrendingUp, Play } from 'lucide-react';
import { ContentItem } from '../types/creatorIntelligence';

interface ContentCardProps {
  item: ContentItem;
  isBookmarked: boolean;
  isStoryboarding: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onAddToStoryboard: (id: string, e: React.MouseEvent) => void;
  onClick: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isBookmarked,
  isStoryboarding,
  onToggleBookmark,
  onAddToStoryboard,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        borderRadius: '16px',
        backgroundColor: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
      }}
    >
      {/* Thumbnail area */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: item.type === 'reel' ? '9/11' : '16/9', backgroundColor: '#202020', overflow: 'hidden' }}>
        <img
          src={item.thumbnail}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(e) => {
            // fallback if asset path is missing
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Duration badge */}
        {item.duration && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {item.duration}
          </span>
        )}

        {/* Trend Indicator badge */}
        <span
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 7px',
            borderRadius: '999px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            color: 'var(--ai-accent, #D8FF00)',
            fontSize: '11px',
            fontWeight: 700,
            border: '1px solid rgba(216, 255, 0, 0.25)',
          }}
        >
          <TrendingUp size={11} />
          +{item.trendScore}%
        </span>

        {/* Platform tag */}
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '2px 7px',
            borderRadius: '999px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {item.platform}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h4>

        {/* Creator & publish date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#2A2A2A',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--ai-accent, #D8FF00)',
            }}
          >
            {item.creatorName.charAt(0)}
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
            {item.creatorName}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>{item.publishedAt}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            <span>{item.views}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={12} color="#FF4560" />
            <span>{item.engagement} eng.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={(e) => onToggleBookmark(item.id, e)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '8px',
              backgroundColor: isBookmarked ? 'rgba(216, 255, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
              border: isBookmarked ? '1px solid rgba(216, 255, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: isBookmarked ? 'var(--ai-accent, #D8FF00)' : 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
          </button>

          <button
            onClick={(e) => onAddToStoryboard(item.id, e)}
            style={{
              flex: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '8px',
              backgroundColor: isStoryboarding ? 'rgba(0, 220, 130, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: isStoryboarding ? '1px solid rgba(0, 220, 130, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isStoryboarding ? '#00DC82' : '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isStoryboarding ? <Check size={13} /> : <Plus size={13} />}
            <span>{isStoryboarding ? 'In Storyboard' : '+ Storyboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
