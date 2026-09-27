import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Swords, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Video, 
  Clock, 
  Zap, 
  FileText, 
  Search, 
  Loader2, 
  ChevronRight,
  Target,
  BarChart3,
  Copy
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { 
  legacyBackend, 
  CreatorComparisonResponse,
  CreatorBenchmarkProfile 
} from '@/services/legacyBackend';

interface CreatorComparisonViewProps {
  baseCreatorName: string;
  activeDomain: string;
  onDraftInCopilot: (topic: string, hook: string, platform: string) => void;
  onAddToStoryboard: (title: string, reason: string) => void;
}

const PRESET_BENCHMARKS = [
  { name: 'Nitish Rajput', domain: 'Civic Crime & Scam Teardowns', tag: 'High-Emotion Narrative' },
  { name: 'Mohak Mangal (Soch)', domain: 'Policy & Economic Tradeoffs', tag: 'Balanced Analysis' },
  { name: 'Johnny Harris', domain: 'Visual Journalism & Maps', tag: 'Kinetic 2.5D Maps' },
  { name: 'Ali Abdaal', domain: 'Productivity Systems & Books', tag: 'High-Density Frameworks' },
  { name: 'Marques Brownlee', domain: 'Tech & Gadgets', tag: 'Studio Aesthetics' },
  { name: 'MrBeast', domain: 'High-Stakes Spectacle', tag: 'Ultra-Fast Pacing' },
];

