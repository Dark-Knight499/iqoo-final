import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        borderRadius: '14px',
        padding: '14px 16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        {icon && <span style={{ color: 'var(--ai-accent)', opacity: 0.9 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{value}</span>
        {unit && <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
};
