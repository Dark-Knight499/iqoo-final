import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { probe, renderTimelineArgs, run } from './engine.mjs';

test('validates ranges and audio prerequisites', () => {
  const clip = { input: 'input.mp4', start: 0, end: 2, duration: 2, width: 320, height: 240, hasAudio: true };
  const base = { clips: [clip], output: 'out.mp4', noiseReduction: 'medium' };
  assert.match(renderTimelineArgs(base).join(' '), /afftdn=nr=12/);
  assert.throws(() => renderTimelineArgs({ ...base, clips: [{ ...clip, end: 3 }] }), /Invalid trim/);
  assert.throws(() => renderTimelineArgs({ ...base, noiseReduction: 'custom;rm' }), /Unknown noise/);
  assert.throws(() => renderTimelineArgs({ ...base, clips: [{ ...clip, hasAudio: false }] }), /no audio/);
  assert.throws(() => renderTimelineArgs({ ...base, clips: [clip, { ...clip, hasAudio: false }] }), /either have audio/);
  assert.ok(!renderTimelineArgs({ ...base, clips: [{ ...clip, hasAudio: false }], noiseReduction: 'off' }).includes('afftdn'));
});

test('renders a trimmed video with an audio denoise filter', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'iqoo-editor-'));
  const input = join(dir, 'input.mp4');
  const output = join(dir, 'output.mp4');
  try {
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x240:r=24:d=2', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', input]);
    const source = await probe(input);
    assert.equal(source.hasAudio, true);
    await run('ffmpeg', renderTimelineArgs({ clips: [{ input, start: 0.5, end: 1.5, ...source }], output, noiseReduction: 'light' }));
    const result = await probe(output);
    assert.equal(result.hasAudio, true);
    assert.ok(Math.abs(result.duration - 1) < 0.2, `unexpected duration: ${result.duration}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('uploads, serves byte ranges, and exports through the API', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'iqoo-api-'));
  const input = join(dir, 'input.mp4');
  const secondInput = join(dir, 'second.mp4');
  let server;
  try {
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x240:r=24:d=2', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', input]);
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=160x120:r=25:d=2', '-f', 'lavfi', '-i', 'sine=frequency=550:duration=2', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', secondInput]);
    server = spawn(process.execPath, [new URL('./index.mjs', import.meta.url).pathname], { env: { ...process.env, MEDIA_PORT: '0', MEDIA_DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'pipe'] });
    const origin = await new Promise((resolve, reject) => {
      let stdout = '';
      server.once('error', reject);
      server.once('exit', (code) => reject(new Error(`Media server exited ${code}`)));
      server.stdout.on('data', (chunk) => {
        stdout += chunk;
        const match = /http:\/\/127\.0\.0\.1:\d+/.exec(stdout);
        if (match) resolve(match[0]);
      });
    });
    const uploaded = await fetch(`${origin}/api/media`, { method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: await readFile(input) });
    assert.equal(uploaded.status, 201);
    const media = await uploaded.json();
    assert.equal(media.hasAudio, true);
    const secondUpload = await fetch(`${origin}/api/media`, { method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: await readFile(secondInput) });
    assert.equal(secondUpload.status, 201);
    const second = await secondUpload.json();
    const range = await fetch(`${origin}${media.url}`, { headers: { Range: 'bytes=0-99' } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 100);
    const rendered = await fetch(`${origin}/api/render`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clips: [{ mediaId: media.id, start: 0.5, end: 1.5 }, { mediaId: second.id, start: 0.5, end: 1.5 }], noiseReduction: 'medium' }) });
    assert.equal(rendered.status, 201);
    const result = await rendered.json();
    const video = await fetch(`${origin}${result.url}`);
    assert.equal(video.status, 200);
    assert.match(video.headers.get('content-type'), /video\/mp4/);
    const file = join(dir, 'result.mp4');
    await writeFile(file, Buffer.from(await video.arrayBuffer()));
    const info = await probe(file);
    assert.equal(info.width, 320);
    assert.equal(info.height, 240);
    assert.ok(Math.abs(info.duration - 2) < 0.2, `unexpected duration: ${info.duration}`);
    await run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']);
    const firstFrame = await run('ffmpeg', ['-v', 'error', '-ss', '0.2', '-i', file, '-frames:v', '1', '-f', 'md5', '-']);
    const secondFrame = await run('ffmpeg', ['-v', 'error', '-ss', '1.2', '-i', file, '-frames:v', '1', '-f', 'md5', '-']);
    assert.notEqual(firstFrame, secondFrame);
  } finally {
    server?.kill();
    await rm(dir, { recursive: true, force: true });
  }
});
