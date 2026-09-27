import React, { useEffect, useMemo, useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft,
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
  CheckCircle2,
  ExternalLink,
  Plus,
  Check,
  Radio,
  Globe2,
  RefreshCw,
  Loader2,
  Share2,
  Compass,
  MessageSquare,
  ShieldCheck,
  Target,
  Zap,
  BarChart3,
  Video
} from 'lucide-react';
import { 
  Region, 
  ContentItem, 
  Trend, 
  Topic 
} from '../types/creatorIntelligence';
import { useCIStore } from '../state/creatorIntelligenceStore';
import { StoryboardButton } from '../components/StoryboardButton';
import { StoryboardSheet } from '../components/StoryboardSheet';
import { ContentDetailSheet } from '../components/ContentDetailSheet';
import { GenerateContentScreen } from './GenerateContentScreen';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useAppStore } from '@/shared/state/app.store';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useProjectStore } from '@/shared/state/project.store';
import { 
  legacyBackend, 
  TrendsResponse, 
  IntelligenceResponse, 
  IntelligencePlatform, 
  DomainArchetype, 
  CreatorDomainProfile,
  YouTubeTrendItem,
  InstagramTrendItem,
  LinkedInTrendItem,
  XTwitterTrendItem
} from '@/services/legacyBackend';

const GEO_REGIONS = [
  { id: 'GLOBAL', label: 'Global' },
  { id: 'US', label: 'United States' },
  { id: 'IN', label: 'India' },
];

type PlatformTab = 'all' | 'youtube' | 'instagram' | 'x_twitter' | 'linkedin' | 'formats' | 'dna';

interface CreatorIntelligenceScreenProps {
  onBack?: () => void;
}

