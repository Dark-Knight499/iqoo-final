export interface PickedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  mediaId: string;
  duration: number;
  width: number;
  height: number;
}

const DB_NAME = 'creator-ai-media';
const STORE = 'videos';
const THUMBNAILS = 'thumbnails';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Local media storage is unavailable.'));
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      if (!request.result.objectStoreNames.contains(THUMBNAILS)) request.result.createObjectStore(THUMBNAILS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open media storage.'));
  });
}

export const files = {
  async storeThumbnail(id: string, thumbnail: Blob): Promise<void> {
    const db = await openDB();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(THUMBNAILS, 'readwrite');
        transaction.objectStore(THUMBNAILS).put(thumbnail, id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Could not save video frame.'));
      });
    } finally { db.close(); }
  },

  async restoreThumbnail(id: string): Promise<Blob | null> {
    const db = await openDB();
    try {
      return await new Promise<Blob | null>((resolve, reject) => {
        const request = db.transaction(THUMBNAILS, 'readonly').objectStore(THUMBNAILS).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Could not load video frame.'));
      });
    } finally { db.close(); }
  },

  /** Sample a frame from the user's own playable video; never fabricate media imagery. */
  captureFrame(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      let finished = false;
      const timer = window.setTimeout(() => finish(new Error('Frame extraction timed out.')), 7000);
      const finish = (error?: Error, frame?: Blob) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        video.removeAttribute('src');
        video.load();
        if (error || !frame) reject(error || new Error('No video frame available.'));
        else resolve(frame);
      };
      video.onerror = () => finish(new Error('Cannot decode a video frame.'));
      video.onloadedmetadata = () => {
        if (!video.videoWidth || !Number.isFinite(video.duration) || video.duration <= 0) return finish(new Error('No playable frame available.'));
        const position = Math.min(1, video.duration / 4);
        video.currentTime = position;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(480, video.videoWidth);
        canvas.height = Math.max(1, Math.round(canvas.width * video.videoHeight / video.videoWidth));
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => finish(blob ? undefined : new Error('Could not capture the source frame.'), blob || undefined), 'image/jpeg', .78);
      };
      video.src = url;
    });
  },

  async store(file: File): Promise<string> {
    const db = await openDB();
    const id = crypto.randomUUID();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readwrite');
        transaction.objectStore(STORE).put(file, id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Could not save video.'));
        transaction.onabort = () => reject(transaction.error || new Error('Video storage was interrupted.'));
      });
      return id;
    } finally {
      db.close();
    }
  },

  async restore(id: string): Promise<File | null> {
    const db = await openDB();
    try {
      return await new Promise<File | null>((resolve, reject) => {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Could not restore video.'));
      });
    } finally {
      db.close();
    }
  },

  metadata(url: string): Promise<{ duration: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const timer = window.setTimeout(() => finish(new Error('Video metadata timed out.')), 15000);
      const finish = (error?: Error) => {
        window.clearTimeout(timer);
        if (error) reject(error);
        else resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
        video.removeAttribute('src');
        video.load();
      };
      video.onloadedmetadata = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth) finish(new Error('This video has no playable duration.'));
        else finish();
      };
      video.onerror = () => finish(new Error('The browser cannot play this video.'));
      video.src = url;
    });
  },

  pick(accept = 'video/*'): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.style.display = 'none';
      document.body.appendChild(input);
      let settled = false;
      const finish = (file: File | null) => {
        if (settled) return;
        settled = true;
        input.remove();
        resolve(file);
      };
      input.onchange = () => finish(input.files?.[0] || null);
      input.addEventListener('cancel', () => finish(null), { once: true });
      input.click();
    });
  },

  async pickVideo(): Promise<PickedFile | null> {
    const file = await files.pick('video/*');
    if (!file) return null;
    const url = URL.createObjectURL(file);
    try {
      const info = await files.metadata(url);
      const mediaId = await files.store(file);
      // Frame extraction is best-effort: unsupported codecs must not block a valid import.
      const frame = await files.captureFrame(url).catch(() => null);
      if (frame) await files.storeThumbnail(mediaId, frame).catch(() => {});
      return { name: file.name, size: file.size, type: file.type, url, mediaId, ...info };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  },
};
