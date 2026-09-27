import { createServer } from 'node:http';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { probe, renderTimelineArgs, run } from './engine.mjs';

const root = process.env.MEDIA_DATA_DIR || fileURLToPath(new URL('./data/', import.meta.url));
const maxUpload = 500 * 1024 * 1024;
await mkdir(root, { recursive: true });

function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function body(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 8192) throw new Error('Request too large');
  }
  return JSON.parse(text);
}

async function serve(req, res, file) {
  const { size } = await stat(file);
  const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
  const start = match ? Number(match[1]) : 0;
  const end = match ? Math.min(match[2] ? Number(match[2]) : size - 1, size - 1) : size - 1;
  if (start > end || start >= size) {
    res.writeHead(416, { 'Content-Range': `bytes */${size}` });
    res.end();
    return;
  }
  res.writeHead(match ? 206 : 200, {
    'Content-Type': 'video/mp4',
    'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes',
    ...(match ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
  });
  createReadStream(file, { start, end }).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'POST' && path === '/api/media') {
      if (req.headers['content-type'] !== 'video/mp4' || Number(req.headers['content-length']) > maxUpload) {
        return reply(res, 400, { error: 'Upload an MP4 video smaller than 500 MB' });
      }
      const id = randomUUID();
      const file = join(root, `${id}.mp4`);
      let bytes = 0;
      try {
        await pipeline(req, new Transform({ transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          callback(bytes > maxUpload ? new Error('Video exceeds 500 MB') : null, chunk);
        } }), createWriteStream(file));
        const metadata = await probe(file);
        await writeFile(join(root, `${id}.json`), JSON.stringify(metadata));
        return reply(res, 201, { id, url: `/api/media/${id}`, ...metadata });
      } catch (error) {
        await rm(file, { force: true });
        throw error;
      }
    }
    if (req.method === 'GET' && /^\/api\/media\/[\da-f-]{36}$/.test(path)) {
      return await serve(req, res, join(root, `${path.slice(-36)}.mp4`));
    }
    if (req.method === 'POST' && path === '/api/render') {
      const request = await body(req);
      if (!Array.isArray(request.clips) || request.clips.length < 1 || request.clips.length > 12) throw new Error('Choose 1 to 12 clips');
      const clips = await Promise.all(request.clips.map(async (clip) => {
        if (typeof clip.mediaId !== 'string' || !/^[\da-f-]{36}$/.test(clip.mediaId)) throw new Error('Unknown media ID');
        const metadata = JSON.parse(await readFile(join(root, `${clip.mediaId}.json`), 'utf8'));
        return { ...metadata, input: join(root, `${clip.mediaId}.mp4`), start: clip.start, end: clip.end };
      }));
      const id = randomUUID();
      const output = join(root, `${id}.mp4`);
      const args = renderTimelineArgs({ clips, output, noiseReduction: request.noiseReduction });
      try {
        await run('ffmpeg', args);
      } catch (error) {
        await rm(output, { force: true });
        throw error;
      }
      return reply(res, 201, { url: `/api/render/${id}` });
    }
    if (req.method === 'GET' && /^\/api\/render\/[\da-f-]{36}$/.test(path)) {
      return await serve(req, res, join(root, `${path.slice(-36)}.mp4`));
    }
    reply(res, 404, { error: 'Not found' });
  } catch (error) {
    reply(res, error.code === 'ENOENT' ? 404 : 400, { error: error.message });
  }
});
server.listen(Number(process.env.MEDIA_PORT || 8787), '127.0.0.1', () => console.log(`Media server listening on http://127.0.0.1:${server.address().port}`));
