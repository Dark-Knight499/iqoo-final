import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';

interface ThemeToggleProps {
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 23, 42, 0.1)',
        color: isDark ? '#F7F7F2' : '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {isDark ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#2563EB" />}
    </button>
  );
};
