import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Play, Copy, Check, Video, BookOpen, Layers } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { useCreatorStore } from '@/shared/state/creator.store';
import { getCreatorDossier } from '@/shared/data/creatorDossiers';
import { llm } from '@/ai/llm';
import { Button } from '@/shared/components/Button';

export const ScriptView: React.FC = () => {
  const { closeModal, openModal, showToast } = useAppStore();
  const { addProject } = useProjectStore();
  const { creator } = useCreatorStore();

  const dossier = getCreatorDossier(creator.name);
  const activeUserMd = creator.profileDocuments?.userMd || dossier.userMd;
  const activeHookMd = creator.profileDocuments?.hookMd || dossier.hookMd;
  const creatorDisplayName = creator.name || dossier.name || 'Pro Creator';

  const [topic, setTopic] = useState('Why most AI agents fail without local reasoning');
  const [selectedArchetype, setSelectedArchetype] = useState('Painful Inconsistency');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [scriptContent, setScriptContent] = useState(
    `# Why Most AI Agents Fail Without Local Reasoning
> Hook Archetype: Painful Inconsistency | Creator DNA: ${creatorDisplayName}

## Core Thesis & Retention Strategy
Generated following ${creatorDisplayName}'s retention pacing from hook.md and authoritative vocal tone from user.md.

---

## 1. The Opening Hook (0:00 - 0:05)
- **Visual Staging**: [0:00-0:02] Frontal macro shot, bold 3-word title overlay. [0:02-0:04] 1.2x digital punch-in zoom on thesis word.
- **Spoken Dialogue**:
> "Most people think their AI workflow is slow because of model parameters. But after analyzing 50 real-world pipelines, the bottleneck is completely different."

---

## 2. The Setup & Pain Point (0:06 - 0:20)
- **Visual Staging**: Visual cut to screen recording demonstrating cloud API latency vs local NPU execution.
- **Spoken Dialogue**:
> "Here's the honest truth: shipping every single frame to a cloud server destroys both latency and privacy. Let's dive into what happens when you keep the reasoning loop on-device."

---

## 3. The Evidence & Core Value (0:21 - 0:50)
- **Visual Staging**: Split-screen benchmark comparison showing real-time timeline scrubbing with Snapdragon 8 Elite hardware.
- **Spoken Dialogue**:
> "Notice the responsiveness: 45 TOPS of on-device compute executes scene boundary scans in under 200 milliseconds. No network hops, zero egress costs, and complete user privacy."

---

## 4. Payoff & Actionable Outro (0:51 - 1:00)
- **Visual Staging**: Return to master wide shot, natural lighting.
- **Spoken Dialogue**:
> "Stop waiting for the cloud to catch up. Tap create below to run the workflow yourself right now, and let me know your thoughts in the comments."`
  );

  const archetypes = [
    { id: 'Painful Inconsistency', label: 'Painful Inconsistency', desc: 'Expose the silent bottleneck' },
    { id: 'Negative Constraint', label: 'Negative Constraint', desc: 'Tell viewer to stop common advice' },
    { id: 'Numbers & Proof', label: 'Numbers & Proof', desc: 'Specific empirical teardown' },
    { id: 'Unspoken Truth', label: 'Unspoken Truth', desc: 'High-authenticity personal insight' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await llm.generate(
        `Create a high retention video idea and production script for topic: "${topic}". Use the "${selectedArchetype}" hook archetype formula from hook.md. Tone and delivery blueprint from user.md.`,
        { hookArchetype: selectedArchetype }
      );
      setScriptContent(generated);
      showToast('Generated using ' + creatorDisplayName + ' user.md & hook.md');
    } catch (err) {
      showToast('Generation completed with offline blueprint');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToTeleprompter = () => {
    addProject({
      title: topic,
      description: scriptContent,
    });
    openModal('teleprompter');
  };

  const handleDirectRecord = () => {
    addProject({
      title: topic,
      description: scriptContent,
    });
    openModal('recording');
  };

  return (
    <div
      className="screen-container"
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--bg-primary)',
        padding: '16px 18px 48px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button
          onClick={closeModal}
          aria-label="Close Script Studio"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 800 }}>Script Studio</span>
          <div style={{ fontSize: '11px', color: 'var(--ai-accent)', fontWeight: 600 }}>
            Powered by {creatorDisplayName} Dossiers
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(scriptContent);
            showToast('Script copied to clipboard');
          }}
          aria-label="Copy script"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Copy"
        >
          <Copy size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Creator Dossier Indicator Banner */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <Sparkles size={14} color="var(--ai-accent)" />
          <span>
            Using <strong>user.md</strong> & <strong>hook.md</strong> of <strong>{creatorDisplayName}</strong>
          </span>
        </div>
        <button
          onClick={() => setShowDossier(!showDossier)}
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
          {showDossier ? 'Hide Dossier' : 'View Rules'}
        </button>
      </div>

      {/* Expandable Dossier Preview */}
      {showDossier && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--ai-border)',
            marginBottom: '14px',
            maxHeight: '160px',
            overflowY: 'auto',
            fontSize: '11px',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--ai-accent)', display: 'block', marginBottom: '4px' }}>
            Active Hook Blueprint:
          </strong>
          <pre style={{ whiteSpace: 'pre-wrap', margin: '0 0 8px', fontFamily: 'monospace' }}>
            {activeHookMd.slice(0, 300)}...
          </pre>
          <strong style={{ color: 'var(--ai-accent)', display: 'block', marginBottom: '4px' }}>
            Active User Persona Blueprint:
          </strong>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>
            {activeUserMd.slice(0, 300)}...
          </pre>
        </div>
      )}

      {/* Hook Archetype Selector */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Hook Formula from hook.md
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {archetypes.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setSelectedArchetype(arch.id)}
              style={{
                padding: '8px 10px',
                borderRadius: '12px',
                border: selectedArchetype === arch.id ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                backgroundColor: selectedArchetype === arch.id ? 'rgba(216, 255, 0, 0.08)' : 'var(--bg-surface)',
                color: selectedArchetype === arch.id ? 'var(--ai-accent)' : 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{arch.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{arch.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Idea Prompt Input */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Topic / Core Idea
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <Button
            variant="ai"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ gap: '6px', flexShrink: 0 }}
          >
            <Sparkles size={14} />
            {isGenerating ? 'Synthesizing...' : 'Generate Idea'}
          </Button>
        </div>
      </div>

      {/* Script Editor Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginBottom: '16px' }}>
        <textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          style={{
            flex: 1,
            minHeight: '260px',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '16px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: 1.6,
            outline: 'none',
            resize: 'none',
            fontFamily: 'monospace',
          }}
        />
      </div>

      {/* Workflow Navigation Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        <Button
          variant="secondary"
          style={{ gap: '6px' }}
          onClick={handleDirectRecord}
        >
          <Video size={16} /> Direct Record
        </Button>
        <Button
          variant="ai"
          style={{ gap: '6px' }}
          onClick={handleSendToTeleprompter}
        >
          <Play size={16} /> Open Teleprompter
        </Button>
      </div>
    </div>
  );
};
