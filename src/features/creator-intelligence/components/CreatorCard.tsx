import React from 'react';
import { CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { DiscoverCreator } from '../types/creatorIntelligence';

interface CreatorCardProps {
  creator: DiscoverCreator;
  onClick: (creator: DiscoverCreator) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onClick }) => {
  return (
    <div
      onClick={() => onClick(creator)}
      style={{
        borderRadius: '16px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--ai-border, rgba(216, 255, 0, 0.3))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ai-accent, #D8FF00)',
            fontSize: '22px',
            fontWeight: 700,
            overflow: 'hidden',
            border: '2px solid var(--ai-border, rgba(216, 255, 0, 0.3))',
          }}
        >
          {creator.name.charAt(0)}
        </div>
        {creator.verified && (
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={16} color="#00DC82" fill="#00DC82" stroke="#000" />
          </span>
        )}
      </div>

      <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {creator.name}
      </h4>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {creator.handle}
      </span>

      <span
        style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: '999px',
          backgroundColor: 'var(--bg-surface-2)',
          color: 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 500,
          marginBottom: '14px',
        }}
      >
        {creator.niche}
      </span>

      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Followers
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {creator.followers}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Growth
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00DC82' }}>
            {creator.growth}
          </span>
        </div>
      </div>
    </div>
  );
};