export const CreatorComparisonView: React.FC<CreatorComparisonViewProps> = ({
  baseCreatorName,
  activeDomain,
  onDraftInCopilot,
  onAddToStoryboard,
}) => {
  const { theme, showToast } = useAppStore();
  const isDark = theme !== 'light';

  const [selectedTarget, setSelectedTarget] = useState<string>('Nitish Rajput');
  const [customInput, setCustomInput] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<CreatorComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawMd, setShowRawMd] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'matrix' | 'architecture' | 'playbook' | 'moats' | 'blueprint'>('matrix');

  const runComparison = (targetName: string) => {
    const cleanTarget = targetName.trim();
    if (!cleanTarget) return;

    setIsLoading(true);
    setError(null);
    setSelectedTarget(cleanTarget);

    legacyBackend.compareCreator({
      creator_name: cleanTarget,
      base_creator: baseCreatorName.trim() || 'Dhruv Rathee',
      niche_hint: activeDomain,
    })
      .then((res) => {
        setComparisonData(res);
      })
      .catch((err) => {
        console.error('Comparison error:', err);
        setError(err instanceof Error ? err.message : 'Comparison failed to generate.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Run initial comparison on mount
  useEffect(() => {
    runComparison(selectedTarget);
  }, []);

  const comp = comparisonData?.comparison;
  const targetProf = comp?.target_profile;
  const baseProf = comp?.base_profile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(216, 255, 0, 0.08) 0%, rgba(20, 20, 20, 0.9) 100%)'
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
              <Swords size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ai-accent)' }}>
              Head-to-Head Creator Benchmarking
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
            Compare & Improve Content Architecture
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.45 }}>
            Benchmarks <strong>{baseCreatorName}</strong> against domain leaders. Unpacks content formatting differences, pacing divergence, narrative story arcs, and generates an actionable improvement playbook.
          </p>
        </div>

        {/* ACTIVE COMPARISON PILL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(216, 255, 0, 0.15)',
              border: '1px solid var(--ai-accent)',
              color: 'var(--ai-accent)',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            {baseCreatorName} vs. {selectedTarget}
          </span>
        </div>
      </div>

      {/* TARGET CREATOR SELECTOR */}
      <section
        style={{
          padding: '16px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Select Top Benchmark Creator or Enter Any Custom Name:
        </span>

        {/* PRESET CHIPS */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
          {PRESET_BENCHMARKS.map((item) => {
            const isSelected = selectedTarget.toLowerCase().includes(item.name.toLowerCase()) || 
                               item.name.toLowerCase().includes(selectedTarget.toLowerCase());
            return (
              <button
                key={item.name}
                onClick={() => runComparison(item.name)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#000000' : 'var(--text-primary)',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>({item.tag})</span>
              </button>
            );
          })}
        </div>

        {/* CUSTOM SEARCH INPUT */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-surface-2)',
              borderRadius: '10px',
              padding: '6px 12px',
              border: '1px solid var(--border-color)',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customInput.trim()) {
                  runComparison(customInput);
                }
              }}
              placeholder="Or benchmark any creator (e.g. Lex Fridman, Veritasium, Cleo Abram)…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>

          <button
            onClick={() => runComparison(customInput)}
            disabled={!customInput.trim() || isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: customInput.trim() ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
              color: customInput.trim() ? '#000000' : 'var(--text-muted)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 800,
              cursor: customInput.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>Compare</span>
          </button>
        </div>
      </section>

      {/* LOADING STATE */}
      {isLoading && (
        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--ai-accent)' }} />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Comparing {baseCreatorName} with {selectedTarget}…
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Analyzing pacing, narrative arcs, hook architectures, and extracting all 7 dossiers.
          </span>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* COMPARISON RESULTS */}
      {!isLoading && comp && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* NAVIGATION TABS */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px',
            }}
          >
            {[
              { id: 'matrix', label: 'Head-to-Head Matrix', icon: Swords },
              { id: 'architecture', label: 'Content Architecture Dissection', icon: Target },
              { id: 'playbook', label: 'Improvement Playbook', icon: Sparkles },
              { id: 'moats', label: 'Your Competitive Moats', icon: ShieldCheck },
              { id: 'blueprint', label: 'Next Upload Blueprint', icon: CheckCircle2 },
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                    color: isActive ? '#000000' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. HEAD-TO-HEAD MATRIX */}
          {activeSection === 'matrix' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.4fr 1.4fr',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-surface-2)',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Dimension</span>
                  <span style={{ color: 'var(--ai-accent)' }}>{baseCreatorName} (You)</span>
                  <span style={{ color: '#38BDF8' }}>{selectedTarget} (Benchmark)</span>
                </div>

                {[
                  {
                    dim: 'Audience Reach',
                    base: baseProf?.cross_platform_reach || '43M+ Cross-Platform',
                    target: targetProf?.cross_platform_reach || '9.2M+ Cross-Platform',
                  },
                  {
                    dim: 'Core Content Style',
                    base: baseProf?.core_style || 'Pedagogical Hindi civic educator, animated timeline whiteboard explainers',
                    target: targetProf?.core_style || 'Dramatic investigative case studies, dark moody aesthetic, crime & scam teardowns',
                  },
                  {
                    dim: 'Delivery Cadence (WPM)',
                    base: baseProf?.pacing_wpm || '145 - 160 WPM',
                    target: targetProf?.pacing_wpm || '130 - 145 WPM',
                  },
                  {
                    dim: 'Runtime Sweet-Spot',
                    base: baseProf?.runtime_sweet_spot || '18 - 28 min',
                    target: targetProf?.runtime_sweet_spot || '22 - 35 min',
                  },
                  {
                    dim: 'Hook Archetype',
                    base: baseProf?.hook_archetype || 'Painful Inconsistency + Cognitive Dissonance',
                    target: targetProf?.hook_archetype || 'The Crime Narrative / Dark Secret Teardown',
                  },
                  {
                    dim: 'Signature Spoken Opening',
                    base: baseProf?.signature_phrase || 'नमस्कार दोस्तों, स्वागत है आपका...',
                    target: targetProf?.signature_phrase || 'आखिर कैसे हुआ यह सब...',
                  },
                  {
                    dim: 'Thumbnail Strategy',
                    base: baseProf?.thumbnail_style || 'Electric yellow text, direct contemplative gaze, single focal evidence object',
                    target: targetProf?.thumbnail_style || 'High-contrast dark vignette, police tape / case file aesthetic, intense eye contact',
                  },
                  {
                    dim: 'Competitive Moat',
                    base: baseProf?.competitive_moat || 'Exhaustive legal & institutional research rigor with zero corporate bias',
                    target: targetProf?.competitive_moat || 'Documentary-grade investigative staging, courtroom-style pacing and suspense',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.4fr 1.4fr',
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '12px',
                      lineHeight: 1.45,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>{row.dim}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.base}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.target}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. CONTENT ARCHITECTURE DISSECTION */}
          {activeSection === 'architecture' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                How Different Content They Create (Narrative, Topic & Retention Mechanics)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    title: 'Content Formats & Packaging',
                    base: baseProf?.content_formats || 'Timeline whiteboard explainers, historical retrospectives, policy vs reality audits',
                    target: targetProf?.content_formats || 'Documentary crime & scam investigations, whistleblower breakdowns, forensic timeline reconstructions',
                  },
                  {
                    title: 'Narrative Story Arc',
                    base: baseProf?.narrative_structure || 'Current Shock ➔ Historical Root Cause ➔ Evidence & Data Dissection ➔ Citizen Impact ➔ Call for Critical Thinking',
                    target: targetProf?.narrative_structure || 'The Shocking Crime ➔ Who Was Behind It ➔ Step-by-Step Heist Execution ➔ The Fatal Mistake ➔ Systemic Legal Loophole',
                  },
                  {
                    title: 'Topic Selection Strategy',
                    base: baseProf?.topic_selection_strategy || 'High-stakes democratic systems, public institutions, environmental crises, and electoral accountability',
                    target: targetProf?.topic_selection_strategy || 'High-emotion true crime, financial cartels, institutional corruption scandals with identifiable villain figures',
                  },
                  {
                    title: 'Visual B-Roll & Visual Assets',
                    base: baseProf?.visual_storytelling || 'Bright studio backdrop, animated newspaper clippings, highlighted PDF clauses, kinetic infographics',
                    target: targetProf?.visual_storytelling || 'Moody low-key lighting, black background, forensic evidence folders, crime tape graphics, slow dramatic zoom',
                  },
                  {
                    title: 'Mid-Video Retention Loops',
                    base: baseProf?.retention_loop_mechanic || 'Chapter markers framed as provocative questions (\'Why did the government suddenly change this rule?\')',
                    target: targetProf?.retention_loop_mechanic || 'Micro-cliffhangers every 4 minutes before commercial / chapter breaks (\'And then, police received a call that changed everything\')',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)', borderLeft: '3px solid var(--ai-accent)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '4px' }}>
                          {baseCreatorName}:
                        </span>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {item.base}
                        </p>
                      </div>

                      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)', borderLeft: '3px solid #38BDF8' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#38BDF8', display: 'block', marginBottom: '4px' }}>
                          {selectedTarget}:
                        </span>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {item.target}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. ACTIONABLE IMPROVEMENT PLAYBOOK */}
          {activeSection === 'playbook' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                How to Improve Your Content (Tactical Engineering from {selectedTarget})
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(comp.content_improvement_playbook && comp.content_improvement_playbook.length > 0 ? comp.content_improvement_playbook : [
                  {
                    action: 'Narrative Arc & Storytelling Upgrade',
                    why_it_works: 'Transition from flat educational slides to an adversarial investigation model with a clear protagonist vs. hidden villain.',
                    implementation_step: 'Structure opening 45 seconds around a specific mystery or scandal rather than abstract policy definitions.',
                    estimated_impact: '+24% 3-minute audience retention'
                  },
                  {
                    action: 'Visual Storytelling & B-Roll Pipeline Upgrade',
                    why_it_works: 'Adopting moody cinematic staging and tactile evidence assets breaks mental fatigue on long explanations.',
                    implementation_step: 'Inject a visual pattern interrupt every 12-15 seconds (forensic case folder, highlighted gazette clause).',
                    estimated_impact: '+18% average view duration'
                  },
                  {
                    action: 'Mid-Video Retention Loop Engineering',
                    why_it_works: 'Placing unresolved micro-cliffhangers before major transitions pulls casual drop-offs through to completion.',
                    implementation_step: 'Add a provocative question at minute 4:30 (\'Before I reveal the real culprit, there is one bizarre clue we must inspect...\').',
                    estimated_impact: '+31% completion rate past 50% runtime'
                  },
                  {
                    action: 'Topic Framing & Packaging Upgrade',
                    why_it_works: 'Framing complex institutional data around personal consumer loss maximizes emotional clickability without rage-bait.',
                    implementation_step: 'Reframe abstract legislation into direct citizen impact (e.g. \'How this hidden clause costs your family ₹45,000\').',
                    estimated_impact: '+40% YouTube CTR'
                  },
                ]).map((play, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(216, 255, 0, 0.15)',
                            color: 'var(--ai-accent)',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          Step {idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {play.action}
                        </h4>
                      </div>

                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                        {play.estimated_impact}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong>Why It Works: </strong>{play.why_it_works}
                    </p>

                    <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)', borderLeft: '3px solid var(--ai-accent)' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '2px' }}>
                        Implementation Blueprint:
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                        {play.implementation_step}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={() => onDraftInCopilot(play.action, play.implementation_step, 'youtube')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--ai-accent)',
                          color: '#000000',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Sparkles size={12} />
                        <span>Apply in Script Generator</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. USER'S UNFAIR COMPETITIVE MOATS */}
          {activeSection === 'moats' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--ai-accent)" />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Your Unfair Competitive Moats (Where {baseCreatorName} Dominates)
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  While learning narrative tactics from competitors, do NOT abandon these core moats which command deep viewer loyalty:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  {(comp.user_advantages && comp.user_advantages.length > 0 ? comp.user_advantages : [
                    'Authentic Pedagogical Moat: Research rigor and transparent citation command deeper long-tail trust than sensational click-driven formats.',
                    'High Information Density: Viewers return for irreplaceable empirical substance rather than superficial entertainment.',
                    'Linguistic Loyalty & Community Resonance: Native mannerisms and genuine vulnerability foster generational peer loyalty.',
                  ]).map((adv, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-surface-2)',
                        borderLeft: '3px solid #10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                        {adv}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 5. IMMEDIATE CONTENT BLUEPRINT FOR NEXT UPLOAD */}
          {activeSection === 'blueprint' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="var(--ai-accent)" />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Immediate 5-Point Upload Blueprint for Next Video
                  </h4>
                </div>

                {[
                  {
                    step: '1. The Hook (0:00 - 0:45)',
                    desc: `Lead with ${selectedTarget}'s high-stakes mystery framing while keeping ${baseCreatorName}'s signature authentic opening greeting.`,
                  },
                  {
                    step: '2. The Narrative Shift (1:00 - 4:00)',
                    desc: 'Introduce a clear "protagonist vs antagonist" or "victim vs hidden loophole" conflict rather than pure abstract explanation.',
                  },
                  {
                    step: '3. Mid-Video Retention Twist (4:30)',
                    desc: 'Insert an open curiosity loop ("Before I reveal the real culprit, there is one bizarre clue we must look at...") before the evidence reveal.',
                  },
                  {
                    step: '4. Visual Production & Pacing',
                    desc: 'Inject a visual pattern interrupt every 15 seconds (motion graphics, highlighted gazette clippings) to eliminate drop-off.',
                  },
                  {
                    step: '5. Call to Action',
                    desc: 'Provide a tangible takeaway (spreadsheet, checklist, or action blueprint) to maximize saves, shares, and comments.',
                  },
                ].map((bp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-surface-2)',
                      borderLeft: '3px solid var(--ai-accent)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: 'var(--ai-accent)' }}>{bp.step}</strong>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {bp.desc}
                    </p>
                  </div>
                ))}

                <button
                  onClick={() => onDraftInCopilot('Next Upload Blueprint', 'Generate full script following the 5-point blueprint', 'youtube')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--ai-accent)',
                    color: '#000000',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Draft Next Video Script With This Blueprint</span>
                </button>
              </div>
            </section>
          )}

          {/* TOGGLE RAW COMPARISON MARKDOWN */}
          {comparisonData?.creator_comparison_md && (
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setShowRawMd(!showRawMd)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ai-accent)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                }}
              >
                <FileText size={14} />
                <span>{showRawMd ? 'Hide Raw Markdown Dossier' : 'View Raw creator_comparison.md Dossier'}</span>
              </button>

              {showRawMd && (
                <pre
                  style={{
                    marginTop: '10px',
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#050505' : '#F1F5F9',
                    color: isDark ? '#E2E8F0' : '#1E293B',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    border: '1px solid var(--border-color)',
                    maxHeight: '400px',
                  }}
                >
                  {comparisonData.creator_comparison_md}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
