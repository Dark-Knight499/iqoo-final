# Video Static Analysis — Features

Each feature produces its own output file. All files can later be combined into `AnalysisResult`.

## 1. Video Metadata

**What:** Gets duration, width, height, FPS, orientation, and video/audio format.

**How:** Use the current Android Media3 Inspector metadata APIs to read the video's metadata without processing the whole video.

**Output:** `video_metadata.json`

## 2. Transcription + Timestamps

**What:** Converts speech to text and records when each segment and word is spoken.

**How:** Extract and decode the audio, run `whisper.cpp` locally with `ggml-small.bin`, and save the transcript with segment and word timestamps.

**Output:** `transcript.json`

## 3. RMS / Volume

**What:** Measures audio signal level over time.

**How:** Decode the audio into PCM, split it into fixed-size windows, and calculate RMS for each window.

**Output:** `audio_rms.json`

## 4. Silence Detection

**What:** Finds continuous parts of the video where the audio level stays very low.

**How:** Use `audio_rms.json`, mark windows below the configured silence threshold, and combine consecutive windows into silence intervals.

**Output:** `silence.json`

## 5. Noise Estimation

**What:** Estimates background noise level over time.

**How:** Use `audio_rms.json`. For each 1-second window, use the lowest RMS values to estimate the quieter/background part and store the median as the local noise estimate.

**Output:** `noise.json`

## 6. Shot Detection

**What:** Finds points where the camera view changes significantly.

**How:** Use Media3 `FrameExtractor` to sample frames, compare nearby frames using OpenCV image differences, and create shots from detected visual changes.

**Output:** `shots.json`

## 7. Useful Keyframes

**What:** Finds one useful representative timestamp for each shot.

**How:** Sample a few frames inside each shot, measure sharpness, select the best frame, and store only its timestamp. No keyframe image files are stored.

**Output:** `keyframes.json`

## 8. YOLO Object Detection

**What:** Finds visible objects throughout the video at regular time intervals.

**How:** Run a configurable mobile YOLO model every `X` milliseconds. Extract a frame at each sample time, detect objects, and store the object name, confidence, four bounding-box corner points, and associated start/end time interval. YOLO is independent of keyframes.

**Output:** `yolo.json`

## Output Structure

```text
output/<video-name>/
├── video_metadata.json
├── transcript.json
├── audio_rms.json
├── silence.json
├── noise.json
├── shots.json
├── keyframes.json
└── yolo.json
```

These are the raw analysis results. A later step can combine them into `AnalysisResult` for subtitles, clip selection, search, and editing.

## Main Dependencies

- Media3 Inspector — media metadata and frame extraction
- Media3 / Android media APIs — audio extraction and decoding
- `whisper.cpp` — local speech-to-text
- OpenCV — frame comparison and sharpness measurement
- Mobile YOLO model/runtime — object detection
