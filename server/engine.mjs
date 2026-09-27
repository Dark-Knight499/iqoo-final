import { spawn } from 'node:child_process';

export const noiseLevels = Object.freeze({ off: 0, light: 6, medium: 12, strong: 18 });

export function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let error = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { error = (error + chunk).slice(-4000); });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(output) : reject(new Error(error || `${command} exited ${code}`)));
  });
}

export async function probe(file) {
  const output = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', file]);
  const result = JSON.parse(output);
  const video = result.streams?.find((stream) => stream.codec_type === 'video');
  const duration = Number(result.format?.duration);
  if (!video || !Number.isFinite(duration) || duration <= 0 || !video.width || !video.height) {
    throw new Error('A playable video is required');
  }
  return { duration, width: video.width, height: video.height, hasAudio: result.streams.some((stream) => stream.codec_type === 'audio') };
}

export function renderTimelineArgs({ clips, output, noiseReduction }) {
  if (!Array.isArray(clips) || clips.length < 1 || clips.length > 12) throw new Error('Choose 1 to 12 clips');
  if (!Object.hasOwn(noiseLevels, noiseReduction)) throw new Error('Unknown noise reduction level');
  const hasAudio = clips[0].hasAudio;
  if (clips.some((clip) => clip.hasAudio !== hasAudio)) throw new Error('All clips must either have audio or be silent');
  if (noiseReduction !== 'off' && !hasAudio) throw new Error('These clips have no audio track to clean');
  const width = Math.floor(clips[0].width / 2) * 2;
  const height = Math.floor(clips[0].height / 2) * 2;
  const args = ['-hide_banner', '-loglevel', 'error', '-y'];
  const filters = [];

  clips.forEach((clip, index) => {
    const { input, start, end, duration } = clip;
    if (typeof input !== 'string' || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > duration + 0.01) {
      throw new Error(`Invalid trim range for clip ${index + 1}`);
    }
    args.push('-i', input);
    filters.push(`[${index}:v:0]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,fps=30,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[v${index}]`);
    if (hasAudio) filters.push(`[${index}:a:0]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,aresample=48000[a${index}]`);
  });

  const videoOutput = clips.length === 1 ? '[v0]' : '[v]';
  const audioOutput = clips.length === 1 ? '[a0]' : '[a]';
  if (clips.length > 1) {
    filters.push(`${clips.map((_, index) => `[v${index}]${hasAudio ? `[a${index}]` : ''}`).join('')}concat=n=${clips.length}:v=1:a=${hasAudio ? 1 : 0}${videoOutput}${hasAudio ? audioOutput : ''}`);
  }
  if (hasAudio && noiseReduction !== 'off') filters.push(`${audioOutput}afftdn=nr=${noiseLevels[noiseReduction]}[clean]`);
  args.push('-filter_complex', filters.join(';'), '-map', videoOutput);
  if (hasAudio) {
    args.push('-map', noiseReduction === 'off' ? audioOutput : '[clean]', '-c:a', 'aac', '-b:a', '160k');
  } else {
    args.push('-an');
  }
  args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output);
  return args;
}
