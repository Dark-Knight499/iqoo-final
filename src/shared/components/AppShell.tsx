import React, { useState, useEffect } from 'react';
import { Toast } from './Toast';
import { Wifi, BatteryMedium } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-viewport">
      <Toast />

      {/* Native Mobile Status Bar & Dynamic Island (Desktop Simulator) */}
      <div className="mobile-statusbar">
        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {currentTime}
        </span>
        <div className="mobile-dynamic-island" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
          <Wifi size={13} />
          <BatteryMedium size={14} />
        </div>
      </div>

      <div
        className="app-shell-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>

      {/* Native Mobile Home Indicator */}
      <div className="mobile-home-indicator-container">
        <div className="mobile-home-indicator" />
      </div>
    </div>
  );
};
