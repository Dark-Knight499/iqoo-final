import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search trends, creators, videos, topics...'
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '0 12px',
        height: '44px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      {value.length > 0 && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          style={{
            background: 'var(--bg-surface-3)',
            border: 'none',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-secondary)',
          }}
          title="Clear search"
        >
           <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
