import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Send, 
  Layers, 
  Clock, 
  Hash, 
  Flame, 
  CheckCircle2, 
  TrendingUp,
  Share2,
  Copy,
  Zap,
  Target,
  BarChart3,
  Video,
  Radio,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';

export interface SuggestionItem {
  platform: string;
  content_type: string;
  topic: string;
  hook: string;
  why_now: string;
  estimated_reach?: string | null;
  hashtags: string[];
  best_posting_time?: string | null;
}

export interface OpportunityItem {
  topic: string;
  opportunity_score: string;
  recommended_angle: string;
  suggested_platforms: string[];
}

interface SuggestionsRoadmapViewProps {
  recommendations: SuggestionItem[];
  opportunityMatrix?: OpportunityItem[];
  trendingKeywords?: string[];
  activeDomain: string;
  onDraftInCopilot: (topic: string, hook: string, platform: string) => void;
  onAddToStoryboard: (title: string, reason: string) => void;
  onSendToPublishQueue: (draft: {
    platform: string;
    content_format: string;
    title: string;
    content: string;
    tags: string[];
  }) => void;
  onApplyDomain: (domain: string) => void;
  isLoading?: boolean;
}

export const SuggestionsRoadmapView: React.FC<SuggestionsRoadmapViewProps> = ({
  recommendations,
  opportunityMatrix = [],
  trendingKeywords = [],
  activeDomain,
  onDraftInCopilot,
  onAddToStoryboard,
  onSendToPublishQueue,
  onApplyDomain,
  isLoading = false,
}) => {
  const { theme, showToast } = useAppStore();
  const isDark = theme !== 'light';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast('Copied hook to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredRecs = filterPlatform === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.platform.toLowerCase().includes(filterPlatform.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: isDark 
            ? 'linear-gradient(135deg, rgba(216, 255, 0, 0.08) 0%, rgba(26, 26, 26, 0.9) 100%)' 
            : 'linear-gradient(135deg, rgba(216, 255, 0, 0.15) 0%, #FFFFFF 100%)',
          border: '1px solid var(--ai-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: 'var(--ai-accent)',
                color: '#000000',
              }}
            >
              <Target size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ai-accent)' }}>
              Actionable Content Roadmap
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
            What To Create Next & Why
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.45 }}>
            Synthesized from real-time search velocity, multi-platform competitor analysis, and audience retention metrics in <strong>{activeDomain}</strong>.
          </p>
        </div>

        {/* PLATFORM QUICK FILTER PILLS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', 'youtube', 'instagram', 'linkedin', 'x_twitter'].map((p) => {
            const isSelected = filterPlatform === p;
            const label = p === 'all' ? 'All Platforms' : p === 'x_twitter' ? 'X / Twitter' : p.charAt(0).toUpperCase() + p.slice(1);
            return (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#000000' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SKELETON ROADMAP WHEN LOADING */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="skeleton-shimmer"
              style={{
                height: '150px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ width: '30%', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div style={{ width: '80%', height: '22px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '100px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: '100px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOP OPPORTUNITY MATRIX */}
      {!isLoading && opportunityMatrix.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} color="var(--ai-accent)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Domain Content Opportunity Matrix (High Velocity Gaps)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {opportunityMatrix.map((opp, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(216, 255, 0, 0.15)',
                      color: 'var(--ai-accent)',
                    }}
                  >
                    Score: {opp.opportunity_score}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {opp.suggested_platforms.map((sp) => (
                      <span
                        key={sp}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-surface-2)',
                          color: 'var(--text-muted)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {opp.topic}
                </h4>

                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Angle:</strong> {opp.recommended_angle}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => onDraftInCopilot(opp.topic, opp.recommended_angle, opp.suggested_platforms[0] || 'youtube')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ai-accent)',
                      color: '#000000',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Draft Script</span>
                  </button>
                  <button
                    onClick={() => onAddToStoryboard(opp.topic, opp.recommended_angle)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-2)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Board
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DETAILED SUGGESTIONS LIST */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={17} color="#FF6B00" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Ranked Production Suggestions ({filteredRecs.length})
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            1-Click Send to Copilot or Composio
          </span>
        </div>

        {filteredRecs.length === 0 ? (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px dashed var(--border-color)',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              No specific recommendations found for "{filterPlatform}". Try selecting "All Platforms" or scan a different domain.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRecs.map((rec, index) => {
              const platformLabel = rec.platform.toUpperCase();
              const isYoutube = rec.platform.toLowerCase().includes('youtube');
              const isInsta = rec.platform.toLowerCase().includes('instagram');
              const isLinkedin = rec.platform.toLowerCase().includes('linkedin');
              const isX = rec.platform.toLowerCase().includes('x') || rec.platform.toLowerCase().includes('twitter');

              const platformColor = isYoutube 
                ? '#EF4444' 
                : isInsta 
                ? '#EC4899' 
                : isLinkedin 
                ? '#0A66C2' 
                : '#38BDF8';

              return (
                <div
                  key={index}
                  style={{
                    padding: '18px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* TOP ROW: PLATFORM & METRICS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: `${platformColor}18`,
                          color: platformColor,
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.4px',
                        }}
                      >
                        {platformLabel} • {rec.content_type.toUpperCase()}
                      </span>

                      {rec.estimated_reach && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BarChart3 size={12} />
                          Est. Reach: <strong style={{ color: 'var(--text-secondary)' }}>{rec.estimated_reach}</strong>
                        </span>
                      )}
                    </div>

                    {rec.best_posting_time && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Best Time: <strong style={{ color: 'var(--ai-accent)' }}>{rec.best_posting_time}</strong>
                      </span>
                    )}
                  </div>

                  {/* TOPIC & HOOK */}
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {rec.topic}
                    </h4>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-surface-2)',
                        borderLeft: `3px solid ${platformColor}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          Viral Opening Hook:
                        </span>
                        <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          "{rec.hook}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(rec.hook, index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedIndex === index ? 'var(--ai-accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Copy Hook"
                      >
                        {copiedIndex === index ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* WHY NOW RATIONALE */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <TrendingUp size={14} style={{ color: 'var(--ai-accent)', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Why Now: </strong>{rec.why_now}
                    </p>
                  </div>

                  {/* HASHTAGS */}
                  {rec.hashtags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rec.hashtags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--bg-surface-2)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          #{tag.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => onDraftInCopilot(rec.topic, rec.hook, rec.platform)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#000000',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Generate Full Script with Copilot</span>
                    </button>

                    <button
                      onClick={() => onAddToStoryboard(rec.topic, rec.why_now)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Layers size={13} />
                      <span>Add to Storyboard</span>
                    </button>

                    <button
                      onClick={() => onSendToPublishQueue({
                        platform: rec.platform,
                        content_format: rec.content_type,
                        title: rec.topic,
                        content: `${rec.hook}\n\n[Body Script Outline]: Based on "${rec.why_now}"\n\nCall To Action: Share your thoughts below.`,
                        tags: rec.hashtags || [],
                      })}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: 'var(--ai-accent)',
                        border: '1px solid var(--ai-accent)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginLeft: 'auto',
                      }}
                    >
                      <Send size={13} />
                      <span>Push to Publishing Queue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TRENDING KEYWORDS PILLS */}
      {trendingKeywords.length > 0 && (
        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Trending Topic Vectors in {activeDomain}:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {trendingKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => onApplyDomain(kw)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                #{kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
