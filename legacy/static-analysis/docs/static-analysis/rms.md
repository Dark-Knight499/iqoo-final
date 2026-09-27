# RMS / Volume

## Purpose

Measure audio loudness level over time.

## Input

Decoded audio from the input video.

## What We Need

- audio window start time
- audio window end time
- RMS value

## Implementation

Decode the audio into PCM samples.

Split the PCM audio into fixed-size time windows.

For each window, calculate:

RMS = sqrt(mean(sample²))

A higher RMS value means a higher audio signal level for that window.

No AI model is required.

## Output

`audio_rms.json`

Example:

```json
{
  "windows": [
    {
      "startMs": 0,
      "endMs": 100,
      "rms": 0.031
    },
    {
      "startMs": 100,
      "endMs": 200,
      "rms": 0.084
    }
  ]
}
```

Each RMS value represents the audio between `startMs` and `endMs`.

## Failure Handling

If the video has no audio track, return an empty result for this feature.
