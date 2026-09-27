import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Music2, Video } from 'lucide-react';
import { files } from '@/utils/files';

type Kind = 'video' | 'audio' | 'image' | 'project';

/** Bundled /assets JPEGs were illustrated demo artwork, not media frames. */
const authenticSource = (src?: string) => src && !src.startsWith('/assets/') && !src.startsWith('data:image/svg+xml') ? src : null;

export const MediaArt: React.FC<{
  src?: string; mediaId?: string; label?: string; kind?: Kind;
  style?: React.CSSProperties; className?: string;
}> = ({ src, mediaId, label = 'No media attached', kind = 'video', style, className = '' }) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    setFrame(null);
    if (mediaId) {
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
      })().catch(() => { /* Missing or unsupported media gets a clearly labeled placeholder. */ });
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [mediaId]);

  useEffect(() => setBroken(false), [src, mediaId]);
  const image = broken ? null : frame || (!mediaId ? authenticSource(src) : null);
  const Icon = { video: Video, audio: Music2, image: ImageIcon, project: FileText }[kind];
  return <div className={`content-placeholder ${className}`} style={style}>
    {image ? <img src={image} alt={label} loading="lazy" onError={() => setBroken(true)}
      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} /> :
      <div className="content-placeholder-label"><Icon size={22} strokeWidth={1.5} aria-hidden="true" style={{ opacity: 0.45 }} /><span>{label}</span></div>}
  </div>;
};
