# Standalone On-Device Viral Video Clipping Pipeline

A 100% self-contained, offline viral video clipping engine running entirely inside `C:\MangoDB-iqoo\clipping\`.

## 🧠 Core Architecture & Execution Guarantee

1. **Zero Cloud APIs & Zero API Keys**:
   - 100% offline, local execution.
   - No OpenAI, Google Gemini API, Claude, or any external cloud services.

2. **Genuine Gemma 4 E2B Multimodal AI Running on Physical Phone**:
   - Model: `gemma-4-E2B-it.litertlm` (2.58 GB).
   - Runtime: Google's official **LiteRT-LM** (`litert-lm-api` for `android_23_arm64_v8a`).
   - Hardware: **Snapdragon 8 Elite (SM8750-AB)** with **Adreno 830 GPU** running via Qualcomm OpenCL delegate (`LITERT_CL`).
   - Headless Daemon: Runs as a background service in Termux (`phone_gemma_server.py`) listening on `0.0.0.0:8080`.
   - **No App UI Medium**: Operates without opening or keeping the Google AI Edge Gallery app UI on screen.

3. **Multi-Signal Engagement Intelligence**:
   - **Signal 1 (Acoustic)**: Real-time FFmpeg 8kHz mono PCM acoustic RMS decibel profiler detecting sudden volume spikes, laughter, and sound effects.
   - **Signal 2 (Visual Kinetics)**: FFmpeg visual scene cut detector (`gt(scene, 0.35)`) and motion gradient variance.
   - **Signal 3 (Multimodal Vision)**: 384x384 downsampled keyframe extraction matching Google AI Edge's 280 vision token budget, sent over ADB bridge to Gemma 4 E2B on the phone.
   - **Signal 4 (Smart 9:16 Cropping)**: Visual mass distribution analysis determining dynamic center-X crop offset for vertical Shorts/Reels/TikTok.

---

## 📁 Directory Structure (`C:\MangoDB-iqoo\clipping\`)

- **`models.py`**: Consolidated data models (`ClipAnalysisRequest`, `ClipAnalysisResponse`, `ViralClipItem`, `VisualAssessment`, `SlidingWindowResult`).
- **`phone_gemma_client.py`**: Python client connecting to the phone's Gemma 4 E2B server over `http://localhost:8080`.
- **`pipeline.py`**: Complete end-to-end clipping engine (audio RMS, scene cuts, keyframe extraction, Gemma evaluation, virality scoring, and 9:16 export).
- **`phone_gemma_server.py`**: The headless LiteRT-LM HTTP server script deployed on the phone in Termux.
- **`benchmark_clipping.py`**: End-to-end benchmark script executing the pipeline on `example.mp4`.
- **`example.mp4`**: Test video (*"Getting Attention On A Deserted Island | Cartoon Box 345"* by Frame Order).
- **`frames/`**: Extracted 384x384 physical keyframes evaluated by Gemma 4 E2B.
- **`exports/`**: Generated 9:16 vertical viral video clips.

---

## 🚀 How to Run

### 1. Ensure ADB Bridge is Active
```powershell
& "C:\Program Files (x86)\pcsuite\adb_41\adb.exe" forward tcp:8080 tcp:8080
```

### 2. Verify Phone Server Health
```powershell
python -c "import requests; print(requests.get('http://localhost:8080/health').json())"
```

### 3. Run the Standalone Clipping Pipeline
```powershell
python clipping/benchmark_clipping.py
```
