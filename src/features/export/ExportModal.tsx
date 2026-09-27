import React, { useEffect, useState } from 'react';
import { X, Share2, Download, Check, Sparkles, Film } from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { useProjectStore } from '@/shared/state/project.store';
import { renderProject, shareVideo } from '@/utils/export';
import { Button } from '@/shared/components/Button';

export const ExportModal: React.FC = () => {
  const { closeModal, showToast } = useAppStore();
  const { activeProject, updateActiveProject } = useProjectStore();

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderedFile, setRenderedFile] = useState<File | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => () => { if (renderedUrl) URL.revokeObjectURL(renderedUrl); }, [renderedUrl]);

  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderError(null);
    try {
      if (!activeProject) throw new Error('Select a project to export.');
      const file = await renderProject(activeProject, setRenderProgress);
      setRenderedFile(file);
      setRenderedUrl(URL.createObjectURL(file));
      updateActiveProject({ lastExport: { name: file.name, exportedAt: new Date().toISOString() } });
      showToast('Video ready to download');
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : 'Export failed.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleShare = async () => {
    if (renderedFile && !(await shareVideo(renderedFile))) showToast('File sharing is unavailable on this device. Download instead.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRendering) closeModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#151515',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '24px 20px 32px',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} color="var(--ai-accent)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Export & Share</h3>
          </div>
          {!isRendering && (
            <button
              onClick={closeModal}
              aria-label="Close export dialog"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-3)',
                color: 'var(--text-secondary)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {renderedUrl ? (
          <div>
            <div
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid var(--ai-border)',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ai-soft)',
                  color: 'var(--ai-accent)',
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Check size={24} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                Export Complete
              </h4>
               <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  {renderedFile?.name} ({((renderedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB)
               </p>
               {renderedFile?.name.endsWith('.webm') && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 0 }}>
                 Browser-recorded WebM: some players may show an unknown duration even though playback works. Check the downloaded file before publishing.
               </p>}
            </div>

            <video src={renderedUrl} controls playsInline style={{ width: '100%', maxHeight: 220, background: '#080808', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant="secondary"
                style={{ flex: 1, gap: '6px' }}
                onClick={() => {
                  if (!renderedUrl || !renderedFile) return;
                  const link = document.createElement('a');
                  link.href = renderedUrl;
                  link.download = renderedFile.name;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  showToast('Download started');
                }}
              >
                <Download size={16} /> Download
              </Button>
              <Button
                variant="ai"
                style={{ flex: 1, gap: '6px' }}
                onClick={handleShare}
              >
                <Share2 size={16} /> Share Video
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: 'var(--bg-surface-2)', borderRadius: 14, padding: 14, marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)' }}>
              {activeProject?.mediaId ? 'Exports the original video or your trimmed range as a playable file.' : 'Import a video to export real media.'}
            </div>

            {/* Render Progress */}
            {isRendering && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ai-accent)', fontWeight: 600, marginBottom: '6px' }}>
                   <span>Preparing video...</span>
                  <span>{renderProgress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#202020', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${renderProgress}%`, backgroundColor: 'var(--ai-accent)', transition: 'width 0.1s ease' }} />
                </div>
              </div>
            )}

            {renderError && <p role="alert" style={{ color: '#ff9ca5', fontSize: 12 }}>{renderError}</p>}
            <Button
              variant="ai"
              size="lg"
              fullWidth
              disabled={isRendering}
              onClick={handleStartRender}
              style={{ gap: '8px' }}
            >
               <Sparkles size={18} aria-hidden="true" />
               {isRendering ? 'Rendering...' : 'Render & Export'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
