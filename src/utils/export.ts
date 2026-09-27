import { files } from './files';
import type { Project } from '@/shared/types/project';

export async function renderProject(project: Project, onProgress?: (value: number) => void): Promise<File> {
  if (!project.mediaId) throw new Error('Import a video before exporting this project.');
  const source = await files.restore(project.mediaId);
  if (!source) throw new Error('The source video is missing from this browser. Please reimport it.');
  const start = project.trimStartSeconds ?? 0;
  const end = project.trimEndSeconds ?? project.durationSeconds;
  if (end <= start || end > project.durationSeconds + 0.1) throw new Error('Choose a valid trim range.');
  const name = (project.title.replace(/[^a-z0-9_-]+/gi, '-') || 'video');
  // With no edits, deliver the original bytes rather than transcoding or relabelling them.
  if (start < 0.05 && end >= project.durationSeconds - 0.05) {
    onProgress?.(100);
    return new File([source], `${name}.${source.name.split('.').pop() || 'mp4'}`, { type: source.type });
  }
  if (typeof MediaRecorder === 'undefined') throw new Error('Trimmed export needs MediaRecorder support in this browser.');
  const mime = ['video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mime) throw new Error('This browser cannot encode WebM video for trimmed export.');
  const video = document.createElement('video');
  const url = URL.createObjectURL(source);
  video.src = url;
  video.playsInline = true;
  video.preload = 'auto';
  let recorder: MediaRecorder | undefined;
  let stream: MediaStream | undefined;
  let timer: number | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Cannot decode this video for export.'));
    });
    if (end > video.duration + 0.1) throw new Error('The trim extends past the source video.');
    if (Math.abs(video.currentTime - start) > 0.02) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('Could not seek to the trim start.'));
        video.currentTime = start;
      });
    }
    const capture = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream;
    if (!capture) throw new Error('This browser cannot capture video for trimmed export.');
    stream = capture.call(video);
    if (!stream.getVideoTracks().length) throw new Error('The browser provided no video track.');
    recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks: Blob[] = [];
    const result = new Promise<Blob>((resolve, reject) => {
      recorder!.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder!.onerror = () => reject(new Error('The browser failed to encode this video.'));
      recorder!.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });
    recorder.start(250);
    await video.play().catch(() => { throw new Error('Playback was blocked. Tap Render again.'); });
    timer = window.setInterval(() => {
      onProgress?.(Math.min(99, Math.round(((video.currentTime - start) / (end - start)) * 100)));
      if (video.currentTime >= end || video.ended) {
        video.pause();
        if (recorder?.state === 'recording') recorder.stop();
      }
    }, 50);
    const blob = await result;
    if (!blob.size) throw new Error('No video bytes were rendered.');
    onProgress?.(100);
    return new File([blob], `${name}.webm`, { type: mime });
  } finally {
    if (timer !== undefined) window.clearInterval(timer);
    if (recorder?.state === 'recording') recorder.stop();
    stream?.getTracks().forEach((track) => track.stop());
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

export async function shareVideo(file: File): Promise<boolean> {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title: file.name });
    return true;
  } catch {
    return false;
  }
}
