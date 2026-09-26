import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Search, 
  Bookmark, 
  Flame, 
  ArrowRight,
  Hash,
  Users,
  Film,
  Play,
  CheckCircle2
} from 'lucide-react';
import { 
  Region, 
  ContentItem, 
  DiscoverCreator, 
  Trend, 
  Topic 
} from '../types/creatorIntelligence';
import { useCIStore } from '../state/creatorIntelligenceStore';
import { mockTrends } from '../data/mockTrends';
import { mockCreators } from '../data/mockCreators';
import { mockVideos, mockReels } from '../data/mockContent';
import { mockTopics } from '../data/mockTopics';
import { SearchBar } from '../components/SearchBar';
import { TrendCard } from '../components/TrendCard';
import { ContentCard } from '../components/ContentCard';
import { CreatorCard } from '../components/CreatorCard';
import { StoryboardButton } from '../components/StoryboardButton';
import { StoryboardSheet } from '../components/StoryboardSheet';
import { ContentDetailSheet } from '../components/ContentDetailSheet';
import { GenerateContentScreen } from './GenerateContentScreen';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useAppStore } from '@/shared/state/app.store';

const REGIONS: { id: Region; label: string }[] = [
  { id: 'foryou', label: 'For You' },
  { id: 'global', label: 'Global' },
  { id: 'india', label: 'India' },
  { id: 'hyderabad', label: 'Hyderabad' },
  { id: 'myniche', label: 'My Niche' },
];

