import React from 'react';
import { ArrowRight, Film, Lightbulb, Gamepad2, Wand2, ArrowLeft, Brain, Sparkles, Flame } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { files } from '@/utils/files';

export const CreateView: React.FC = () => {
  const { setActiveTab, openModal, showToast } = useAppStore();
  const { addProject } = useProjectStore();

  const handleEditVideo = async () => {
    try {
      const picked = await files.pickVideo();
      if (!picked) return;
      addProject({
        title: picked.name.replace(/\.[^/.]+$/, ''),
        thumbnailUrl: '',
        mediaUrl: picked.url,
        mediaId: picked.mediaId,
        mediaName: picked.name,
        mediaMimeType: picked.type,
        mediaSizeBytes: picked.size,
        mediaWidth: picked.width,
        mediaHeight: picked.height,
        durationSeconds: picked.duration,
        trimStartSeconds: 0,
        trimEndSeconds: picked.duration,
        aspectRatio: picked.width >= picked.height ? '16:9' : '9:16',
        clips: picked.duration > 0 ? [{
          id: `clip_${Date.now()}`,
          mediaUrl: picked.url,
          title: picked.name,
          start: 0,
          duration: picked.duration,
          cutIn: 0,
          cutOut: picked.duration,
          speed: 1,
          volume: 1,
        }] : [],
      });
      openModal('video-analysis');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to import video');
    }
  };

  const creationCards = [
    {
      id: 'media-intel',
      title: 'Media Intelligence',
      description: 'Explore labeled sample analysis or request backend text clip suggestions from a URL.',
      badge: 'Sample + optional API',
      badgeIcon: Brain,
      action: () => openModal('media-intelligence'),
    },
    {
      id: 'edit',
      title: 'Edit a Video',
      description: 'Import real footage, review a trim and export a playable video.',
      badge: 'Quick Edit',
      badgeIcon: Film,
      action: handleEditVideo,
    },
    {
      id: 'idea',
      title: 'Create from an Idea',
      description: 'Take an idea through Copilot, outline, teleprompter, recording and editing.',
      badge: 'End-to-End',
      badgeIcon: Lightbulb,
      action: () => openModal('script'),
    },
    {
      id: 'brainrot',
      title: 'Brainrot Feed',
      description: 'Type a topic and render a vertical short with voiceover and burned-in captions.',
      badge: 'Local Engine',
      badgeIcon: Flame,
      action: () => openModal('brainrot'),
    },
    {
      id: 'game',
      title: 'Game Studio',
      description: 'Create camera and MediaPipe-powered interactive reaction experiences.',
      badge: 'Interactive AI',
      badgeIcon: Gamepad2,
      action: () => openModal('game-studio'),
    },
    {
      id: 'effects',
      title: 'Effects Studio',
      description: 'Discover cinematic camera color grades, visual effects, and overlays.',
      badge: 'Visual FX',
      badgeIcon: Wand2,
      action: () => openModal('effects'),
    },
  ];

  return (
    <main className="screen-container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('home')}
          aria-label="Go to home"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            Studio Hub
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            What are you making?
          </h1>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
        Start from existing footage, an unrefined idea, or a live interactive camera format.
      </p>

      {/* Creation Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {creationCards.map((card) => (
          <article
            key={card.id}
            onClick={card.action}
            style={{
              minHeight: '120px',
              borderRadius: '20px',
              overflow: 'hidden',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.18s ease, border-color 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--bg-surface-3)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '5px',
                }}
              >
                <card.badgeIcon size={12} aria-hidden="true" /> {card.badge}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, maxWidth: '280px' }}>
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};
