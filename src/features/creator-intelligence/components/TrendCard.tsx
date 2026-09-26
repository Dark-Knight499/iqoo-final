import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { Trend } from '../types/creatorIntelligence';

interface TrendCardProps {
  trend: Trend;
  onClick: (trend: Trend) => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({ trend, onClick }) => {
  return (
    <div
      onClick={() => onClick(trend)}
      style={{
        flexShrink: 0,
        width: '240px',
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: '#141414',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(216, 255, 0, 0.3)';
        e.currentTarget.style.backgroundColor = '#181818';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
        e.currentTarget.style.backgroundColor = '#141414';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: 600,
            }}
          >
            {trend.category}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(216, 255, 0, 0.1)',
              color: 'var(--ai-accent, #D8FF00)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <TrendingUp size={12} />
            <span>+{trend.growth}%</span>
          </div>
        </div>

        <h4
          style={{
            margin: '0 0 6px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
          }}
        >
          {trend.title}
        </h4>

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.65)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {trend.description}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>
          <Flame size={12} color="#FF6B00" />
          <span>{(trend.postCount / 1000).toFixed(0)}k posts</span>
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--ai-accent, #D8FF00)',
            fontWeight: 600,
          }}
        >
          Explore →
        </span>
      </div>
    </div>
  );
};
