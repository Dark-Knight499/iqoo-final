import React from 'react';

interface EntityChipProps {
  label: string;
  variant?: 'object' | 'topic' | 'entity';
  count?: number;
}

export const EntityChip: React.FC<EntityChipProps> = ({ label, variant = 'object', count }) => {
  const getColors = () => {
    switch (variant) {
      case 'topic':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
        };
      case 'entity':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#6D28D9',
        };
      default:
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#334155',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '999px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          style={{
            fontSize: '10px',
            opacity: 0.7,
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '999px',
            padding: '1px 5px',
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
};
