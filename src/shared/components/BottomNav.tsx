import React from 'react';
import { Home, Compass, Plus, User } from 'lucide-react';
import { MainTab, useAppStore } from '@/shared/state/app.store';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, theme } = useAppStore();
  const isDark = theme !== 'light';

  const navItems: { tab: MainTab; label: string; icon: React.ReactNode; isAI?: boolean }[] = [
    { tab: 'home', label: 'Home', icon: <Home size={20} aria-hidden="true" /> },
    { tab: 'insights', label: 'Intelligence', icon: <Compass size={20} aria-hidden="true" /> },
    { tab: 'create', label: 'Create', icon: <Plus size={22} aria-hidden="true" />, isAI: true },
    { tab: 'profile', label: 'Profile', icon: <User size={20} aria-hidden="true" /> },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(calc(100% - 28px), 440px)',
        padding: '6px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: isDark ? 'rgba(20, 20, 20, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.7)' : '0 12px 30px rgba(15, 23, 42, 0.12)',
        zIndex: 50,
      }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActiveTab(item.tab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 4px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? (isDark ? '#242424' : '#EFF6FF') : 'transparent',
              color: item.isAI
                ? 'var(--ai-accent)'
                : isActive
                ? (isDark ? 'var(--text-primary)' : '#2563EB')
                : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.18s ease',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
