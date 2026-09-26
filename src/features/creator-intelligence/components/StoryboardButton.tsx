import React from 'react';
import { Layers } from 'lucide-react';

interface StoryboardButtonProps {
  count: number;
  onClick: () => void;
}

export const StoryboardButton: React.FC<StoryboardButtonProps> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '999px',
        backgroundColor: count > 0 ? 'rgba(216, 255, 0, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        border: count > 0 ? '1px solid rgba(216, 255, 0, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
        color: count > 0 ? 'var(--ai-accent, #D8FF00)' : 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        flexShrink: 0,
      }}
    >
      <Layers size={14} />
      <span>Storyboard</span>
      {count > 0 && (
        <span
          style={{
            backgroundColor: 'var(--ai-accent, #D8FF00)',
            color: '#000000',
            fontSize: '10px',
            fontWeight: 800,
            borderRadius: '999px',
            padding: '1px 6px',
            marginLeft: '2px',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};
