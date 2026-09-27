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
  Check,
  Zap,
} from 'lucide-react';
import { useMediaIntelligenceStore } from '../state/mediaIntelligenceStore';
import { useAppStore } from '@/shared/state/app.store';
import { projectStore } from '@/shared/state/project.store';
import { MetricCard } from '../components/MetricCard';
import { TranscriptView } from '../components/TranscriptView';
import { EntityChip } from '../components/EntityChip';
import { formatDuration, formatTimestamp } from '../services/staticAnalysisService';
import {
  answer,
  buildSuggestions,
  type Evidence,
  type AssistantReply,
  type Suggestion,
} from '../services/dynamicAssistantService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  reply?: AssistantReply;
}

const QUICK_PROMPTS = [
  'What is the spoken transcript?',
  'Find quiet pauses or dead air to cut',
  'What objects were detected in the video?',
  'Suggest a high-retention 30s cut',
];

export const ContentAnalysisScreen: React.FC = () => {
  const { analysisResult, importedMedia, navigateTo, goBack } = useMediaIntelligenceStore();
  const { openModal, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'signals' | 'chat' | 'suggestions'>('signals');
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
  const evidence: Evidence = useMemo(() => ({
    durationMs: metadata?.durationMs ?? 0,
    features: analysisResult?.features ?? [],
    metadata,
    transcript: artifacts?.transcript,
    silence: artifacts?.silence,
    shots: artifacts?.shots,
    yolo: artifacts?.yolo,
    audio: artifacts?.audio_rms,
  }), [analysisResult, artifacts, metadata]);

  // Generate grounded suggestions from evidence
  const dynamicSuggestions = useMemo(() => {
    return buildSuggestions(evidence);
  }, [evidence]);

  // Initial chat message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const shotCount = shots.length;
    const durStr = formatDuration(metadata?.durationMs);
    const spokenWords = (artifacts?.transcript?.segments ?? []).reduce((sum, s) => sum + s.words.length, 0);
    return [
      {
        id: 'msg-initial',
        sender: 'assistant',
        text: `Analysis complete for ${importedMedia?.title ?? 'your video'}. Measured duration: ${durStr}, ${shotCount} detected visual shots, ${spokenWords} spoken words, and ${silence.length} quiet pauses. Ask me anything about the content or ask for an edit suggestion.`,
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
    const startSec = Math.floor(suggestion.proposal.startMs / 1000);
    const endSec = Math.ceil(suggestion.proposal.endMs / 1000);
    const duration = Math.max(1, endSec - startSec);

    projectStore.addProject({
      title: `${importedMedia?.title ?? 'Video'} — ${suggestion.title}`,
      description: `${suggestion.detail} Grounded on ${suggestion.citations.map((c) => c.label).join(', ')}.`,
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

    setApprovedProposalIds((prev) => [...prev, suggestion.id]);
    showToast(`Approved! Project created with trim [${formatTimestamp(suggestion.proposal.startMs)} – ${formatTimestamp(suggestion.proposal.endMs)}]`);
  };

  return (
    <main
      style={{
        minHeight: '100%',
        padding: '24px 20px calc(40px + env(safe-area-inset-bottom))',
        backgroundColor: '#F7F8FA',
        color: '#0F172A',
      }}
    >
      {/* Top Navigation */}
      <button
        type="button"
        onClick={goBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#64748B',
          fontSize: 13,
          fontWeight: 600,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} /> Back to analysis status
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            background: '#EFF6FF',
            color: '#2563EB',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.6px',
            textTransform: 'uppercase',
          }}
        >
          ML + LLM Analysis
        </span>
        <span style={{ fontSize: 12, color: '#64748B' }}>
          {metadata?.durationMs ? formatDuration(metadata.durationMs) : ''}
        </span>
      </div>

      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
        {importedMedia?.title ?? 'Video Intelligence'}
      </h1>

      {/* Segmented Switch at the Top (from the user's sketch) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: '#E2E8F0',
          borderRadius: 12,
          padding: 3,
          margin: '16px 0 20px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('signals')}
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'signals' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'signals' ? '#0F172A' : '#64748B',
            boxShadow: activeTab === 'signals' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Signals
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'chat' ? '#D8FF00' : 'transparent',
            color: activeTab === 'chat' ? '#080808' : '#64748B',
            boxShadow: activeTab === 'chat' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          AI Chat
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'suggestions' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'suggestions' ? '#0F172A' : '#64748B',
            boxShadow: activeTab === 'suggestions' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Suggestions
        </button>
      </div>

      {/* Tab 1: Signals & Static Analysis */}
      {activeTab === 'signals' && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 22 }}>
            <MetricCard label="Duration" value={formatDuration(metadata?.durationMs)} icon={<Clock3 size={14} />} />
            <MetricCard label="Detected shots" value={shots.length} icon={<Film size={14} />} />
            <MetricCard label="Object labels" value={objectEntries.length} icon={<Box size={14} />} />
            <MetricCard label="Quiet intervals" value={silence.length} icon={<AudioLines size={14} />} />
          </section>

          <section style={{ marginBottom: 20, padding: 16, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Video details</h2>
            <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
              {metadata?.width && metadata.height ? `${metadata.width}×${metadata.height}` : 'Dimensions unavailable'}
              {metadata?.fps ? ` · ${metadata.fps} fps` : ''}
              {metadata?.orientation ? ` · ${metadata.orientation}` : ''}
              {metadata?.videoFormat ? ` · ${metadata.videoFormat}` : ''}
            </p>
          </section>

          <section style={{ marginBottom: 20 }}>
            {transcript.length ? (
              <TranscriptView segments={transcript} />
            ) : (
              <div style={{ padding: 16, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 15 }}>Transcript unavailable</h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>
                  {analysisResult?.features.find((f) => f.feature === 'transcript')?.error ?? 'No transcript was generated.'}
                </p>
              </div>
            )}
          </section>

          <section style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700 }}>
              Detected shots <span style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>({shots.length})</span>
            </h2>
            {shots.length ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {shots.map((shot) => {
                  const keyframe = keyframes.find((frame) => frame.shotId === shot.id);
                  return (
                    <article key={shot.id} style={{ padding: 13, borderRadius: 13, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                      <strong style={{ fontSize: 13 }}>Shot {String(shot.id).padStart(2, '0')}</strong>
                      <span style={{ float: 'right', color: '#2563EB', fontSize: 12, fontWeight: 600 }}>
                        {formatTimestamp(shot.startMs)}–{formatTimestamp(shot.endMs)}
                      </span>
                      <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 12 }}>
                        {keyframe ? `Sharpest sampled frame at ${formatTimestamp(keyframe.timestampMs)}` : 'Keyframe timestamp recorded'}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748B', fontSize: 13 }}>Shot boundaries unavailable.</p>
            )}
          </section>

          <section style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700 }}>Sampled objects</h2>
            {objectEntries.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {objectEntries.map(([name, count]) => (
                  <EntityChip key={name} label={`${name} · ${count}`} variant="object" />
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748B', fontSize: 13 }}>No objects were detected in the sampled frames.</p>
            )}
          </section>

          <section style={{ marginBottom: 20, padding: 16, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Audio diagnostics</h2>
            <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>
              {silence.length} quiet pause(s) detected, {formatDuration(silenceDuration)} total. Background noise is evaluated per-second.
            </p>
          </section>

          <details style={{ marginBottom: 22, padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>8-Module Feature Status</summary>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {analysisResult?.features.map((feature) => (
                <div key={feature.feature} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                  <span>{featureLabels[feature.feature] ?? feature.feature}{feature.error ? ` — ${feature.error}` : ''}</span>
                  <strong style={{ flexShrink: 0, color: feature.status === 'success' ? '#15803D' : '#B45309' }}>
                    {feature.status}
                  </strong>
                </div>
              ))}
            </div>
          </details>

          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: 14,
              background: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>View Suggestions & Approve</span>
            <ArrowRight size={17} />
          </button>
        </>
      )}

      {/* Tab 2: Dynamic Chat (ML + LLM from the user's sketch) */}
      {activeTab === 'chat' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontSize: 12,
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

          {/* Messages Stream */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: '260px',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '12px 0',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? '#2563EB' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {/* Grounded Citations if returned */}
                {msg.reply?.citations && msg.reply.citations.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {msg.reply.citations.map((c, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 6,
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          fontWeight: 600,
                        }}
                      >
                        ⏱ {formatTimestamp(c.startMs)} · {c.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actionable Trim Proposal if returned */}
                {msg.reply?.proposal && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #CBD5E1' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      ✂ Proposed Trim: {formatTimestamp(msg.reply.proposal.startMs)} – {formatTimestamp(msg.reply.proposal.endMs)}
                    </div>
                    <button
                      onClick={() => {
                        const proposal = msg.reply!.proposal!;
                        projectStore.addProject({
                          title: `Cut: ${importedMedia?.title ?? 'Video'}`,
                          description: proposal.reason,
                          thumbnailUrl: importedMedia?.thumbnail ?? '',
                          mediaName: importedMedia?.title ?? 'video.mp4',
                          trimStartSeconds: Math.floor(proposal.startMs / 1000),
                          trimEndSeconds: Math.ceil(proposal.endMs / 1000),
                          durationSeconds: Math.ceil((proposal.endMs - proposal.startMs) / 1000),
                          aspectRatio: metadata?.orientation === 'portrait' ? '9:16' : '16:9',
                          clips: [],
                        });
                        showToast(`Trim approved and added to Projects!`);
                        openModal('editor');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Check size={14} /> Approve & Open Editor
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 16,
              padding: '6px 8px 6px 14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about the video content or edits..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0F172A',
                backgroundColor: 'transparent',
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: chatInput.trim() ? '#2563EB' : '#E2E8F0',
                color: chatInput.trim() ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'default',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      {/* Tab 3: Actionable Suggestions with Approve Button (Screen 4 from the user's sketch) */}
      {activeTab === 'suggestions' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Video Preview at Top */}
          {importedMedia?.previewUrl && (
            <div style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: '#020617', border: '1px solid #E2E8F0' }}>
              <video
                src={importedMedia.previewUrl}
                controls
                playsInline
                preload="metadata"
                style={{ width: '100%', maxHeight: '220px', display: 'block', objectFit: 'contain' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
              Grounded Suggestions <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>({dynamicSuggestions.length})</span>
            </h2>
            <span style={{ fontSize: 11, color: '#64748B' }}>Tap Approve to save to Studio</span>
          </div>

          {/* Suggestions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dynamicSuggestions.map((sug) => {
              const isApproved = approvedProposalIds.includes(sug.id);
              return (
                <article
                  key={sug.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    border: isApproved ? '2px solid #16A34A' : '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: sug.kind === 'trim' ? '#EFF6FF' : '#FEF3C7',
                        color: sug.kind === 'trim' ? '#1D4ED8' : '#B45309',
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '.4px',
                      }}
                    >
                      {sug.kind === 'trim' ? 'TRIM CANDIDATE' : 'CONTENT SIGNAL'}
                    </span>

                    {sug.proposal && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
                        {formatTimestamp(sug.proposal.startMs)} – {formatTimestamp(sug.proposal.endMs)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                      {sug.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                      {sug.detail}
                    </p>
                  </div>

                  {/* Citations */}
                  {sug.citations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                      {sug.citations.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            padding: '2px 7px',
                            borderRadius: 6,
                            backgroundColor: '#F1F5F9',
                            color: '#64748B',
                          }}
                        >
                          ⏱ {formatTimestamp(c.startMs)} · {c.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Approve Action Button (from user's sketch) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    {isApproved ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16A34A', fontSize: 13, fontWeight: 700 }}>
                        <CheckCircle2 size={16} />
                        <span>Approved & Saved</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApproveProposal(sug)}
                        disabled={!sug.proposal}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: sug.proposal ? 'pointer' : 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>Approve</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => openModal('editor')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Open Editor
                      </button>
                    )}
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

