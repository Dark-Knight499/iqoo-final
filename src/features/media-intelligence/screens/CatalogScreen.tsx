import React from 'react';
import { 
  FolderPlus, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Tag, 
  Box, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { mockRecentFiles, primaryDemoVideo } from '../data/mockMedia';
import { mockTopics, mockEntities } from '../data/mockAnalysis';
import { EntityChip } from '../components/EntityChip';
import { MediaItem } from '../types/mediaIntelligence';

const FILTERS = ['All', 'Video', 'Audio', 'Images', 'Topics', 'Entities'];

export const CatalogScreen: React.FC = () => {
  const {
    activeCatalogFilter,
    setCatalogFilter,
    navigateTo,
    goBack,
    approvedSuggestionIds,
  } = useMediaIntelligenceStore();

  const handleSelectItem = (item: MediaItem) => {
    navigateTo('content-detail');
  };

  const filteredMedia = mockRecentFiles.filter((item) => {
    if (activeCatalogFilter === 'All') return true;
    if (activeCatalogFilter === 'Video') return item.type === 'video';
    if (activeCatalogFilter === 'Audio') return item.type === 'audio';
    if (activeCatalogFilter === 'Images') return item.type === 'image';
    return true;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#F7F8FA',
        padding: '24px 20px 80px 20px',
        color: '#0F172A',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={goBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          Step 7: Knowledge Base
        </span>
      </div>

      {/* Screen Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Your Content Catalog
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Creator AI remembers what is inside your content.
        </p>
      </div>

      {/* Knowledge Summary Pill Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Indexed Topics
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>7</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Entities
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>18</span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Key Moments
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>6</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '20px',
          scrollbarWidth: 'none',
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeCatalogFilter === f;
          return (
            <button
              key={f}
              onClick={() => setCatalogFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* RECENTLY ANALYZED Section */}
      <div style={{ marginBottom: '28px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#64748B',
            display: 'block',
            marginBottom: '12px',
          }}
        >
          Recently Analyzed
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectItem(item)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#0F172A',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {item.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                    <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>Analyzed</span>
                  </div>
                </div>
              </div>

              <ChevronRight size={18} color="#94A3B8" />
            </div>
          ))}
        </div>
      </div>

      {/* Topics & Entities Knowledge Snapshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
            Catalog Topics
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {mockTopics.slice(0, 5).map((t) => (
              <EntityChip key={t} label={t} variant="topic" />
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', display: 'block', marginBottom: '10px' }}>
            Catalog Entities
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {mockEntities.slice(0, 5).map((e) => (
              <EntityChip key={e} label={e} variant="entity" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
