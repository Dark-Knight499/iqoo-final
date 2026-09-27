import React, { useEffect, useState } from 'react';
import { Sparkles, Globe, Eye, Users, BarChart3, Compass, RefreshCw, Zap, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { useCreatorStore } from '@/shared/state/creator.store';
import { useAppStore } from '@/shared/state/app.store';
import { Card } from '@/shared/components/Card';
import { Chip } from '@/shared/components/Chip';
import { Button } from '@/shared/components/Button';
import { DashboardResponse, legacyBackend, TrendItem, TrendsResponse } from '@/services/legacyBackend';

interface InsightTrend {
  id: string;
  title: string;
  meta: string;
  relevance: string;
  category: string;
  description: string;
}

const FALLBACK_TRENDS: InsightTrend[] = [
  {
    id: 'demo-ai-agents',
    title: 'AI coding agents',
    meta: '+142% (demo)',
    relevance: 'Very High (demo)',
    category: 'Technology & AI',
    description: 'A demo trend card shown while the backend is unavailable.',
  },
  {
    id: 'demo-on-device-ai',
    title: 'On-device AI & private models',
    meta: '+98% (demo)',
    relevance: 'High (demo)',
    category: 'Technology & AI',
    description: 'A demo trend card shown while the backend is unavailable.',
  },
];

const FALLBACK_WORLD_TRENDS = ['VLMs & Vision', 'Local Whisper', 'Snapdragon NPU', 'Robotics', 'Creator Economy', 'AI Phones'];

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function mapTrend(item: TrendItem): InsightTrend {
  return {
    id: `${item.source}-${item.rank}-${item.title}`,
    title: item.title,
    meta: item.traffic_volume,
    relevance: item.relevance_to_creator,
    category: item.category,
    description: item.hook_angles[0] || item.relevance_to_creator,
  };
}

export const InsightsView: React.FC = () => {
  const { creator } = useCreatorStore();
  const { openCopilot, openModal } = useAppStore();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchInsights = () => {
    setIsLoading(true);
    const creatorName = creator.name.trim() || 'Ali Abdaal';
    const creatorNiche = creator.niche.trim() || 'Tech & AI';

    Promise.allSettled([
      legacyBackend.getDashboard(creatorName, timeframe),
      legacyBackend.getTrends(creatorNiche, 'US', 8, creatorName),
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
      setApiError(errors.length ? errors.join(' ') : null);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchInsights();
  }, [creator.name, creator.niche, timeframe]);

  const nicheTrends = trends?.niche_trends.length
    ? trends.niche_trends.map(mapTrend)
    : FALLBACK_TRENDS;
  const worldTrends = trends?.world_trends.length
    ? trends.world_trends.map((trend) => trend.title)
    : FALLBACK_WORLD_TRENDS;
  const youtube = dashboard?.platforms.youtube;
  const opportunity = trends?.content_opportunity_matrix[0];

  return (
    <main className="screen-container" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Creator Intelligence & Trends
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

        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', margin: '4px 0 0' }}>
          Know what to <br />create next.
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', color: apiError ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isLoading ? (
              <>
                <RefreshCw size={12} className="spin" />
                <span>Loading creator insights & trends…</span>
              </>
            ) : apiError ? (
              'Partial/demo data · backend unavailable'
            ) : (
              <>
                <CheckCircle2 size={12} color="#00DC82" />
                <span>Live Data from Creator AI Backend ({timeframe})</span>
              </>
            )}
          </span>
          <Button variant="secondary" size="sm" onClick={() => openModal('creator-intelligence')} style={{ gap: '6px' }}>
            <Compass size={14} /> Discover
          </Button>
        </div>
        {apiError && (
          <p role="status" style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.4 }}>
            {apiError} Showing demo trends where data is unavailable.
          </p>
        )}
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

      {/* Multi-Platform Audience Grid (YouTube, Instagram, Substack, LinkedIn, X/Twitter) */}
      {dashboard && (
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px' }}>
            Omni-Channel Audience Performance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.entries(dashboard.platforms).map(([platformKey, data]) => (
              <Card key={platformKey} variant="surface" padding="12px">
                <div style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                  {data.platform}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCount(data.followers_or_subscribers)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>{data.avg_engagement_rate_percent}% eng.</span>
                  <span style={{ color: '#00DC82' }}>+{data.growth_rate_30d_percent}%</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Creation Opportunity Section */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={16} color="var(--ai-accent)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>High-Potential Opportunity</h3>
        </div>

        <Card variant="ai" padding="20px">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ai-accent)', fontWeight: 700 }}>
            {opportunity?.opportunity_score || 'Creator recommendation'}
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', color: '#fff' }}>
            {opportunity ? `“${opportunity.topic}”` : 'Your next content opportunity'}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
            {opportunity?.recommended_angle || dashboard?.executive_summary || 'Connect the backend to load creator-specific recommendations.'}
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              openCopilot(`Generate a video concept for: ${opportunity?.topic || creator.niche}`);
            }}
            style={{ gap: '6px' }}
          >
             <Sparkles size={15} aria-hidden="true" />
             Create Video From Opportunity
          </Button>
        </Card>
      </section>

      {/* Viral Format Templates from Backend */}
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
                  onClick={() => openCopilot(`Draft a script using the "${fmt.format_name}" format: ${fmt.structure_template}`)}
                >
                  <Sparkles size={12} /> Use Format in Copilot
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Trending Keywords Cluster */}
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
                onClick={() => openCopilot(`Explore content ideas and hooks for: ${kw}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Niche Trends */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Trending In Your Niche</h3>
          <span style={{ fontSize: '11px', color: trends ? 'var(--ai-accent)' : 'var(--text-muted)', fontWeight: 600 }}>
            {trends ? 'Backend trends' : 'Demo fallback'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {nicheTrends.map((trend) => (
            <article
              key={trend.id}
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'var(--bg-surface-2)',
                minHeight: '140px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>{trend.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--ai-accent)', fontWeight: 600 }}>{trend.meta}</span>
                  </div>
                  <Chip label={trend.relevance} variant="ai" />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 10px', maxWidth: '300px' }}>
                  {trend.description}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Chip label={trend.category} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* World Trends */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Globe size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>World Trends</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {worldTrends.map((wt) => (
            <Chip
              key={wt}
              label={wt}
              onClick={() => openCopilot(`Explore content ideas for: ${wt}`)}
            />
          ))}
        </div>
      </section>

      {/* In-App Production Metrics */}
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

      {dashboard?.key_recommendations?.length ? (
        <section style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>Backend Recommendations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dashboard.key_recommendations.map((recommendation, index) => (
              <Card key={`${index}-${recommendation}`} variant="surface" padding="14px">
                <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>{recommendation}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};
