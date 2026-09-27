# Static Analysis Implementation

## Purpose

Define how the static-analysis features work together.

Each feature has its own implementation and output file.

## Project Structure

/docs
├── features.md
├── implementation.md
└── static-analysis
    ├── video_metadata.md
    ├── transcript.md
    ├── rms.md
    ├── silence.md
    ├── noise.md
    ├── shots.md
    ├── keyframes.md
    └── yolo.md

input.tsx

processing.tsx

/static-analysis
├── video_metadata.tsx
├── transcription.tsx
├── rms.tsx
├── silence.tsx
├── noise.tsx
├── shots.tsx
├── keyframes.tsx
└── yolo.tsx

/output/<video-name>
├── video_metadata.json
├── transcript.json
├── audio_rms.json
├── silence.json
├── noise.json
├── shots.json
├── keyframes.json
└── yolo.json

## Processing Flow

input.tsx
→ user selects video
→ processing.tsx starts analysis
→ static-analysis features process the video
→ each feature writes its own JSON output
→ processing completes
→ output files are available for later features

## Feature Dependencies

Video
→ Video Metadata

Audio
→ RMS
→ Silence
→ Noise

Audio
→ Transcription

Video
→ Shots
→ Keyframes

Video
→ YOLO

## Reuse Existing Results

Do not repeat expensive processing when an existing analysis result can be reused.

Examples:

RMS → Silence

RMS → Noise

Shots → Keyframes

YOLO → independent periodic video analysis

Keyframes and YOLO are separate features.

## Time Representation

Use `startMs` and `endMs` for time intervals.

Use `timestampMs` only when representing a single point in time.

## Output Rule

Each feature writes only its own JSON file.

Do not mix unrelated feature data into another feature's output.

## Processing Errors

One feature failing should not corrupt the other feature outputs.

The processing page should report which feature failed.

Successful feature results should remain available.
