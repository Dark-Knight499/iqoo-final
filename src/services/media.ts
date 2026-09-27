export interface UploadedVideo {
  id: string;
  url: string;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export async function uploadVideo(file: File): Promise<UploadedVideo> {
  const response = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Video upload failed');
  return data;
}