export const CreatorIntelligenceScreen: React.FC = () => {
  const {
    selectedRegion,
    setRegion,
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchResults,
    storyboardItems,
    addToStoryboard,
    removeFromStoryboard,
    clearStoryboard,
    storyboardOpen,
    openStoryboard,
    closeStoryboard,
    selectedContentId,
    setSelectedContent,
    openGenerateModal,
    toggleBookmark,
    isBookmarked,
    bookmarkedIds,
  } = useCIStore();

  const { showToast, openModal, theme } = useAppStore();
  const isDark = theme !== 'light';
  const [activeTopTab, setActiveTopTab] = React.useState<Region | 'saved'>(selectedRegion);

  const handleSelectRegion = (r: Region | 'saved') => {
    setActiveTopTab(r);
    if (r !== 'saved') {
      setRegion(r);
    }
  };

  // Filter trends by selected region
  const filteredTrends = useMemo(() => {
    return mockTrends.filter((t) => 
      activeTopTab === 'saved' || activeTopTab === 'foryou' ? true : t.region.includes(activeTopTab as Region)
    );
  }, [activeTopTab]);

  // Filter creators by selected region
  const filteredCreators = useMemo(() => {
    if (activeTopTab === 'saved') return mockCreators.slice(0, 5);
    if (activeTopTab === 'foryou') return mockCreators;
    return mockCreators.filter((c) => c.region.includes(activeTopTab as Region));
  }, [activeTopTab]);

  // Filter videos by selected region
  const filteredVideos = useMemo(() => {
    if (activeTopTab === 'saved') {
      return mockVideos.filter((v) => isBookmarked(v.id));
    }
    if (activeTopTab === 'foryou') return mockVideos;
    return mockVideos.filter((v) => v.region.includes(activeTopTab as Region));
  }, [activeTopTab, bookmarkedIds]);

  // Filter reels by selected region
  const filteredReels = useMemo(() => {
    if (activeTopTab === 'saved') {
      return mockReels.filter((r) => isBookmarked(r.id));
    }
    if (activeTopTab === 'foryou') return mockReels;
    return mockReels.filter((r) => r.region.includes(activeTopTab as Region));
  }, [activeTopTab, bookmarkedIds]);

  // Handlers
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isNowBookmarked = toggleBookmark(id);
    showToast(isNowBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
  };

  const handleAddToStoryboard = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const alreadyIn = storyboardItems.some((s) => s.contentId === id);
    if (alreadyIn) {
      showToast('Already in storyboard');
    } else {
      addToStoryboard(id);
      showToast('Added to storyboard');
    }
  };

  const handleTrendClick = (trend: Trend) => {
    setSearchQuery(trend.title);
  };

  const handleTopicClick = (topic: Topic) => {
    setSearchQuery(topic.title);
  };

  const allContent = useMemo(() => [...mockVideos, ...mockReels], []);
  const selectedContent = useMemo(
    () => (selectedContentId ? allContent.find((c) => c.id === selectedContentId) || null : null),
    [selectedContentId, allContent]
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
        color: isDark ? '#FFFFFF' : '#0F172A',
        paddingBottom: '130px',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}
            >
              Creator Intelligence
            </h1>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B',
              }}
            >
              What's happening. What's worth creating.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <button
              onClick={() => openModal('media-intelligence')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.35)',
                color: '#60A5FA',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Sparkles size={13} />
              <span>Media AI</span>
            </button>
            <StoryboardButton count={storyboardItems.length} onClick={openStoryboard} />
          </div>
        </div>

        {/* Big Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search creators, topics, videos, reels..."
        />
      </div>

      {/* What's Happening Region Tabs */}
      <div style={{ padding: '0 20px 4px 20px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          What's Happening
        </span>
        <div
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            display: 'flex',
            gap: '8px',
            scrollbarWidth: 'none',
            marginBottom: '20px',
          }}
        >
          {REGIONS.map((r) => {
            const isActive = activeTopTab === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSelectRegion(r.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  backgroundColor: isActive ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? '#181818' : '#FFFFFF'),
                  color: isActive ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569'),
                  border: isActive ? (isDark ? '1px solid #FFFFFF' : '1px solid #0F172A') : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {r.label}
              </button>
            );
          })}

          {/* Saved Tab */}
          <button
            onClick={() => handleSelectRegion('saved')}
            style={{
              padding: '7px 16px',
              borderRadius: '999px',
              backgroundColor: activeTopTab === 'saved' ? 'var(--ai-accent)' : (isDark ? '#181818' : '#FFFFFF'),
              color: activeTopTab === 'saved' ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569'),
              border: activeTopTab === 'saved' ? '1px solid var(--ai-accent)' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
              fontSize: '13px',
              fontWeight: activeTopTab === 'saved' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Bookmark size={13} fill={activeTopTab === 'saved' ? 'currentColor' : 'none'} />
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH VIEW (When User Searches) */}
      {isSearching && searchResults && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B' }}>
              Search results for "{searchQuery}"
            </span>
            <button
              onClick={clearSearch}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ai-accent, #D8FF00)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear search
            </button>
          </div>

          {/* If No Results */}
          {searchResults.trends.length === 0 &&
            searchResults.creators.length === 0 &&
            searchResults.videos.length === 0 &&
            searchResults.reels.length === 0 &&
            searchResults.topics.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B' }}>
                <Search size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: isDark ? '#FFFFFF' : '#0F172A' }}>No results found</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>Try another topic like "AI Agents", "NPU", or "Video".</p>
              </div>
            )}

          {/* TOPICS */}
          {searchResults.topics.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B', display: 'block', marginBottom: '10px' }}>
                Topics
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {searchResults.topics.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => handleTopicClick(tp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      backgroundColor: isDark ? '#181818' : '#F1F5F9',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <Hash size={13} color="var(--ai-accent, #D8FF00)" />
                    <span>{tp.title}</span>
                    <span style={{ fontSize: '11px', color: '#00DC82', fontWeight: 600 }}>+{tp.growth}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CREATORS */}
          {searchResults.creators.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B', display: 'block', marginBottom: '10px' }}>
                Creators
              </span>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
                {searchResults.creators.map((c) => (
                  <div key={c.id} style={{ width: '180px', flexShrink: 0 }}>
                    <CreatorCard creator={c} onClick={() => setSearchQuery(c.name)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {searchResults.videos.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B', display: 'block', marginBottom: '10px' }}>
                Videos
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {searchResults.videos.map((v) => (
                  <ContentCard
                    key={v.id}
                    item={v}
                    isBookmarked={isBookmarked(v.id)}
                    isStoryboarding={storyboardItems.some((s) => s.contentId === v.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onAddToStoryboard={handleAddToStoryboard}
                    onClick={() => setSelectedContent(v.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* REELS */}
          {searchResults.reels.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B', display: 'block', marginBottom: '10px' }}>
                Reels
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {searchResults.reels.map((r) => (
                  <ContentCard
                    key={r.id}
                    item={r}
                    isBookmarked={isBookmarked(r.id)}
                    isStoryboarding={storyboardItems.some((s) => s.contentId === r.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onAddToStoryboard={handleAddToStoryboard}
                    onClick={() => setSelectedContent(r.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NORMAL BROWSE VIEW (ALL 4 CORE SECTIONS AS SPECIFIED) */}
      {!isSearching && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* SECTION 1: TRENDING TOPICS (Horizontal Cards) */}
          <div>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={17} color="#FF6B00" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  Trending Topics
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B' }}>Real-time growth</span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '0 20px 8px 20px',
                scrollbarWidth: 'none',
              }}
            >
              {filteredTrends.map((t) => (
                <TrendCard key={t.id} trend={t} onClick={handleTrendClick} />
              ))}
            </div>
          </div>

          {/* SECTION 2: TOP CREATORS (Horizontal Cards) */}
          <div>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={17} color="var(--ai-accent, #D8FF00)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  Top Creators
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B' }}>Leading voices</span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '0 20px 8px 20px',
                scrollbarWidth: 'none',
              }}
            >
              {filteredCreators.map((c) => (
                <div key={c.id} style={{ width: '200px', flexShrink: 0 }}>
                  <CreatorCard creator={c} onClick={() => setSearchQuery(c.name)} />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: TOP VIDEOS (Large Cards) */}
          <div>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={17} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  Top Videos
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B' }}>Deep dives</span>
            </div>

            <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredVideos.slice(0, 6).map((v) => (
                <ContentCard
                  key={v.id}
                  item={v}
                  isBookmarked={isBookmarked(v.id)}
                  isStoryboarding={storyboardItems.some((s) => s.contentId === v.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onAddToStoryboard={handleAddToStoryboard}
                  onClick={() => setSelectedContent(v.id)}
                />
              ))}
            </div>
          </div>

          {/* SECTION 4: TOP REELS (Vertical/Reel Cards) */}
          <div>
            <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={17} color="#FF4560" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  Top Reels
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B' }}>High velocity</span>
            </div>

            <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {filteredReels.slice(0, 6).map((r) => (
                <ContentCard
                  key={r.id}
                  item={r}
                  isBookmarked={isBookmarked(r.id)}
                  isStoryboarding={storyboardItems.some((s) => s.contentId === r.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onAddToStoryboard={handleAddToStoryboard}
                  onClick={() => setSelectedContent(r.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar: Generate Content CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100% - 32px), 480px)',
          zIndex: 40,
        }}
      >
        <button
          onClick={openGenerateModal}
          disabled={storyboardItems.length === 0}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '999px',
            backgroundColor: storyboardItems.length > 0 ? 'var(--ai-accent, #D8FF00)' : (isDark ? '#222222' : '#E2E8F0'),
            color: storyboardItems.length > 0 ? '#000000' : (isDark ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8'),
            border: storyboardItems.length > 0 ? 'none' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #CBD5E1'),
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: storyboardItems.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: storyboardItems.length > 0 ? '0 8px 30px rgba(216, 255, 0, 0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={17} />
            <span>Generate Content</span>
            {storyboardItems.length > 0 && (
              <span
                style={{
                  backgroundColor: '#000000',
                  color: 'var(--ai-accent, #D8FF00)',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '999px',
                  padding: '2px 8px',
                }}
              >
                {storyboardItems.length} Ref{storyboardItems.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* OVERLAYS & MODALS */}
      <StoryboardSheet
        isOpen={storyboardOpen}
        onClose={closeStoryboard}
        items={storyboardItems}
        onRemoveItem={removeFromStoryboard}
        onClearAll={clearStoryboard}
        onOpenGenerate={openGenerateModal}
        onSelectItem={(id) => {
          closeStoryboard();
          setSelectedContent(id);
        }}
      />

      <ContentDetailSheet
        item={selectedContent}
        isOpen={!!selectedContentId}
        onClose={() => setSelectedContent(null)}
        isBookmarked={selectedContent ? isBookmarked(selectedContent.id) : false}
        isInStoryboard={selectedContent ? storyboardItems.some((s) => s.contentId === selectedContent.id) : false}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        onAddToStoryboard={(id) => handleAddToStoryboard(id)}
      />

      <GenerateContentScreen />
    </div>
  );
};
