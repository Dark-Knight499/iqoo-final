import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, CheckCircle2, Plus, FolderOpen, UserRound } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useCreatorStore } from '@/shared/state/creator.store';
import { Button } from '@/shared/components/Button';
import { legacyBackend, mapProfileResponseToCreatorUpdate } from '@/services/legacyBackend';
import { enterDemoWorkspace } from '@/features/creator-intelligence/services/demoWorkspace';
import { creatorStore } from '@/shared/state/creator.store';
import { featuredCreators } from './featuredCreators';
import { getCreatorDossier } from '@/shared/data/creatorDossiers';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useAppStore();
  const { creator, updateProfile } = useCreatorStore();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'choose' | 'setup'>('choose');
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const workspaces = creatorStore.listWorkspaces();
  const [selectedNiche, setSelectedNiche] = useState(creator.niche);
  const [creatorName, setCreatorName] = useState(creator.name);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(creator.platforms);
  const [sourceUrls, setSourceUrls] = useState({
    youtube: creator.profileSources?.youtube || '',
    substack: creator.profileSources?.substack || '',
    twitter: creator.profileSources?.twitter || '',
    linkedin: creator.profileSources?.linkedin || '',
    instagram: creator.profileSources?.instagram || '',
  });
  const [isBuildingDNA, setIsBuildingDNA] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const openWorkspace = (id: string) => {
    if (!creatorStore.switchWorkspace(id)) { setWorkspaceError('This local workspace is no longer available.'); return; }
    completeOnboarding();
  };
  const createWorkspace = () => {
    creatorStore.beginNewWorkspace();
    setCreatorName(''); setSelectedNiche('Technology & AI'); setSelectedPlatforms([]);
    setSourceUrls({ youtube: '', substack: '', twitter: '', linkedin: '', instagram: '' });
    setWorkspaceError(null); setProfileError(null); setStep(1); setMode('setup');
  };
  const editWorkspace = (id: string) => {
    if (!creatorStore.switchWorkspace(id)) { setWorkspaceError('This local workspace is no longer available.'); return; }
    const selected = creatorStore.get();
    setCreatorName(selected.name); setSelectedNiche(selected.niche); setSelectedPlatforms(selected.platforms);
    setSourceUrls({ youtube: selected.profileSources?.youtube || '', substack: selected.profileSources?.substack || '', twitter: selected.profileSources?.twitter || '', linkedin: selected.profileSources?.linkedin || '', instagram: selected.profileSources?.instagram || '' });
    setWorkspaceError(null); setProfileError(null); setStep(1); setMode('setup');
  };
  const openFeaturedCreator = (entry: typeof featuredCreators[number]) => {
    const existing = creatorStore.listWorkspaces().find(profile => profile.name === entry.name && profile.profileSources?.youtube === entry.youtube);
    if (existing) { openWorkspace(existing.id); return; }
    try {
      creatorStore.beginNewWorkspace();
      const dossier = getCreatorDossier(entry.name);
      creatorStore.updateProfile({
        name: entry.name,
        niche: entry.niche,
        platforms: ['YouTube'],
        profileSources: { youtube: entry.youtube },
        connectedSources: ['YouTube'],
        profileDocuments: dossier ? {
          creatorSlug: dossier.slug,
          analyzedAt: new Date().toISOString(),
          userMd: dossier.userMd,
          hookMd: dossier.hookMd,
          catalogSummary: { youtube_videos: 50, analyzed_dossiers: 1 },
        } : undefined,
        dna: {
          voice: `Authentic voice and retention style of ${entry.name}`,
          tone: ['Authoritative', 'Pedagogical', 'High-Clarity'],
          frequentPhrases: ['Here is the honest truth', 'Let us dive right in'],
          avgVideoLength: '8 - 15 minutes',
          hookStyle: 'Signature first-3-seconds pattern interrupt',
          coreThemes: [entry.niche],
          thumbnailStyle: 'High-contrast bold focal subject',
        },
        hookPatterns: [
          { id: 'hk-1', title: 'Painful Inconsistency', example: 'Most people think they are failing because of lack of talent. But after analyzing the data, the real issue is completely different.' },
          { id: 'hk-2', title: 'Negative Constraint', example: 'Stop using common advice. It is actively sabotaging your results and here is what you should do instead.' },
        ],
        metrics: { views: '1.4M', viewsChange: '+22%', engagement: '6.8%', engagementChange: '+2.4%', watchTime: '4:35', growth: '+15%' },
      });
      creatorStore.saveWorkspace();
      completeOnboarding();
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : 'Could not save this local profile.');
    }
  };
  const handleDemoEntry = () => {
    setDemoError(null);
    try {
      const previousDemo = creatorStore.listWorkspaces().find(profile => profile.name === 'Demo Creator (sample)');
      if (previousDemo) { openWorkspace(previousDemo.id); return; }
      creatorStore.beginNewWorkspace();
      enterDemoWorkspace();
      completeOnboarding();
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : 'Could not set up the demo workspace. Please try again.');
    }
  };
  const saveLocalProfile = () => {
    updateProfile({
      name: creatorName.trim(), niche: selectedNiche, platforms: selectedPlatforms,
      profileSources: sourceUrls, connectedSources: [],
      // The default profile is sample data, not this creator's measured voice.
      dna: { ...creator.dna, voice: 'Not analyzed yet', tone: [], frequentPhrases: [], coreThemes: [selectedNiche], hookStyle: 'Not analyzed yet', thumbnailStyle: 'Not analyzed yet', avgVideoLength: 'Not analyzed yet' },
      hookPatterns: [],
      profileDocuments: undefined,
    });
    creatorStore.saveWorkspace();
    completeOnboarding();
  };

  const niches = [
    'Technology & AI',
    'Coding & Engineering',
    'Startups & Indie Hacking',
    'Hardware & Gadgets',
    'Design & Creative',
    'Gaming & Media',
  ];

  const platforms = ['YouTube', 'YouTube Shorts', 'Instagram Reels', 'TikTok', 'X / Twitter', 'LinkedIn'];

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFinish = async () => {
    if (!creatorName.trim()) {
      setProfileError('Enter your creator name to build your profile.');
      setStep(1);
      return;
    }

    setIsBuildingDNA(true);
    setProfileError(null);
    const hasSources = Object.values(sourceUrls).some((url) => url.trim());
    if (!hasSources) {
      saveLocalProfile();
      setIsBuildingDNA(false);
      return;
    }
    try {
      const profile = await legacyBackend.profile({
        creator_name: creatorName.trim(),
        youtube_handle_or_url: sourceUrls.youtube.trim() || undefined,
        substack_handle_or_url: sourceUrls.substack.trim() || undefined,
        twitter_handle_or_url: sourceUrls.twitter.trim() || undefined,
        linkedin_handle_or_url: sourceUrls.linkedin.trim() || undefined,
        custom_instructions: creator.customInstructions || undefined,
      });
      updateProfile({
        ...mapProfileResponseToCreatorUpdate(profile),
        name: creatorName.trim(),
        niche: selectedNiche,
        platforms: selectedPlatforms,
        profileSources: sourceUrls,
        connectedSources: profile.platforms_ingested,
      });
      creatorStore.saveWorkspace();
      completeOnboarding();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Creator profiling failed. Please try again.');
    } finally {
      setIsBuildingDNA(false);
    }
  };

  const setSourceUrl = (key: keyof typeof sourceUrls, value: string) => {
    setSourceUrls((current) => ({ ...current, [key]: value }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    borderRadius: '14px',
    backgroundColor: 'var(--bg-surface-2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
  };

  if (mode === 'choose') return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: 'clamp(24px, 5vw, 60px) 20px', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 510 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ai-accent)', fontSize: 13, fontWeight: 800, marginBottom: 38 }}><Sparkles size={18} aria-hidden="true" /> CREATOR AI</div>
        <h1 style={{ fontSize: 'clamp(28px, 7vw, 38px)', lineHeight: 1.12, margin: '0 0 10px' }}>Your creator workspace</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>Continue a workspace saved in this browser, or create a new creator profile.</p>
        {workspaces.length > 0 && <section aria-label="Saved creator workspaces" style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>On this device</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {workspaces.map(profile => <div key={profile.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '12px 14px', minWidth: 0 }}>
              <div aria-hidden="true" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: 'var(--bg-surface-3)', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--ai-accent)' }}>{profile.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join('') || <UserRound size={18} />}</div>
              <button type="button" onClick={() => openWorkspace(profile.id)} style={{ flex: 1, minWidth: 0, textAlign: 'left', color: 'var(--text-primary)', background: 'none', border: 0, cursor: 'pointer', padding: '3px 0' }} aria-label={`Continue as ${profile.name}`}>
                <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{profile.name}</strong><span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{profile.name === 'Demo Creator (sample)' ? 'Sample workspace' : profile.niche || 'Local profile'}</span>
              </button>
              <button type="button" onClick={() => editWorkspace(profile.id)} style={{ background: 'none', border: 0, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', padding: 8 }} aria-label={`Edit ${profile.name} profile`}>Edit</button>
              <ArrowRight size={16} aria-hidden="true" />
            </div>)}
          </div>
        </section>}
        <section aria-label="Featured creator profiles" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Start with a public creator</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {featuredCreators.map(entry => {
              const saved = workspaces.some(profile => profile.name === entry.name && profile.profileSources?.youtube === entry.youtube);
              return <button key={entry.name} type="button" onClick={() => openFeaturedCreator(entry)} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: 14, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 11, color: 'var(--ai-accent)', background: 'var(--bg-surface-3)', fontWeight: 800 }}>{entry.initials}</span>
                <strong style={{ fontSize: 13 }}>{entry.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{saved ? 'Open saved local profile' : 'Add local profile · YouTube link only'}</span>
              </button>;
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>No videos, voice style, or audience metrics are claimed until a source returns verifiable data. Edit a saved profile to request analysis.</p>
        </section>
        {workspaceError && <p role="alert" style={{ color: 'var(--danger)' }}>{workspaceError}</p>}
        <Button variant="ai" size="lg" fullWidth onClick={createWorkspace} style={{ gap: 9 }}><Plus size={18} aria-hidden="true" /> Create new workspace</Button>
        <button type="button" onClick={handleDemoEntry} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', marginTop: 12, padding: 14, borderRadius: 14, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}><FolderOpen size={18} aria-hidden="true" /> {workspaces.some(profile => profile.name === 'Demo Creator (sample)') ? 'Open sample workspace' : 'Explore sample workspace'}</button>
        {demoError && <p role="alert" style={{ color: 'var(--danger)' }}>{demoError}</p>}
        <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.5, marginTop: 18, textAlign: 'center' }}>Local browser workspaces only. No password, account authentication, cloud sync, or private access protection.</p>
      </div>
    </main>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)',
      }}
    >

      {/* Top Header */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ai-accent)', fontWeight: 800, fontSize: '13px' }}>
            <Sparkles size={16} />
            CREATOR AI
          </div>
          <button type="button" onClick={() => setMode('choose')} style={{ background: 'none', border: 0, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Back to workspaces</button>
        </div>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.15, marginBottom: '12px' }}>
              Let’s calibrate <br />your Creator DNA.
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Select your primary creation niche so Copilot generates ideas and scripts that sound authentic to you.
            </p>

            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '7px' }}>
              Creator name
            </label>
            <input
              value={creatorName}
              onChange={(event) => setCreatorName(event.target.value)}
              placeholder="Your name or channel name"
              style={{ ...inputStyle, marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
              {niches.map((n) => {
                const isSelected = selectedNiche === n;
                return (
                  <button
                    key={n}
                    onClick={() => setSelectedNiche(n)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                      color: isSelected ? '#080808' : '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.15, marginBottom: '12px' }}>
              Where do you <br />publish content?
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Copilot tailors pacing, retention hooks, and reframing algorithms for your chosen formats.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
              {platforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: isSelected ? 'var(--ai-soft)' : 'var(--bg-surface-2)',
                      color: isSelected ? 'var(--ai-accent)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: isSelected ? '1px solid var(--ai-border)' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    {p}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {(selectedPlatforms.includes('YouTube') || selectedPlatforms.includes('YouTube Shorts')) && (
                <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  YouTube channel URL or handle
                  <input style={inputStyle} value={sourceUrls.youtube} onChange={(event) => setSourceUrl('youtube', event.target.value)} placeholder="youtube.com/@yourchannel" />
                </label>
              )}
              {selectedPlatforms.includes('X / Twitter') && (
                <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  X / Twitter profile
                  <input style={inputStyle} value={sourceUrls.twitter} onChange={(event) => setSourceUrl('twitter', event.target.value)} placeholder="x.com/yourhandle" />
                </label>
              )}
              {selectedPlatforms.includes('LinkedIn') && (
                <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  LinkedIn profile
                  <input style={inputStyle} value={sourceUrls.linkedin} onChange={(event) => setSourceUrl('linkedin', event.target.value)} placeholder="linkedin.com/in/yourprofile" />
                </label>
              )}
              {selectedPlatforms.includes('Instagram Reels') && (
                <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Instagram profile
                  <input style={inputStyle} value={sourceUrls.instagram} onChange={(event) => setSourceUrl('instagram', event.target.value)} placeholder="instagram.com/yourhandle" />
                </label>
              )}
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Substack publication (optional)
                <input style={inputStyle} value={sourceUrls.substack} onChange={(event) => setSourceUrl('substack', event.target.value)} placeholder="yourpublication.substack.com" />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.15, marginBottom: '12px' }}>
              Building your <br />Creator DNA.
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
               With connected sources, the optional intelligence service can build a profile. Without sources, your settings are saved locally; no media is analyzed.
            </p>

            {isBuildingDNA ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: '20px',
                  padding: '24px 18px',
                  border: '1px solid var(--ai-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                  <span style={{ color: 'var(--ai-accent)' }}>Analyzing connected sources...</span>
                  <span>Working</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#202020', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: '70%',
                      backgroundColor: 'var(--ai-accent)',
                      animation: 'pulse 1s infinite',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: '20px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 700, marginBottom: '8px' }}>
                  <CheckCircle2 size={18} /> Ready to Build Creator DNA
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  {creatorName || 'Add your creator name'} · {selectedNiche} · {selectedPlatforms.join(', ')}
                </p>
              </div>
            )}
            {profileError && (
              <div role="alert" style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '14px' }}>
                {profileError} <button type="button" onClick={saveLocalProfile} style={{ color: 'var(--ai-accent)', textDecoration: 'underline', background: 'none', border: 0, cursor: 'pointer' }}>Continue with local profile (no analysis)</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {step < 3 ? (
          <Button
            variant="ai"
            size="lg"
            fullWidth
            onClick={() => setStep(step + 1)}
            style={{ gap: '8px' }}
          >
            Continue <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            variant="ai"
            size="lg"
            fullWidth
            disabled={isBuildingDNA || !creatorName.trim()}
            onClick={handleFinish}
            style={{ gap: '8px' }}
          >
              {!isBuildingDNA && <Sparkles size={16} aria-hidden="true" />}
              {isBuildingDNA ? 'Building creator profile…' : Object.values(sourceUrls).some((url) => url.trim()) ? 'Analyze sources' : 'Save local profile'}
          </Button>
        )}
        <button
          type="button"
          disabled={isBuildingDNA}
          onClick={handleDemoEntry}
          style={{ display: 'block', width: '100%', marginTop: '12px', padding: '12px', borderRadius: '14px', background: 'var(--bg-surface-2)', border: '1px solid var(--ai-border)', color: 'var(--ai-accent)', fontWeight: 700, cursor: 'pointer' }}
        >
          Enter sample demo workspace
        </button>
        <p style={{ margin: '8px 0 0', fontSize: '11px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Local sample profile, one catalog reference and a text-only blueprint. No accounts connected or media analyzed.
        </p>
        {demoError && <p role="alert" style={{ color: 'var(--danger)', fontSize: '13px' }}>{demoError}</p>}
      </div>
    </div>
  );
};
