import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Music2, Video, Play, Sparkles } from 'lucide-react';
import { files } from '@/utils/files';

type Kind = 'video' | 'audio' | 'image' | 'project';

/** Bundled /assets JPEGs were illustrated demo artwork, not media frames. */
const authenticSource = (src?: string) => src && !src.startsWith('/assets/') && !src.startsWith('data:image/svg+xml') ? src : null;

export const MediaArt: React.FC<{
  src?: string; mediaId?: string | null; label?: string; kind?: Kind;
  style?: React.CSSProperties; className?: string;
}> = ({ src, mediaId, label = 'No media attached', kind = 'video', style, className = '' }) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(mediaId));

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    setFrame(null);
    if (mediaId) {
      setIsLoading(true);
      (async () => {
        let blob = await files.restoreThumbnail(mediaId);
        if (!blob) {
          const source = await files.restore(mediaId);
          if (source) {
            const sourceUrl = URL.createObjectURL(source);
            try {
              blob = await files.captureFrame(sourceUrl).catch(() => null);
              if (blob) await files.storeThumbnail(mediaId, blob);
            } finally { URL.revokeObjectURL(sourceUrl); }
          }
        }
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob);
          setFrame(objectUrl);
        }
      })()
        .catch(() => { /* Missing or unsupported media gets a clearly labeled placeholder. */ })
        .finally(() => { if (active) setIsLoading(false); });
    } else {
      setIsLoading(false);
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [mediaId]);

  useEffect(() => setBroken(false), [src, mediaId]);
  const image = broken ? null : frame || (!mediaId ? authenticSource(src) : null);
  const Icon = { video: Video, audio: Music2, image: ImageIcon, project: FileText }[kind];

  if (isLoading) {
    return (
      <div className={`skeleton-shimmer ${className}`} style={{ ...style, minHeight: '80px', borderRadius: 'inherit' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
          <Icon size={22} />
        </div>
      </div>
    );
  }

  const kindBadge = {
    video: '9:16 SHORT',
    project: 'PROJECT · 4K',
    audio: 'AUDIO STEM',
    image: 'IMAGE'
  }[kind];

  return (
    <div className={`content-placeholder ${className}`} style={style}>
      {image ? (
        <img
          src={image}
          alt={label}
          loading="lazy"
          onError={() => setBroken(true)}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            transition: 'transform 0.25s ease, opacity 0.2s ease',
          }}
        />
      ) : (
        <div className="content-placeholder-label">
          {/* Top Category Badge */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '8px',
              fontWeight: 800,
              color: 'var(--ai-accent)',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            {kindBadge}
          </div>

          {/* Central Play/Icon Overlay */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              color: 'var(--ai-accent)',
            }}
          >
            {kind === 'video' || kind === 'project' ? (
              <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
            ) : (
              <Icon size={18} strokeWidth={1.8} />
            )}
          </div>

          {/* Truncated Title Label */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '0 8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
