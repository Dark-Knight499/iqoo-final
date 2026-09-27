import { existsSync } from 'node:fs';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { Yolo } from '../src/static-analysis/contracts';
import { FFMPEG, run, writeResult } from '../server/media-runtime';

const PYTHON_DETECTOR = String.raw`import json, sys
from ultralytics import YOLO
model_path, payload_path = sys.argv[1], sys.argv[2]
payload = json.load(open(payload_path, encoding='utf-8'))
model = YOLO(model_path)
output = []
for sample in payload:
    try:
        result = model.predict(sample['path'], verbose=False)[0]
        objects = []
        if result.boxes is not None:
            for box in result.boxes:
                x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                cls = int(box.cls[0].item())
                objects.append({'name': str(result.names[cls]), 'confidence': float(box.conf[0].item()),
                  'box': {'x': {'x': x1, 'y': y2}, 'y': {'x': x1, 'y': y1}, 'z': {'x': x2, 'y': y1}, 't': {'x': x2, 'y': y2}}})
        output.append({'objects': objects})
    except Exception as error:
        output.append({'error': str(error)})
print(json.dumps(output))
`;

/** Sample frames independently of keyframes and store boxes in original-frame pixels. */
export async function analyzeYoloObjects(videoPath: string, durationMs: number, sampleIntervalMs: number, signal?: AbortSignal): Promise<Yolo> {
  if (!Number.isSafeInteger(sampleIntervalMs) || sampleIntervalMs < 100) throw new Error('YOLO sampling interval must be an integer of at least 100 ms.');
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'creator-yolo-'));
  try {
    const samples: Array<{ startMs: number; endMs: number; path: string }> = [];
    for (let startMs = 0; startMs < durationMs; startMs += sampleIntervalMs) {
      const imagePath = path.join(workspace, `frame-${samples.length}.jpg`);
      await run(FFMPEG, ['-v', 'error', '-ss', (startMs / 1000).toFixed(3), '-i', videoPath, '-frames:v', '1', '-q:v', '3', '-y', imagePath], { signal }).then(async () => {
        await readFile(imagePath);
        samples.push({ startMs, endMs: Math.min(startMs + sampleIntervalMs, durationMs), path: imagePath });
      }).catch((error) => { if (signal?.aborted) throw error; /* skip intervals with no extractable frame */ });
    }
    const inputPath = path.join(workspace, 'samples.json'); const scriptPath = path.join(workspace, 'run_yolo.py');
    await writeFile(inputPath, JSON.stringify(samples), 'utf8'); await writeFile(scriptPath, PYTHON_DETECTOR, 'utf8');
    const model = process.env.YOLO_MODEL || 'yolo26n.pt';
    const virtualenvPython = path.resolve('.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
    const python = process.env.PYTHON_PATH || (existsSync(virtualenvPython) ? virtualenvPython : process.platform === 'win32' ? 'python' : 'python3');
    const { stdout } = await run(python, [scriptPath, model, inputPath], { timeoutMs: 900_000, signal });
    const rows = JSON.parse(stdout.toString('utf8')) as Array<{ objects?: Yolo['detections'][number]['objects']; error?: string }>;
    const detections: Yolo['detections'] = []; let hasAnyObject = false;
    for (let index = 0; index < rows.length; index++) {
      if (rows[index]?.error) continue;
      const objects = rows[index]?.objects ?? [];
      if (objects.length) hasAnyObject = true;
      detections.push({ startMs: samples[index].startMs, endMs: samples[index].endMs, objects });
    }
    return writeResult('yolo', { sampleIntervalMs, detections: hasAnyObject ? detections : [] });
  } finally { await rm(workspace, { recursive: true, force: true }); }
}
