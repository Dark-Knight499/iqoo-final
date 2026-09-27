import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const venvPython = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts' : 'bin', process.platform === 'win32' ? 'python.exe' : 'python');
const pythonVersion = process.env.PYTHON_VERSION || '3.10';
const uv = process.env.UV || 'uv';

function findPython() {
  const result = spawnSync(uv, ['python', 'find', '--system', pythonVersion], { encoding: 'utf8', windowsHide: true });
  return result.status === 0 ? result.stdout.trim().split(/\r?\n/).at(-1) : '';
}

function environmentWorks() {
  if (!existsSync(venvPython)) return false;
  const result = spawnSync(venvPython, ['-c', 'import sys; assert sys.version_info[:2] == (3, 10)'], { windowsHide: true, timeout: 10_000 });
  return result.status === 0;
}

function hostHasCpuDetector(python) {
  const result = spawnSync(python, ['-c', 'import torch, ultralytics; assert not torch.version.cuda'], { windowsHide: true, timeout: 20_000 });
  return result.status === 0;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
      env: { ...process.env, UV_HTTP_TIMEOUT: process.env.UV_HTTP_TIMEOUT || '120' },
    });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code ?? 'unknown'}`)));
  });
}

try {
  let python = findPython();
  if (!python) {
    await run(uv, ['python', 'install', pythonVersion]);
    python = findPython();
  }
  if (!python) throw new Error(`Python ${pythonVersion} is unavailable.`);
  // Never use the interpreter inside .venv to recreate itself. A failed setup
  // can leave a dangling/self-referential python symlink behind.
  const reuseHostDetector = process.env.ISOLATED_PYTHON !== '1' && hostHasCpuDetector(python);
  const venvHasDetector = environmentWorks() && hostHasCpuDetector(venvPython);
  if (!environmentWorks() || (reuseHostDetector && !venvHasDetector)) {
    await run(uv, ['venv', '--clear', ...(reuseHostDetector ? ['--system-site-packages'] : []), '--python', python, '.venv']);
  }
  if (!reuseHostDetector && (process.platform === 'linux' || process.platform === 'win32')) {
    // Pin matching CPU wheels so setup does not pull hundreds of megabytes of CUDA libraries.
    await run(uv, ['pip', 'install', '--python', venvPython, '--index-strategy', 'unsafe-best-match', '--index-url', 'https://download.pytorch.org/whl/cpu', '--extra-index-url', 'https://pypi.org/simple', 'torch==2.12.0+cpu', 'torchvision==0.27.0+cpu']);
  }
  await run(uv, ['pip', 'install', '--python', venvPython, '--index-url', 'https://pypi.org/simple', ...(reuseHostDetector ? [] : ['ultralytics>=8.4,<9']), 'faster-whisper>=1.1,<2']);
  await run(venvPython, ['-c', 'import torch, ultralytics, faster_whisper; print("CPU inference dependencies ready")']);

  if (process.env.SKIP_WHISPER_MODEL_DOWNLOAD !== '1') {
    const model = process.env.FASTER_WHISPER_MODEL || 'base';
    console.log(`Downloading/caching faster-whisper '${model}' for the first offline-ready run...`);
    await run(venvPython, ['-c', 'import os; from faster_whisper import WhisperModel; WhisperModel(os.environ.get("FASTER_WHISPER_MODEL", "base"), device="cpu", compute_type="int8")']);
  }

  console.log(`Python runtime ready: ${venvPython}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  console.error('Install uv, then retry npm run setup:python. The setup provisions Python 3.10 with uv.');
  process.exitCode = 1;
}
