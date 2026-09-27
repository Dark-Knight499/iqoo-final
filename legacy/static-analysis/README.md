# Creator Video Analysis

Local video analysis service and standalone UI. It generates JSON for video metadata, audio RMS, silence, noise estimate, Whisper transcription, shot boundaries, keyframe timestamps, and sampled YOLO detections. Each HTTP upload gets a unique output folder and `manifest.json` with the input hash, options, and per-feature statuses. A failed optional module does not discard completed features.

## Setup

Requirements: Node.js 20+, FFmpeg and FFprobe on `PATH`, [`uv`](https://docs.astral.sh/uv/getting-started/installation/), Python 3.10 (uv will locate/download it), and adequate disk space. The bundled `tools/whisper/Release` executables work on Windows only; the cross-platform default is CPU Faster Whisper (`base` model). Model-backed analysis runs on the computer, not on the phone's NPU.

```sh
npm ci
npm run setup:python
npm test
npm run dev
```

`setup:python` creates a local ignored `.venv`, installs Faster Whisper plus Ultralytics and CPU PyTorch when needed, and downloads the `base` transcription model. If the host Python already has CPU PyTorch and Ultralytics, it reuses those packages to save time and disk space. `UV_HTTP_TIMEOUT=120` is set automatically for slow connections; re-running the command reuses cached downloads. `ISOLATED_PYTHON=1` forces a fully isolated environment. Set `SKIP_WHISPER_MODEL_DOWNLOAD=1` if you need an offline/deferred download.

FFmpeg 4.4 and newer are supported by the shot detector. Analysis produces `output/<video-name>_<unique-run-id>/` with `manifest.json` and successful feature JSON files. This directory is ignored by Git. `npm test` analyzes the bundled short demo video; it validates available model-backed outputs and reports optional model failures independently.

## Configuration

The server listens on `127.0.0.1:4174` by default; the standalone UI runs on localhost through the Vite proxy. For the root app's phone-friendly LAN UI, run `npm run mobile` from the parent worktree instead. It exposes the *UI* on the local network, while the analyzer port remains bound to the host computer.

- `PYTHON_PATH`: override the Python executable; defaults to `.venv/bin/python` (or `.venv/Scripts/python.exe`), then `python3` on Unix.
- `FASTER_WHISPER_MODEL`: name of Faster Whisper model to download/use (default `base`).
- `WHISPER_CLI` and `WHISPER_MODEL`: use an existing whisper.cpp CLI and GGML model instead of Faster Whisper.
- `YOLO_MODEL`: model path or name (default `yolo26n.pt`).
- `FFMPEG_PATH`, `FFPROBE_PATH`: overrides for media tools.
- `ANALYSIS_OUTPUT_DIR`: output directory (default `output/`).
- `SHOT_SAMPLE_INTERVAL_MS`, `SHOT_DIFF_THRESHOLD`, `SILENCE_THRESHOLD`, `MIN_SILENCE_MS`: optional analysis tuning parameters.

Results describe observable media signals. Shots are cut intervals, not semantic scenes; YOLO detects sampled frames, not tracked objects. No speaker diarization, topic generation, or creative suggestions are provided by this service.
