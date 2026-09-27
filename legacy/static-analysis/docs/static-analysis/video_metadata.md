# Video Metadata

## Purpose

Read basic information from the input video without processing the whole video.

## Input

Input video URI.

## What We Need

- duration
- width
- height
- FPS
- orientation
- video format
- audio format

## Implementation

Use Android media APIs.

Use Media3 Inspector `MetadataRetriever` for high-level media metadata and track information.

Use the video track format to read:
- width
- height
- FPS
- video MIME type

Use the audio track format to read:
- audio MIME type

Read rotation/orientation metadata when available.

## Output

`video_metadata.json`

Example:

```json
{
  "durationMs": 125430,
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "orientation": "landscape",
  "rotation": 0,
  "videoFormat": "video/avc",
  "audioFormat": "audio/mp4a-latm"
}
```

## Failure Handling

If a metadata field is unavailable, store `null`.

Do not guess missing values.
