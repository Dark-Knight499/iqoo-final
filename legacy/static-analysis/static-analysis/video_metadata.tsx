import type { VideoMetadata } from '../src/static-analysis/contracts';
import { FFPROBE, run, writeResult } from '../server/media-runtime';

export async function analyzeVideoMetadata(videoPath: string, signal?: AbortSignal): Promise<{ result: VideoMetadata; hasAudio: boolean }> {
  const { stdout } = await run(FFPROBE, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', videoPath], { signal });
  const probe = JSON.parse(stdout.toString('utf8')) as { streams?: Array<Record<string, any>>; format?: Record<string, any> };
  const streams = probe.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === 'video');
  const audio = streams.find((stream) => stream.codec_type === 'audio');
  const durationSeconds = Number(video?.duration ?? probe.format?.duration);
  const width = Number(video?.width); const height = Number(video?.height);
  const rateText = String(video?.avg_frame_rate || video?.r_frame_rate || '');
  const [numerator, denominator] = rateText.split('/').map(Number);
  const rotationValue = video?.tags?.rotate ?? video?.side_data_list?.find((data: any) => data.rotation != null)?.rotation;
  const rawRotation = Number(rotationValue);
  const rotation = rotationValue != null && Number.isFinite(rawRotation) ? ((Math.round(rawRotation / 90) * 90 % 360) + 360) % 360 : null;
  const swapsAxes = rotation === 90 || rotation === 270;
  const orientedWidth = swapsAxes ? height : width; const orientedHeight = swapsAxes ? width : height;
  const videoMime: Record<string, string> = { h264: 'video/avc', hevc: 'video/hevc', av1: 'video/av01', vp9: 'video/x-vnd.on2.vp9', vp8: 'video/x-vnd.on2.vp8', mpeg4: 'video/mp4v-es' };
  const audioMime: Record<string, string> = { aac: 'audio/mp4a-latm', opus: 'audio/opus', mp3: 'audio/mpeg', flac: 'audio/flac', vorbis: 'audio/vorbis', ac3: 'audio/ac3' };
  const metadata: VideoMetadata = {
    durationMs: Number.isFinite(durationSeconds) ? Math.round(durationSeconds * 1000) : null,
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    fps: denominator > 0 && numerator > 0 ? Number((numerator / denominator).toFixed(3)) : null,
    orientation: Number.isFinite(orientedWidth) && Number.isFinite(orientedHeight) ? orientedWidth === orientedHeight ? 'square' : orientedWidth > orientedHeight ? 'landscape' : 'portrait' : null,
    rotation,
    videoFormat: video ? videoMime[String(video.codec_name)] ?? null : null,
    audioFormat: audio ? audioMime[String(audio.codec_name)] ?? null : null,
  };
  return { result: await writeResult('video_metadata', metadata), hasAudio: Boolean(audio) };
}
