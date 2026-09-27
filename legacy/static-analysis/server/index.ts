import express from 'express';
import multer from 'multer';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { runAnalysis } from './pipeline';
import { OUTPUT_DIR, withOutputDirectory, writeResult } from './media-runtime';

const app = express();
const port = Number(process.env.PORT ?? 4174);
const outputDir = OUTPUT_DIR;
const uploadDir = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'creator-upload-')));
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 3 * 1024 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith('video/') || /\.(mp4|mov|mkv|webm|m4v)$/i.test(file.originalname)) callback(null, true);
    else callback(new Error('Choose a video file.'));
  },
});
let analysisInProgress = false;

async function sha256(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

app.use(express.json());
app.get('/api/health', (_request, response) => response.json({ ok: true }));
app.get('/api/outputs', async (_request, response) => {
  await mkdir(outputDir, { recursive: true });
  const folders = (await readdir(outputDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  response.json(folders);
});
app.get('/api/outputs/:videoName', async (request, response, next) => {
  const videoName = request.params.videoName;
  if (!/^[a-zA-Z0-9_-]+$/.test(videoName)) { response.status(400).json({ error: 'Invalid output folder name.' }); return; }
  const directory = path.join(outputDir, videoName);
  try {
    const files = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
    response.json(files.map((name) => ({ name, url: `/api/outputs/${encodeURIComponent(videoName)}/${encodeURIComponent(name)}` })));
  } catch (error) { next(error); }
});
app.get('/api/outputs/:videoName/:name', async (request, response, next) => {
  const videoName = request.params.videoName;
  const name = path.basename(request.params.name);
  if (!/^[a-zA-Z0-9_-]+$/.test(videoName) || !/^[a-z_]+\.json$/.test(name)) { response.status(400).json({ error: 'Invalid output path.' }); return; }
  response.type('application/json').sendFile(path.join(outputDir, videoName, name), (error) => { if (error) next(error); });
});
app.post('/api/analyze', upload.single('video'), async (request, response) => {
  if (!request.file) { response.status(400).json({ error: 'Select a video first.' }); return; }
  const sampleIntervalMs = Number(request.body.sampleIntervalMs ?? 2000);
  if (!Number.isSafeInteger(sampleIntervalMs) || sampleIntervalMs < 100 || sampleIntervalMs > 60_000) {
    await rm(request.file.path, { force: true });
    response.status(400).json({ error: 'YOLO interval must be an integer between 100 and 60000 milliseconds.' });
    return;
  }
  if (analysisInProgress) {
    await rm(request.file.path, { force: true });
    response.status(409).json({ error: 'Another video is already being analyzed.' });
    return;
  }
  analysisInProgress = true;
  const cancellation = new AbortController();
  const videoName = path.parse(request.file.originalname).name.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'video';
  const outputFolder = `${videoName.slice(0, 64)}_${randomUUID()}`;
  const outputDirectory = path.join(outputDir, outputFolder);
  response.on('close', () => { if (!response.writableEnded) cancellation.abort(); });
  try {
    const inputHash = await sha256(request.file.path);
    if (cancellation.signal.aborted) return;
    const features = await runAnalysis(request.file.path, sampleIntervalMs, cancellation.signal, outputDirectory);
    const succeeded = new Set(features.filter(({ status }) => status === 'success').map(({ feature }) => feature));
    const metadata = succeeded.has('video_metadata') ? JSON.parse(await readFile(path.join(outputDirectory, 'video_metadata.json'), 'utf8')) as { durationMs?: number } : null;
    const manifest = {
      schemaVersion: '1.0',
      analysisId: outputFolder,
      createdAt: new Date().toISOString(),
      input: { originalName: request.file.originalname, sizeBytes: request.file.size, sha256: inputHash, durationMs: metadata?.durationMs ?? null },
      options: { yoloSampleIntervalMs: sampleIntervalMs },
      features: features.map(({ feature, status, error }) => ({ feature, status, ...(error ? { error } : {}), ...(succeeded.has(feature) ? { artifact: `${feature}.json` } : {}) })),
    };
    await withOutputDirectory(outputDirectory, () => writeResult('manifest', manifest));
    if (!cancellation.signal.aborted) response.json({ features, outputFolder });
  } catch (error) {
    if (!cancellation.signal.aborted) response.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally { analysisInProgress = false; await rm(request.file.path, { force: true }); }
});
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  response.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' });
});

const server = app.listen(port, '127.0.0.1', () => console.log(`Creator analysis server: http://127.0.0.1:${port}`));
server.requestTimeout = 0;
server.timeout = 0;
process.on('SIGINT', () => { server.close(); void rm(uploadDir, { recursive: true, force: true }); });
process.on('SIGTERM', () => { server.close(); void rm(uploadDir, { recursive: true, force: true }); });
