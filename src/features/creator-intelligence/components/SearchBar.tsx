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
        backgroundColor: '#161616',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 12px',
        height: '44px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
      }}
    >
      <Search size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: '8px', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '14px',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      {value.length > 0 && (
        <button
          onClick={onClear}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
