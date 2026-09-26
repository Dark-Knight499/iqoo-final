import React from 'react';
import { SceneData } from '../types/mediaIntelligence';
import { Video, MapPin, Eye } from 'lucide-react';

interface SceneCardProps {
  scene: SceneData;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene }) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '14px 16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
          {scene.sceneNumber}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#2563EB',
            backgroundColor: '#EFF6FF',
            padding: '2px 8px',
            borderRadius: '999px',
          }}
        >
          {scene.timestampRange}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Eye size={13} color="#2563EB" />
          <span style={{ fontWeight: 600, color: '#334155' }}>{scene.visualType}</span>
        </div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} />
          <span>{scene.location}</span>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
        {scene.description}
      </p>
    </div>
  );
};
