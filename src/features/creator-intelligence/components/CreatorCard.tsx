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
        backgroundColor: '#141414',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
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
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#262626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ai-accent, #D8FF00)',
            fontSize: '22px',
            fontWeight: 700,
            overflow: 'hidden',
            border: '2px solid rgba(216, 255, 0, 0.3)',
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
              backgroundColor: '#0D0D0D',
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

      <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
        {creator.name}
      </h4>
      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
        {creator.handle}
      </span>

      <span
        style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          color: 'rgba(255, 255, 255, 0.8)',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
            Followers
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
            {creator.followers}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
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
