import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, CheckCircle2, ArrowRight, Bot, User, RefreshCw } from 'lucide-react';
import { CopilotMessage, GeneratedContent } from '../types/creatorIntelligence';
import { DraftPreview } from './DraftPreview';

interface CopilotViewProps {
  messages: CopilotMessage[];
  draft: GeneratedContent | null;
  loading: boolean;
  onSendMessage: (text: string) => void;
  onViewFinal: () => void;
}

const QUICK_COMMANDS = [
  'Make it more controversial',
  'Make the hook shorter',
  'Use my usual style',
  'Make it more cinematic',
  'Add a stronger CTA',
  'Turn this into a 30 second Reel',
  'Make the second scene more visual',
];

export const CopilotView: React.FC<CopilotViewProps> = ({
  messages,
  draft,
  loading,
  onSendMessage,
  onViewFinal,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find recent changes if any
  const latestAiMessageWithChanges = [...messages].reverse().find((m) => m.role === 'ai' && m.changes && m.changes.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Banner & Activity alert */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#161616',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(216, 255, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ai-accent, #D8FF00)',
            }}
          >
            <Bot size={16} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
              AI Copilot
            </h4>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Let's build this together.
            </span>
          </div>
        </div>

        <button
          onClick={onViewFinal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>View Final Plan</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main chat & preview container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Live Draft Preview Box */}
        <DraftPreview draft={draft} loading={loading && !draft} />

        {/* Change Indicator Pill if AI made changes */}
        {latestAiMessageWithChanges?.changes && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 220, 130, 0.1)',
              border: '1px solid rgba(0, 220, 130, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} color="#00DC82" />
            <div style={{ flex: 1, fontSize: '12px' }}>
              <span style={{ fontWeight: 700, color: '#00DC82', textTransform: 'uppercase', marginRight: '6px' }}>
                AI UPDATED
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                {latestAiMessageWithChanges.changes.map((c) => `✓ ${c.field}`).join('  ')}
              </span>
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: isUser ? 'rgba(216, 255, 0, 0.15)' : '#181818',
                    border: isUser
                      ? '1px solid rgba(216, 255, 0, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isUser ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: 0 }}>{m.text}</p>

                  {/* If this message contains changes, display formatted CHANGE MADE diff block */}
                  {m.changes && m.changes.length > 0 && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#0F0F0F',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: 'var(--ai-accent, #D8FF00)',
                          marginBottom: '8px',
                        }}
                      >
                        CHANGE MADE
                      </div>
                      {m.changes.map((ch, idx) => (
                        <div key={idx} style={{ marginBottom: idx < m.changes!.length - 1 ? '8px' : 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
                            {ch.field}:
                          </span>
                          <div style={{ fontSize: '11px', color: '#FF6B6B', margin: '2px 0' }}>
                            Before: "{ch.before}"
                          </div>
                          <div style={{ fontSize: '11px', color: '#00DC82' }}>
                            After: "{ch.after}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', padding: '8px 12px' }}>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid rgba(216, 255, 0, 0.3)',
                  borderTopColor: 'var(--ai-accent, #D8FF00)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span>Refining draft state...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Commands */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#121212',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: '8px',
        }}
      >
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => onSendMessage(cmd)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#161616',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Copilot (e.g. 'Make it more controversial', 'Make hook shorter')..."
          style={{
            flex: 1,
            backgroundColor: '#202020',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#FFFFFF',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: inputText.trim() && !loading ? 'var(--ai-accent, #D8FF00)' : 'rgba(255, 255, 255, 0.1)',
            color: inputText.trim() && !loading ? '#000000' : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