export const CreatorIntelligenceScreen: React.FC<CreatorIntelligenceScreenProps> = ({ onBack }) => {
  const {
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
    openSavedBlueprint,
    toggleBookmark,
    isBookmarked,
    bookmarkedIds,
  } = useCIStore();

  const { showToast, openModal, theme, openCopilot } = useAppStore();
  const { creator, updateProfile } = useCreatorStore();
  const { projects } = useProjectStore();
  const isDark = theme !== 'light';

  // Domain & Region State
  const [activeDomain, setActiveDomain] = useState<string>(creator.niche || 'Consumer Technology, Hardware & AI Gadgets');
  const [domainInput, setDomainInput] = useState<string>(creator.niche || 'Consumer Technology, Hardware & AI Gadgets');
  const [activeGeo, setActiveGeo] = useState<string>('US');
  const [activePlatformFilter, setActivePlatformFilter] = useState<PlatformTab>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Available Archetypes from API
  const [availableDomains, setAvailableDomains] = useState<DomainArchetype[]>([]);
  
  // API Responses
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [trendsLoading, setTrendsLoading] = useState<boolean>(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const [intelligence, setIntelligence] = useState<IntelligenceResponse | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState<boolean>(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);

  const [domainProfile, setDomainProfile] = useState<CreatorDomainProfile | null>(null);
  const [domainLoading, setDomainLoading] = useState<boolean>(false);

  // Fetch recognized domains on mount
  useEffect(() => {
    legacyBackend.getDomains()
      .then((res) => {
        if (res?.domains?.length) {
          setAvailableDomains(res.domains);
        }
      })
      .catch((err) => {
        console.warn('Failed to load domains from API:', err);
      });
  }, []);

  // Fetch Live Domain Intelligence whenever activeDomain or activeGeo changes
  const fetchDomainData = (domainToFetch: string, geoToFetch: string) => {
    const cleanDomain = domainToFetch.trim() || 'Tech & AI';
    const creatorName = creator.name.trim() || 'Creator';

    // 1. Fetch Real-time Multi-Platform Trends
    setTrendsLoading(true);
    setTrendsError(null);
    legacyBackend.getTrends(cleanDomain, geoToFetch, 12, creatorName)
      .then((res) => {
        setTrendsData(res);
      })
      .catch((err) => {
        setTrendsError(err instanceof Error ? err.message : 'Trends API unavailable');
      })
      .finally(() => {
        setTrendsLoading(false);
      });

    // 2. Fetch Creator Domain Profile & Moat
    setDomainLoading(true);
    legacyBackend.identifyDomain({
      creator_name: creatorName,
      niche_hint: cleanDomain,
    })
      .then((prof) => {
        setDomainProfile(prof);
      })
      .catch((err) => {
        console.warn('Domain identification warning:', err);
      })
      .finally(() => {
        setDomainLoading(false);
      });

    // 3. Run Full Intelligence Scan
    setIntelligenceLoading(true);
    setIntelligenceError(null);
    legacyBackend.runIntelligence({
      creator_name: creatorName,
      niche: cleanDomain,
      location: geoToFetch,
      platforms: ['youtube', 'instagram', 'linkedin', 'x_twitter'],
      goals: {
        youtube: 'increase_subscribers',
        instagram: 'more_views_and_followers',
        linkedin: 'increase_connections',
        x_twitter: 'spread_domain_posts',
      },
      generate_platform_md: false,
      generate_user_hook_md: false,
    })
      .then((res) => {
        setIntelligence(res);
      })
      .catch((err) => {
        setIntelligenceError(err instanceof Error ? err.message : 'Intelligence scan unavailable');
      })
      .finally(() => {
        setIntelligenceLoading(false);
      });
  };

  useEffect(() => {
    fetchDomainData(activeDomain, activeGeo);
  }, [activeDomain, activeGeo]);

  const handleApplyDomain = (newDomain: string) => {
    const cleaned = newDomain.trim();
    if (!cleaned) return;
    setActiveDomain(cleaned);
    setDomainInput(cleaned);
    updateProfile({ niche: cleaned });
    showToast(`Switched domain to "${cleaned}"`);
  };

  // Convert YouTube / Instagram items to ContentItem for Detail Sheet
  const handleOpenItemDetail = (title: string, creatorName: string, platform: 'youtube' | 'instagram' | 'x_twitter' | 'linkedin', why?: string, url?: string | null) => {
    // Open external URL directly or trigger Copilot script
    if (url) {
      window.open(url, '_blank');
    } else {
      openCopilot(`Analyze this ${platform} trending topic for our project: "${title}". Why trending: ${why || 'Surging velocity'}`);
    }
  };

  const handleAddTrendToStoryboard = (title: string, reason?: string) => {
    addToStoryboard(title, reason);
    showToast(`Added "${title.slice(0, 30)}..." to Storyboard`);
  };

  // Filtering lists by search filter
  const filterBySearch = (text: string) => {
    if (!searchFilter.trim()) return true;
    return text.toLowerCase().includes(searchFilter.toLowerCase());
  };

  const youtubeItems = (trendsData?.youtube_trending || []).filter(item => filterBySearch(item.title || ''));
  const instagramItems = (trendsData?.instagram_trending || []).filter(item => filterBySearch(item.title || ''));
  const xTwitterItems = (trendsData?.x_twitter_trending || []).filter(item => filterBySearch(item.title || ''));
  const linkedinItems = (trendsData?.linkedin_trending || []).filter(item => filterBySearch(item.title || ''));
  const viralFormats = (trendsData?.viral_formats || []).filter(item => filterBySearch(item.format_name || ''));
  const velocityTopics = (trendsData?.velocity_topics || []).filter(item => filterBySearch(item.topic || ''));

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
        color: isDark ? '#FFFFFF' : '#0F172A',
        paddingBottom: '90px',
      }}
    >
      {/* TOP COMMAND HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ai-accent)' }}>
                  Intelligence Engine
                </span>
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--ai-soft)', color: 'var(--ai-accent)', fontWeight: 700 }}>
                  LIVE API
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px' }}>
                Creator Intelligence
              </h1>
            </div>
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
              }}
            >
              <Sparkles size={13} />
              <span>Media AI</span>
            </button>
            <StoryboardButton count={storyboardItems.length} onClick={openStoryboard} />
          </div>
        </div>

        {/* DOMAIN SEARCH BAR & ENGINE SELECTOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyDomain(domainInput);
              }}
              placeholder="Search or enter any domain (e.g. AI Agents, Personal Finance, Fitness, Gaming, Civic Policy)..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 110px 11px 40px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleApplyDomain(domainInput)}
              disabled={trendsLoading || intelligenceLoading}
              style={{
                position: 'absolute',
                right: 6,
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--ai-accent)',
                color: '#080808',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: trendsLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {trendsLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Scan Domain</span>
            </button>
          </div>

          {/* DYNAMIC DOMAIN ARCHETYPE CHIPS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0, marginRight: '4px' }}>
              Domains:
            </span>
            {(availableDomains.length ? availableDomains : [
              { domain_id: 'tech', domain_name: 'Tech & AI' },
              { domain_id: 'finance', domain_name: 'Personal Finance' },
              { domain_id: 'productivity', domain_name: 'Productivity Systems' },
              { domain_id: 'civic', domain_name: 'Civic Rights & Policy' },
              { domain_id: 'startups', domain_name: 'Startups & Business' },
              { domain_id: 'fitness', domain_name: 'Health & Fitness' },
              { domain_id: 'science', domain_name: 'Science & Physics' },
            ]).map((arch: any) => {
              const isSelected = activeDomain.toLowerCase().includes(arch.domain_name.toLowerCase()) || 
                                 arch.domain_name.toLowerCase().includes(activeDomain.toLowerCase());
              return (
                <button
                  key={arch.domain_id}
                  onClick={() => handleApplyDomain(arch.domain_name)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                    color: isSelected ? '#080808' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {arch.domain_name}
                </button>
              );
            })}
          </div>

          {/* GEO SELECTOR & IN-FEED FILTER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe2 size={13} style={{ color: 'var(--text-muted)' }} />
              {GEO_REGIONS.map((geo) => (
                <button
                  key={geo.id}
                  onClick={() => setActiveGeo(geo.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: activeGeo === geo.id ? (isDark ? '#FFFFFF' : '#0F172A') : 'transparent',
                    color: activeGeo === geo.id ? (isDark ? '#000000' : '#FFFFFF') : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {geo.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchDomainData(activeDomain, activeGeo)}
              disabled={trendsLoading || intelligenceLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: 'var(--ai-accent)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} className={trendsLoading ? 'animate-spin' : ''} />
              <span>{trendsLoading ? 'Updating…' : 'Live Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* DOMAIN SUMMARY BADGE BANNER */}
      <section style={{ padding: '16px 20px 8px' }}>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: isDark ? 'linear-gradient(135deg, rgba(216, 255, 0, 0.08) 0%, rgba(20, 20, 20, 0.8) 100%)' : 'linear-gradient(135deg, rgba(216, 255, 0, 0.15) 0%, #FFFFFF 100%)',
            border: '1px solid var(--ai-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--ai-soft)', color: 'var(--ai-accent)' }}>
                <Zap size={14} />
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Active Domain: {activeDomain}
              </strong>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Geo: {activeGeo}
            </span>
          </div>

          {domainProfile && (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong>Sub-Niche: </strong>{domainProfile.sub_niche} · 
              <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                {domainProfile.core_verticals.slice(0, 3).join(' • ')}
              </span>
            </p>
          )}

          {domainProfile?.domain_positioning_and_moat?.competitive_moat && (
            <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', borderLeft: '3px solid var(--ai-accent)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--ai-accent)', display: 'block', marginBottom: '2px' }}>
                Competitive Moat & Retention Standard:
              </span>
              <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#E2E8F0' : '#334155' }}>
                {domainProfile.domain_positioning_and_moat.competitive_moat}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PLATFORM FILTER TABS */}
      <nav
        style={{
          padding: '12px 20px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { id: 'all', label: 'All Streams' },
          { id: 'youtube', label: `YouTube (${youtubeItems.length})` },
          { id: 'instagram', label: `Reels (${instagramItems.length})` },
          { id: 'x_twitter', label: `X / Twitter (${xTwitterItems.length})` },
          { id: 'linkedin', label: `LinkedIn (${linkedinItems.length})` },
          { id: 'formats', label: `Viral Formats (${viralFormats.length})` },
          { id: 'dna', label: 'Domain DNA & Moat' },
        ].map((tab) => {
          const isActive = activePlatformFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePlatformFilter(tab.id as PlatformTab)}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                backgroundColor: isActive ? 'var(--ai-accent)' : 'var(--bg-surface)',
                color: isActive ? '#080808' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* LOADING & ERROR STATES */}
      {trendsLoading && (
        <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--ai-accent)' }} />
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Scraping live YouTube videos, Instagram Reels, X trends & LinkedIn discussions for <strong>{activeDomain}</strong>…
          </p>
        </div>
      )}

      {trendsError && !trendsLoading && (
        <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12px' }}>
          {trendsError}
        </div>
      )}

      {/* CONTENT STREAMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '0 20px' }}>

        {/* 1. YOUTUBE SECTION */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'youtube') && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="#FF0000" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  Suggested & Trending YouTube Content
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {youtubeItems.length} videos found
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {youtubeItems.map((yt) => (
                <div
                  key={`${yt.rank}-${yt.title}`}
                  style={{
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(255, 0, 0, 0.15)', color: '#FF4D4D', textTransform: 'uppercase' }}>
                        #{yt.rank} YouTube · {yt.views || 'Trending'}
                      </span>
                      {yt.url && (
                        <a href={yt.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    <strong style={{ display: 'block', fontSize: '14px', lineHeight: 1.35, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {yt.title}
                    </strong>

                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Channel: <strong>{yt.creator || 'Verified Creator'}</strong>
                    </span>

                    {yt.why_trending && (
                      <p style={{ margin: 0, fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', lineHeight: 1.4, padding: '6px 10px', background: 'var(--bg-surface-2)', borderRadius: '8px' }}>
                        💡 {yt.why_trending}
                      </p>
                    )}
                  </div>

                  <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface-2)', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAddTrendToStoryboard(yt.title, yt.why_trending || undefined)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface-3)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Plus size={12} />
                      <span>Storyboard</span>
                    </button>
                    <button
                      onClick={() => openCopilot(`Draft a high-retention YouTube blueprint based on this trending video: Title: "${yt.title}". Channel: "${yt.creator}". Domain: "${activeDomain}". Why trending: ${yt.why_trending}`)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#080808',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Script Video</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. INSTAGRAM REELS SECTION */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'instagram') && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} color="#E1306C" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  Viral Instagram Reels
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {instagramItems.length} reels surging
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {instagramItems.map((ig) => (
                <div
                  key={`${ig.rank}-${ig.title}`}
                  style={{
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(225, 48, 108, 0.15)', color: '#FF5E97' }}>
                        Reel #{ig.rank} · {ig.views || 'Viral'}
                      </span>
                      {ig.url && (
                        <a href={ig.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    <strong style={{ display: 'block', fontSize: '13px', lineHeight: 1.35, marginBottom: '6px' }}>
                      "{ig.title}"
                    </strong>

                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--ai-accent)', fontWeight: 600, marginBottom: '8px' }}>
                      {ig.creator_handle || '@creator'}
                    </span>

                    {ig.why_trending && (
                      <p style={{ margin: 0, fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', lineHeight: 1.4 }}>
                        ⚡ {ig.why_trending}
                      </p>
                    )}
                  </div>

                  <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface-2)', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAddTrendToStoryboard(ig.title, ig.why_trending || undefined)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface-3)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      + Storyboard
                    </button>
                    <button
                      onClick={() => openCopilot(`Draft a high-conversion 45-second Instagram Reel hook based on: "${ig.title}". Creator Handle: ${ig.creator_handle}. Domain: ${activeDomain}`)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#080808',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Reel Hook
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. WHAT'S ON X (TWITTER) SECTION */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'x_twitter') && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={18} color="#1DA1F2" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  What's Happening on X (Twitter Threads)
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {xTwitterItems.length} viral threads
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {xTwitterItems.map((x) => (
                <div
                  key={`${x.rank}-${x.title}`}
                  style={{
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1DA1F2' }}>
                        {x.creator || '@tech_insider'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {x.engagement || 'High retweets'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.45, color: 'var(--text-primary)' }}>
                      "{x.title}"
                    </p>

                    {x.why_trending && (
                      <span style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.55)' : '#64748B', display: 'block', marginBottom: '10px' }}>
                        📈 {x.why_trending}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openCopilot(`Turn this viral X breakdown into a punchy 60-second video script for ${activeDomain}: "${x.title}" by ${x.creator}`)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--ai-accent)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Turn X Thread into Video</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. LINKEDIN SECTION */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'linkedin') && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#0A66C2" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  High-Authority LinkedIn Discussions
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {linkedinItems.length} discussions
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {linkedinItems.map((li) => (
                <div
                  key={`${li.rank}-${li.title}`}
                  style={{
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A66C2' }}>
                        {li.creator || 'Executive Leader'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {li.engagement || 'High saves'}
                      </span>
                    </div>

                    <strong style={{ display: 'block', fontSize: '13px', lineHeight: 1.4, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {li.title}
                    </strong>

                    {li.suggested_angle && (
                      <p style={{ margin: '0 0 10px', fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', lineHeight: 1.4 }}>
                        🎯 <strong>Angle:</strong> {li.suggested_angle}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => openCopilot(`Draft a LinkedIn video carousel & text hook on: "${li.title}". Angle: ${li.suggested_angle || 'Thought leadership'}`)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Draft Authority Post</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. VIRAL FORMATS & RETENTION FRAMEWORKS */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'formats') && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#FF6B00" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  Proven Viral Formats ({activeDomain})
                </h2>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {viralFormats.length} blueprints
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {viralFormats.map((fmt) => (
                <div
                  key={fmt.format_name}
                  style={{
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--ai-soft)', color: 'var(--ai-accent)' }}>
                      Virality {fmt.virality_score}%
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ⏱ {fmt.ideal_length}
                    </span>
                  </div>

                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {fmt.format_name}
                  </strong>

                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong>Why It Works: </strong>{fmt.why_it_works}
                  </p>

                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)', borderLeft: '3px solid var(--ai-accent)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ai-accent)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                      Structure Blueprint:
                    </span>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      {fmt.structure_template}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {fmt.platform_fit.map((p) => (
                        <span key={p} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface-3)', color: 'var(--text-muted)' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openCopilot(`Apply the "${fmt.format_name}" format to create a video script in our domain "${activeDomain}". Template: ${fmt.structure_template}`)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#080808',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Use Format
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. HIGH-VELOCITY SEARCH RADAR & KEYWORDS */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'formats') && (
          <section>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800 }}>
                High-Velocity Search Queries & Keyword Radar
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Surging discussion queries with traffic volumes and actionable hooks
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {velocityTopics.map((top) => (
                <div
                  key={top.topic}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{top.topic}</strong>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: 'var(--ai-soft)', color: 'var(--ai-accent)', fontWeight: 700 }}>
                      {top.traffic_volume}
                    </span>
                  </div>
                  {top.hook_angles?.length > 0 && (
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{top.hook_angles[0]}"
                    </p>
                  )}
                  <button
                    onClick={() => openCopilot(`Draft a script on trending search: "${top.topic}". Opening Hook: "${top.hook_angles?.[0] || ''}"`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ai-accent)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Draft Hook →
                  </button>
                </div>
              ))}
            </div>

            {/* Keyword Pills */}
            {trendsData?.trending_keywords?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {trendsData.trending_keywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => {
                      setDomainInput(kw);
                      handleApplyDomain(kw);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        )}

        {/* 7. DOMAIN DNA & MOAT DOSSIER SECTION */}
        {(activePlatformFilter === 'all' || activePlatformFilter === 'dna') && domainProfile && (
          <section
            style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--ai-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ai-accent)' }}>
                  Calibrated Domain Profile
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800 }}>
                  {domainProfile.domain_name}
                </h3>
              </div>
              <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '6px', background: 'var(--ai-soft)', color: 'var(--ai-accent)', fontWeight: 700 }}>
                {domainProfile.domain_id}
              </span>
            </div>

            {/* Audience Psychographics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-surface-2)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Audience Demographics
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {domainProfile.audience_profile.demographics}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-surface-2)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Audience Mindset & Retention Triggers
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {domainProfile.audience_profile.psychographics}
                </p>
              </div>
            </div>

            {/* Spoken Monologue Archetype */}
            {domainProfile.domain_monologues?.thesis_monologue && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-2)', borderLeft: '3px solid var(--ai-accent)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '4px' }}>
                  Spoken Thesis Monologue: {domainProfile.domain_monologues.thesis_monologue.title}
                </span>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  "{domainProfile.domain_monologues.thesis_monologue.speech}"
                </p>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  🎬 Staging: {domainProfile.domain_monologues.thesis_monologue.staging_breakdown}
                </span>
              </div>
            )}
          </section>
        )}

      </div>

      {/* STORYBOARD DRAWER & DETAIL SHEETS */}
      <StoryboardSheet
        isOpen={storyboardOpen}
        onClose={closeStoryboard}
        items={storyboardItems}
        onRemoveItem={removeFromStoryboard}
        onClearAll={clearStoryboard}
        onOpenGenerate={() => openGenerateModal()}
        onSelectItem={(contentId) => setSelectedContent(contentId)}
      />

      <GenerateContentScreen />
    </div>
  );
};
