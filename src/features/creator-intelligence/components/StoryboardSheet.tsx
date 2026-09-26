import React from 'react';
import { X, Trash2, Sparkles, Layers, ArrowRight, Play } from 'lucide-react';
import { StoryboardItem, ContentItem } from '../types/creatorIntelligence';
import { mockVideos, mockReels } from '../data/mockContent';

interface StoryboardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: StoryboardItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOpenGenerate: () => void;
  onSelectItem: (contentId: string) => void;
}

export const StoryboardSheet: React.FC<StoryboardSheetProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onOpenGenerate,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  const allContent: ContentItem[] = [...mockVideos, ...mockReels];
  const getContent = (id: string) => allContent.find((c) => c.id === id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: '#111111',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--ai-accent, #D8FF00)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                Storyboard ({items.length})
              </h3>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
              References for your next piece
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List of references */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Layers size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
                Your storyboard is empty
              </p>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5 }}>
                Tap "+ Storyboard" on any video or reel to build reference material for AI script generation.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((it, idx) => {
                const content = getContent(it.contentId);
                return (
                  <div
                    key={it.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: '#181818',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: '16px',
                        textAlign: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>

                    {/* Thumbnail preview */}
                    <div
                      onClick={() => onSelectItem(it.contentId)}
                      style={{
                        width: '56px',
                        height: '42px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#2A2A2A',
                        flexShrink: 0,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={content?.thumbnail || '/assets/trend-on-device-ai.jpg'}
                        alt={content?.title || 'Ref'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div
                      onClick={() => onSelectItem(it.contentId)}
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    >
                      <h5
                        style={{
                          margin: '0 0 3px 0',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {content?.title || 'Selected Reference'}
                      </h5>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {content?.creatorName || 'Creator'} • {content?.views || '1M'} views
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(it.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove from storyboard"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Generate Content CTA */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#141414',
          }}
        >
          {items.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              Add references to your storyboard to generate content.
            </p>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenGenerate();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--ai-accent, #D8FF00)',
                color: '#000000',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(216, 255, 0, 0.25)',
              }}
            >
              <Sparkles size={16} />
              <span>Generate Content ({items.length} Ref{items.length > 1 ? 's' : ''})</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
