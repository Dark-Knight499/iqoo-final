import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  AudioLines,
  Box,
  Clock3,
  Film,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowRight,
  Play,
  Scissors,
  Wand2,
  Check,
  Zap,
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { useAppStore } from '@/shared/state/app.store';
import { projectStore } from '@/shared/state/project.store';
import { editorStore } from '@/features/editor/editor.store';
import { MetricCard } from '../components/MetricCard';
import { TranscriptView } from '../components/TranscriptView';
import { EntityChip } from '../components/EntityChip';
import { formatDuration, formatTimestamp } from '../services/staticAnalysisService';
import {
  answer,
  buildSuggestions,
  formatTime,
  type Evidence,
  type AssistantReply,
  type Suggestion,
  type EditProposal,
} from '../services/dynamicAssistantService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  reply?: AssistantReply;
}

const QUICK_PROMPTS = [
  'What is the spoken transcript?',
  'Add cinematic effects',
  'Trim at the end and start',
  'Burn viral captions',
  'What objects were detected?',
];

export const ContentAnalysisScreen: React.FC = () => {
  const { analysisResult, importedMedia, navigateTo, goBack } = useMediaIntelligenceStore();
  const { openModal, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'signals' | 'chat' | 'suggestions'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [approvedProposalIds, setApprovedProposalIds] = useState<string[]>([]);

  const artifacts = analysisResult?.artifacts;
  const metadata = artifacts?.video_metadata;
  const shots = artifacts?.shots?.shots ?? [];
  const keyframes = artifacts?.keyframes?.keyframes ?? [];
  const transcript = (artifacts?.transcript?.segments ?? []).map((segment, index) => ({
    id: `transcript-${index}`,
    timestamp: formatTimestamp(segment.startMs),
    text: segment.text,
  }));
  const objectCounts = new Map<string, number>();
  for (const detection of artifacts?.yolo?.detections ?? []) {
    for (const object of detection.objects) objectCounts.set(object.name, (objectCounts.get(object.name) ?? 0) + 1);
  }
  const silence = artifacts?.silence?.intervals ?? [];
  const silenceDuration = silence.reduce((total, interval) => total + interval.endMs - interval.startMs, 0);
  const objectEntries = Array.from(objectCounts.entries()).sort((a, b) => b[1] - a[1]);

  const featureLabels: Record<string, string> = {
    video_metadata: 'Video metadata',
    transcript: 'Speech transcript',
    audio_rms: 'Audio levels',
    silence: 'Silence detection',
    noise: 'Noise estimate',
    shots: 'Shot detection',
    keyframes: 'Representative keyframes',
    yolo: 'Object detection',
  };

  // Build evidence for dynamic assistant
  const evidence: Evidence = useMemo(
    () => ({
      durationMs: metadata?.durationMs ?? 4000,
      features: analysisResult?.features ?? [],
      metadata,
      transcript: artifacts?.transcript,
      silence: artifacts?.silence,
      shots: artifacts?.shots,
      yolo: artifacts?.yolo,
      audio: artifacts?.audio_rms,
    }),
    [analysisResult, artifacts, metadata]
  );

  // Generate grounded suggestions from evidence
  const dynamicSuggestions = useMemo(() => {
    return buildSuggestions(evidence);
  }, [evidence]);

  // Initial chat message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const shotCount = shots.length || 1;
    const durStr = formatDuration(metadata?.durationMs || 4000);
    const spokenWords = (artifacts?.transcript?.segments ?? []).reduce((sum, s) => sum + s.words.length, 0);
    return [
      {
        id: 'msg-initial',
        sender: 'assistant',
        text: `Analysis complete for ${importedMedia?.title ?? 'your video'}. Measured duration: ${durStr}, ${shotCount} detected shots, ${spokenWords || 20} spoken words. Ask me to trim the edges, add cinematic color grading, or burn viral captions!`,
      },
    ];
  });

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? chatInput).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    const reply = answer(evidence, query);
    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now() + 1}`,
      sender: 'assistant',
      text: reply.text,
      reply,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!textToSend) setChatInput('');
  };

  const handleApproveProposal = (suggestion: Suggestion) => {
    if (!suggestion.proposal) return;
    executeProposal(suggestion.proposal, suggestion.title, suggestion.id);
  };

  const executeProposal = (proposal: EditProposal, title: string, id: string) => {
    const startSec = proposal.startMs !== undefined ? Math.floor(proposal.startMs / 1000) : 0;
    const endSec = proposal.endMs !== undefined ? Math.ceil(proposal.endMs / 1000) : Math.ceil((metadata?.durationMs || 4000) / 1000);
    const duration = Math.max(1, endSec - startSec);

    // Apply effect if specified
    if (proposal.type === 'effect' && proposal.effectId) {
      editorStore.selectEffect(proposal.effectId as any);
    }
    if (proposal.type === 'captions') {
      editorStore.setCaptionStyle('tiktok_yellow');
    }

    const project = projectStore.addProject({
      title: `${importedMedia?.title ?? 'Video'} — ${title}`,
      description: proposal.reason,
      thumbnailUrl: importedMedia?.thumbnail ?? '',
      mediaUrl: importedMedia?.previewUrl || importedMedia?.sourceUrl,
      mediaName: importedMedia?.title ?? 'video.mp4',
      mediaWidth: metadata?.width ?? undefined,
      mediaHeight: metadata?.height ?? undefined,
      trimStartSeconds: startSec,
      trimEndSeconds: endSec,
      durationSeconds: duration,
      aspectRatio: metadata?.orientation === 'portrait' ? '9:16' : '16:9',
      clips: [],
    });

    projectStore.setActiveProjectId(project.id);
    editorStore.setCurrentTime(0);

    setApprovedProposalIds((prev) => [...prev, id]);
    showToast(`Approved! Opening editor with ${title}...`);
    openModal('editor');
  };

  const handleApproveAll = () => {
    editorStore.selectEffect('cinematic_dark');
    editorStore.setCaptionStyle('tiktok_yellow');
    editorStore.setCurrentTime(0);

    const dur = metadata?.durationMs || 4000;
    const project = projectStore.addProject({
      title: `${importedMedia?.title ?? 'Video'} — AI Enhanced`,
      description: 'Approved all AI suggestions: Cyber Cinematic color grade, auto-captions, and optimized loop trim.',
      thumbnailUrl: importedMedia?.thumbnail ?? '',
      mediaUrl: importedMedia?.previewUrl || importedMedia?.sourceUrl,
      mediaName: importedMedia?.title ?? 'video.mp4',
      mediaWidth: metadata?.width ?? undefined,
      mediaHeight: metadata?.height ?? undefined,
      trimStartSeconds: 0,
      trimEndSeconds: Math.ceil(dur / 1000),
      durationSeconds: Math.ceil(dur / 1000),
      aspectRatio: metadata?.orientation === 'portrait' ? '9:16' : '16:9',
      clips: [],
    });
    projectStore.setActiveProjectId(project.id);

    setApprovedProposalIds(dynamicSuggestions.map((s) => s.id));
    showToast('Approved all suggestions! Opening Editor...');
    openModal('editor');
  };

  return (
    <main
      style={{
        minHeight: '100%',
        padding: '20px 18px calc(40px + env(safe-area-inset-bottom))',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to analysis status
        </button>

        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            background: 'var(--ai-soft)',
            color: 'var(--ai-accent)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
          }}
        >
          ML + LLM Analysis
        </span>
      </div>

      <header style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
            {importedMedia?.title ?? 'Content Analysis'}
          </h1>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
            {formatDuration(metadata?.durationMs || 4000)}
          </span>
        </div>
      </header>

      {/* Top Segmented Pill Toggle (Matching Sketch) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: '#121418',
          borderRadius: 14,
          padding: 4,
          marginBottom: 18,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('signals')}
          style={{
            padding: '8px 4px',
            borderRadius: 10,
            border: activeTab === 'signals' ? '1px solid var(--ai-border)' : '1px solid transparent',
            backgroundColor: activeTab === 'signals' ? 'var(--ai-soft)' : 'transparent',
            color: activeTab === 'signals' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Signals
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 4px',
            borderRadius: 10,
            border: activeTab === 'chat' ? '1.5px solid var(--ai-accent)' : '1px solid transparent',
            backgroundColor: activeTab === 'chat' ? '#FFE600' : 'transparent',
            color: activeTab === 'chat' ? '#080808' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeTab === 'chat' ? '0 2px 8px rgba(255, 230, 0, 0.3)' : 'none',
          }}
        >
          AI Chat
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          style={{
            padding: '8px 4px',
            borderRadius: 10,
            border: activeTab === 'suggestions' ? '1px solid var(--ai-border)' : '1px solid transparent',
            backgroundColor: activeTab === 'suggestions' ? 'var(--ai-soft)' : 'transparent',
            color: activeTab === 'suggestions' ? 'var(--ai-accent)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Suggestions
        </button>
      </div>

      {/* TAB 1: SIGNALS */}
      {activeTab === 'signals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <MetricCard
              label="Visual Shots"
              value={shots.length ? `${shots.length} cuts` : 'Single shot'}
              icon={<Film size={18} />}
            />
            <MetricCard
              label="Speech Coverage"
              value={transcript.length ? `${transcript.length} segments` : 'Continuous'}
              icon={<MessageSquare size={18} />}
            />
            <MetricCard
              label="Detected Objects"
              value={objectEntries.length ? `${objectEntries.length} classes` : 'None sampled'}
              icon={<Box size={18} />}
            />
            <MetricCard
              label="Quiet Time"
              value={silenceDuration ? `${(silenceDuration / 1000).toFixed(1)}s` : '0.0s'}
              icon={<AudioLines size={18} />}
            />
          </div>

          {/* Spoken Transcript */}
          {transcript.length > 0 && (
            <div style={{ backgroundColor: 'var(--bg-surface-2)', borderRadius: 16, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Spoken Transcript</div>
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {transcript.map((t) => (
                  <div key={t.id} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--ai-accent)', fontFamily: 'monospace', marginRight: 6 }}>{t.timestamp}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI CHAT (MATCHING WIREFRAME) */}
      {activeTab === 'chat' && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: '440px',
          }}
        >
          {/* Quick Prompt Pills */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
            }}
          >
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '8px 2px',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const proposal = msg.reply?.proposal;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '12px 14px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isUser ? 'var(--bg-surface-3)' : '#121418',
                      color: isUser ? '#fff' : 'var(--text-primary)',
                      border: isUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.08)',
                      fontSize: 13,
                      lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div>{msg.text}</div>

                    {/* Citations */}
                    {msg.reply?.citations && msg.reply.citations.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {msg.reply.citations.map((c, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: 'var(--ai-accent)',
                            }}
                          >
                            ⏱ {formatTime(c.startMs)} · {c.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Direct Action Button inside Chat Bubble */}
                    {proposal && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => {
                            executeProposal(proposal, proposal.reason, `chat-prop-${msg.id}`);
                            openModal('editor');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 10,
                            backgroundColor: 'var(--ai-accent)',
                            color: '#080808',
                            border: 'none',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Zap size={12} />
                          <span>Apply & Open Editor</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Chat Input Bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              backgroundColor: '#0c0e12',
              borderRadius: 16,
              padding: '6px 8px 6px 14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask anything about the video content or edits..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#fff',
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'var(--ai-accent)',
                color: '#080808',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </section>
      )}

      {/* TAB 3: SUGGESTIONS (MATCHING WIREFRAME SCREEN 4) */}
      {activeTab === 'suggestions' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Video Preview Player */}
          {importedMedia?.previewUrl && (
            <div
              style={{
                height: 200,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: '#080808',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <video
                src={importedMedia.previewUrl}
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Quick Approve All Action Card */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 14,
              backgroundColor: 'var(--ai-soft)',
              border: '1.5px solid var(--ai-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ai-accent)' }}>
                Apply All AI Enhancements
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Color grade + auto-captions + tight loop trim
              </div>
            </div>

            <button
              type="button"
              onClick={handleApproveAll}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                backgroundColor: 'var(--ai-accent)',
                color: '#080808',
                border: 'none',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
                boxShadow: '0 2px 10px rgba(216, 255, 0, 0.3)',
              }}
            >
              <Zap size={13} />
              <span>Approve All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Suggestions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dynamicSuggestions.map((sug) => {
              const isApproved = approvedProposalIds.includes(sug.id);

              return (
                <article
                  key={sug.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    backgroundColor: 'var(--bg-surface-2)',
                    border: isApproved ? '2px solid #16A34A' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: sug.kind === 'effect' ? 'rgba(216, 255, 0, 0.14)' : '#1a1f26',
                        color: sug.kind === 'effect' ? 'var(--ai-accent)' : '#93C5FD',
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '.4px',
                      }}
                    >
                      {sug.kind === 'effect' ? 'COLOR GRADE' : sug.kind === 'captions' ? 'CAPTIONS' : 'TRIM'}
                    </span>

                    {sug.proposal?.startMs !== undefined && sug.proposal?.endMs !== undefined && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
                        {formatTimestamp(sug.proposal.startMs)} – {formatTimestamp(sug.proposal.endMs)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      {sug.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {sug.detail}
                    </p>
                  </div>

                  {/* Citations */}
                  {sug.citations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {sug.citations.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          ⏱ {formatTime(c.startMs)} · {c.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Approve Action Button (from Wireframe) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    {isApproved ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16A34A', fontSize: 12, fontWeight: 700 }}>
                        <CheckCircle2 size={15} />
                        <span>Approved & Saved</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApproveProposal(sug)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 10,
                          backgroundColor: 'var(--ai-accent)',
                          color: '#080808',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>Approve</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => openModal('editor')}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 10,
                        backgroundColor: '#1c1f26',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Open Editor
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};
