import React from 'react';
import { Toast } from './Toast';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-viewport">
      <Toast />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
};
