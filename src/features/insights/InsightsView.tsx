import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Globe, 
  Eye, 
  Users, 
  BarChart3, 
  Compass, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Layers, 
  CheckCircle2,
  Video,
  Film,
  Hash,
  Search,
  ExternalLink,
  Plus,
  Loader2
} from 'lucide-react';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useAppStore } from '@/shared/state/app.store';
import { useCIStore } from '@/features/creator-intelligence/state/creatorIntelligenceStore';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import { Button } from '@/shared/components/Button';
import { 
  DashboardResponse, 
  legacyBackend, 
  TrendsResponse, 
  DomainArchetype,
  YouTubeTrendItem,
  InstagramTrendItem,
  XTwitterTrendItem,
  LinkedInTrendItem
} from '@/services/legacyBackend';

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export const InsightsView: React.FC = () => {
  const { creator, updateProfile } = useCreatorStore();
  const { openCopilot, openModal, showToast } = useAppStore();
  const { addToStoryboard } = useCIStore();

  const [activeDomain, setActiveDomain] = useState<string>(creator.niche || 'Consumer Technology, Hardware & AI Gadgets');
  const [domainSearch, setDomainSearch] = useState<string>(creator.niche || 'Consumer Technology, Hardware & AI Gadgets');
  const [availableDomains, setAvailableDomains] = useState<DomainArchetype[]>([]);
  
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load recognized domains on mount
  useEffect(() => {
    legacyBackend.getDomains()
      .then((res) => {
        if (res?.domains?.length) {
          setAvailableDomains(res.domains);
        }
      })
      .catch((err) => {
        console.warn('Failed to load domains:', err);
      });
  }, []);

  const fetchInsights = (domainToFetch: string) => {
    setIsLoading(true);
    const creatorName = creator.name.trim() || 'Creator';
    const cleanDomain = domainToFetch.trim() || 'Tech & AI';

    Promise.allSettled([
      legacyBackend.getDashboard(creatorName, timeframe),
      legacyBackend.getTrends(cleanDomain, 'US', 10, creatorName),
    ]).then(([dashboardResult, trendsResult]) => {
      const errors: string[] = [];
      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value);
      } else {
        errors.push(dashboardResult.reason instanceof Error ? dashboardResult.reason.message : 'Dashboard unavailable');
      }
      if (trendsResult.status === 'fulfilled') {
        setTrends(trendsResult.value);
      } else {
        errors.push(trendsResult.reason instanceof Error ? trendsResult.reason.message : 'Trends unavailable');
      }
      setApiError(errors.length ? errors.join(' · ') : null);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchInsights(activeDomain);
  }, [creator.name, activeDomain, timeframe]);

  const handleApplyDomain = (newDomain: string) => {
    const cleaned = newDomain.trim();
    if (!cleaned) return;
    setActiveDomain(cleaned);
    setDomainSearch(cleaned);
    updateProfile({ niche: cleaned });
    showToast(`Domain switched to "${cleaned}"`);
  };

  const handleAddToStoryboard = (title: string, note?: string) => {
    addToStoryboard(title, note);
    showToast(`Added to Storyboard: "${title.slice(0, 30)}..."`);
  };

  const youtube = dashboard?.platforms?.youtube;
  const opportunity = trends?.content_opportunity_matrix?.[0];
  const youtubeItems: YouTubeTrendItem[] = trends?.youtube_trending || [];
  const instagramItems: InstagramTrendItem[] = trends?.instagram_trending || [];
  const xTwitterItems: XTwitterTrendItem[] = trends?.x_twitter_trending || [];
  const linkedinItems: LinkedInTrendItem[] = trends?.linkedin_trending || [];

  return (
    <main className="screen-container" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ai-accent)', fontWeight: 800 }}>
            ⚡ Cross-Platform Live Intelligence
          </div>
          {/* Timeframe selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '7px',
                  backgroundColor: timeframe === tf ? 'var(--ai-accent)' : 'transparent',
                  color: timeframe === tf ? '#080808' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', margin: '4px 0 12px' }}>
          Know what to <br />create next.
        </h1>

        {/* DOMAIN SEARCH BAR */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
          <input
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyDomain(domainSearch);
            }}
            placeholder="Search domain (e.g. AI Agents, Personal Finance, Fitness, Gaming)..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 100px 10px 38px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleApplyDomain(domainSearch)}
            disabled={isLoading}
            style={{
              position: 'absolute',
              right: 6,
              top: 5,
              bottom: 5,
              padding: '0 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--ai-accent)',
              color: '#080808',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            <span>Update</span>
          </button>
        </div>

        {/* DOMAIN PILLS */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '12px' }}>
          {(availableDomains.length ? availableDomains : [
            { domain_id: 'tech', domain_name: 'Consumer Tech & AI' },
            { domain_id: 'finance', domain_name: 'Personal Finance' },
            { domain_id: 'productivity', domain_name: 'Productivity Systems' },
            { domain_id: 'civic', domain_name: 'Civic Rights & Policy' },
            { domain_id: 'startups', domain_name: 'Startups & Business' },
            { domain_id: 'fitness', domain_name: 'Health & Fitness' },
          ]).map((d: any) => {
            const isSelected = activeDomain.toLowerCase().includes(d.domain_name.toLowerCase()) || 
                               d.domain_name.toLowerCase().includes(activeDomain.toLowerCase());
            return (
              <button
                key={d.domain_id}
                onClick={() => handleApplyDomain(d.domain_name)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#080808' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {d.domain_name}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: apiError ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isLoading ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Loading live trends for {activeDomain}…</span>
              </>
            ) : apiError ? (
              apiError
            ) : (
              <>
                <CheckCircle2 size={12} color="#00DC82" />
                <span>Active Domain: {activeDomain}</span>
              </>
            )}
          </span>
          <Button variant="secondary" size="sm" onClick={() => openModal('creator-intelligence')} style={{ gap: '6px' }}>
            <Compass size={14} /> Full Radar
          </Button>
        </div>
      </div>

      {/* 2x2 Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '26px',
        }}
      >
        <Card variant="surface" padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Views</span>
            <Eye size={14} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            {youtube ? formatCount(youtube.total_views_or_impressions) : creator.metrics.views || '18.4M'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Chip label={youtube ? 'YouTube views' : creator.metrics.viewsChange || '+12.4%'} variant="ai" />
          </div>
        </Card>

        <Card variant="surface" padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engagement</span>
            <BarChart3 size={14} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            {dashboard ? `${dashboard.overall_engagement_rate}%` : creator.metrics.engagement || '6.8%'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Chip label={dashboard ? 'Overall rate' : creator.metrics.engagementChange || 'Verified'} variant="ai" />
          </div>
        </Card>

        <Card variant="surface" padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Reach</span>
            <Eye size={14} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            {dashboard ? formatCount(dashboard.overall_reach) : '8.1M'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Chip label={dashboard ? 'Across 5 platforms' : 'Omni-channel'} />
          </div>
        </Card>

        <Card variant="surface" padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Growth Rate</span>
            <Users size={14} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            {youtube ? `+${youtube.growth_rate_30d_percent}%` : creator.metrics.growth || '+4.2%'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Chip label={youtube ? `${timeframe} growth` : 'Audience rate'} variant="success" />
          </div>
        </Card>
      </div>

      {/* 1. YOUTUBE TRENDING VIDEOS */}
      {youtubeItems.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={17} color="#FF0000" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Suggested YouTube Content</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
              {youtubeItems.length} videos
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {youtubeItems.slice(0, 4).map((yt) => (
              <Card key={`${yt.rank}-${yt.title}`} variant="surface" padding="14px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {yt.title}
                  </strong>
                  {yt.url && (
                    <a href={yt.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Channel: <strong>{yt.creator || 'Creator'}</strong></span>
                  <span>·</span>
                  <span style={{ color: '#FF4D4D', fontWeight: 700 }}>{yt.views || 'Trending'}</span>
                </div>
                {yt.why_trending && (
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    💡 {yt.why_trending}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="sm" onClick={() => handleAddToStoryboard(yt.title, yt.why_trending || undefined)} style={{ flex: 1 }}>
                    <Plus size={12} /> Storyboard
                  </Button>
                  <Button variant="ai" size="sm" onClick={() => openCopilot(`Draft a high-retention video concept on: "${yt.title}" in domain "${activeDomain}". Why: ${yt.why_trending}`)} style={{ flex: 1 }}>
                    <Sparkles size={12} /> Script
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 2. INSTAGRAM VIRAL REELS */}
      {instagramItems.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={17} color="#E1306C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Trending Instagram Reels</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
              {instagramItems.length} reels
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {instagramItems.slice(0, 4).map((ig) => (
              <Card key={`${ig.rank}-${ig.title}`} variant="surface" padding="14px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
                    {ig.creator_handle || '@creator'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#FF5E97', fontWeight: 700 }}>
                    {ig.views || 'Viral'}
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '12px', lineHeight: 1.4, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  "{ig.title}"
                </strong>
                <Button variant="secondary" size="sm" fullWidth onClick={() => openCopilot(`Create a 45-second Reel hook for: "${ig.title}". Creator: ${ig.creator_handle}`)}>
                  <Sparkles size={12} /> Draft Reel Hook
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. WHAT'S ON X (TWITTER) */}
      {xTwitterItems.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hash size={17} color="#1DA1F2" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>What's on X (Twitter Threads)</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
              {xTwitterItems.length} threads
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {xTwitterItems.slice(0, 3).map((x) => (
              <Card key={`${x.rank}-${x.title}`} variant="surface" padding="14px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#1DA1F2', fontWeight: 700 }}>{x.creator || '@tech'}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{x.engagement || 'Trending'}</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '12px', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                  "{x.title}"
                </p>
                <Button variant="secondary" size="sm" onClick={() => openCopilot(`Turn this viral X thread into a video hook: "${x.title}"`)}>
                  <Sparkles size={12} /> Turn into Video Hook
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 4. LINKEDIN AUTHORITY DISCUSSIONS */}
      {linkedinItems.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={17} color="#0A66C2" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>LinkedIn Authority Discussions</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 700 }}>
              {linkedinItems.length} discussions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {linkedinItems.slice(0, 3).map((li) => (
              <Card key={`${li.rank}-${li.title}`} variant="surface" padding="14px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#0A66C2', fontWeight: 700 }}>{li.creator || 'Leader'}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{li.engagement || 'High saves'}</span>
                </div>
                <strong style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {li.title}
                </strong>
                {li.suggested_angle && (
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Angle: {li.suggested_angle}
                  </p>
                )}
                <Button variant="secondary" size="sm" onClick={() => openCopilot(`Draft a LinkedIn video on: "${li.title}". Angle: ${li.suggested_angle}`)}>
                  <Sparkles size={12} /> Draft Authority Video
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 5. VIRAL FORMAT TEMPLATES */}
      {trends?.viral_formats && trends.viral_formats.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--ai-accent)" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Proven Viral Formats</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 600 }}>Algorithm-backed</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {trends.viral_formats.slice(0, 4).map((fmt, idx) => (
              <Card key={idx} variant="surface" padding="16px">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#fff' }}>{fmt.format_name}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ai-accent)' }}>
                    {fmt.virality_score}% Virality
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Length: {fmt.ideal_length} · Platforms: {fmt.platform_fit.join(', ')}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {fmt.why_it_works}
                </p>
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                  }}
                >
                  Structure: {fmt.structure_template}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => openCopilot(`Draft a script using the "${fmt.format_name}" format for ${activeDomain}: ${fmt.structure_template}`)}
                >
                  <Sparkles size={12} /> Use Format in Copilot
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. KEYWORD RADAR */}
      {trends?.trending_keywords && trends.trending_keywords.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <TrendingUp size={15} color="#00DC82" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>High-Velocity Search Keywords</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {trends.trending_keywords.map((kw) => (
              <Chip
                key={kw}
                label={`#${kw}`}
                variant="ai"
                onClick={() => {
                  setDomainSearch(kw);
                  handleApplyDomain(kw);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. CONTENT OPPORTUNITY */}
      {opportunity && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={16} color="var(--ai-accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>High-Potential Opportunity</h3>
          </div>

          <Card variant="ai" padding="20px">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ai-accent)', fontWeight: 700 }}>
              {opportunity.opportunity_score}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', color: '#fff' }}>
              “{opportunity.topic}”
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
              {opportunity.recommended_angle}
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                openCopilot(`Generate a video concept for: ${opportunity.topic} in domain "${activeDomain}". Angle: ${opportunity.recommended_angle}`);
              }}
              style={{ gap: '6px' }}
            >
              <Sparkles size={15} aria-hidden="true" />
              Create Video From Opportunity
            </Button>
          </Card>
        </section>
      )}

      {/* 8. IN-APP STUDIO PRODUCTION PULSE */}
      {dashboard?.app_platform_metrics && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px' }}>In-App Studio Production Pulse</h3>
          <Card variant="surface" padding="14px">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scripts Drafted</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ai-accent)', marginTop: '2px' }}>
                  {dashboard.app_platform_metrics.total_scripts_generated}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hooks Created</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {dashboard.app_platform_metrics.total_hooks_created}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Composio Delivery</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#00DC82', marginTop: '2px' }}>
                  {dashboard.app_platform_metrics.publishing_success_rate}%
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}
    </main>
  );
};
