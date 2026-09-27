import React from 'react';
import { ArrowLeft, Plus, Video } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useMediaStore } from '@/shared/state/media.store';
import { files } from '@/utils/files';
import { Card } from '@/shared/components/Card';
import { MediaArt } from '@/shared/components/MediaArt';
import { useProjectStore } from '@/shared/state/project.store';

export const AssetsView: React.FC = () => {
  const { closeModal, showToast } = useAppStore();
  const { assets, addAsset } = useMediaStore();
  const { projects } = useProjectStore();
  const projectVideos = projects.filter(project => project.mediaId);

  const handleImport = async () => {
    try {
      const picked = await files.pickVideo();
      if (!picked) return;
      addAsset({
        name: picked.name,
        type: 'video', url: '', mediaId: picked.mediaId,
      });
      URL.revokeObjectURL(picked.url);
      showToast(`Imported ${picked.name}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not import video');
    }
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
          aria-label="Close media library"
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
        <span style={{ fontSize: '15px', fontWeight: 700 }}>Media & B-Roll Library</span>
        <button
          onClick={handleImport}
          aria-label="Import media"
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[...projectVideos.map(project => ({ id: `project-${project.id}`, name: project.mediaName || project.title, type: 'video' as const, url: '', mediaId: project.mediaId, createdAt: 'Project source' })), ...assets].map((asset) => (
          <Card key={asset.id} variant="surface" padding="10px">
            <div style={{ height: 110, borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 8 }}>
              <MediaArt mediaId={asset.mediaId} src={asset.url} label={asset.name} kind={asset.type} style={{ width: '100%', height: '100%' }} />
              <span
                style={{
                  position: 'absolute', top: 6, right: 6,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  fontSize: '10px',
                  color: '#fff',
                }}
              >
                {asset.type}
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {asset.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{asset.createdAt}</div>
          </Card>
        ))}
        {!assets.length && !projectVideos.length && <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', background: 'var(--bg-surface-2)', borderRadius: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          <Video size={22} aria-hidden="true" style={{ marginBottom: 8 }} /><div>No media imported yet. Add your own playable video to see its frame here.</div>
        </div>}
      </div>
    </div>
  );
};
