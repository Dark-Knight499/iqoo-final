import React from 'react';
import { ArrowLeft, Plus, Play, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { formatDuration } from '@/utils/format';
import { files } from '@/utils/files';
import { MediaArt } from '@/shared/components/MediaArt';

export const ProjectsView: React.FC = () => {
  const { closeModal, openModal, showToast } = useAppStore();
  const { projects, setActiveProjectId, addProject } = useProjectStore();

  const handleNew = async () => {
    try {
      const picked = await files.pickVideo();
      if (!picked) return;
      addProject({ title: picked.name.replace(/\.[^/.]+$/, ''), mediaId: picked.mediaId,
        mediaName: picked.name, durationSeconds: picked.duration, trimEndSeconds: picked.duration,
        aspectRatio: picked.width >= picked.height ? '16:9' : '9:16' });
      URL.revokeObjectURL(picked.url);
      openModal('editor');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to import video');
    }
  };

  const handleOpen = (id: string) => {
    setActiveProjectId(id);
    openModal('editor');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '16px 18px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={closeModal}
          aria-label="Close projects"
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
        <span style={{ fontSize: '15px', fontWeight: 700 }}>All Projects</span>
        <button
          onClick={handleNew}
          aria-label="Create new project"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--ai-accent)',
            color: '#080808',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {projects.map((proj) => (
          <Card
            key={proj.id}
            variant="surface"
            padding="12px"
            onClick={() => handleOpen(proj.id)}
            style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
          >
            <MediaArt mediaId={proj.mediaId} src={proj.thumbnailUrl} kind="project" label={proj.mediaId ? proj.mediaName || proj.title : 'No video attached'}
              style={{ width: 74, height: 74, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {proj.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {formatDuration(proj.durationSeconds)} · {proj.aspectRatio} · {proj.updatedAt}
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </Card>
        ))}
      </div>
    </div>
  );
};
