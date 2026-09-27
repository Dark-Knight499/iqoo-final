# Noise Estimation

## Purpose

Estimate the background noise level of the video's audio over time.

## Input

- `audio_rms.json`

## What We Need

- start time
- end time
- estimated background noise level

## Implementation

Use the RMS windows produced by the RMS feature.

For each 1-second output window:

1. Take the RMS values that fall inside that window.
2. Sort those RMS values from lowest to highest.
3. Use the lower 10% of the values to represent the quieter/background part of the audio.
4. Calculate the median of those values.
5. Store that median as `noiseRms` for the 1-second window.

This gives a simple local estimate of the background noise level without using an AI model.

A higher `noiseRms` means a higher estimated background noise level for that time window.

## Output

`noise.json`

Example:

```json
{
  "windows": [
    {
      "startMs": 0,
      "endMs": 1000,
      "noiseRms": 0.012
    },
    {
      "startMs": 1000,
      "endMs": 2000,
      "noiseRms": 0.015
    },
    {
      "startMs": 2000,
      "endMs": 3000,
      "noiseRms": 0.041
    }
  ]
}
```

Each `noiseRms` value represents the estimated background noise level for its `startMs` to `endMs` interval.

## Failure Handling

If there is not enough RMS data for a window, set `noiseRms` to `null`.

If the video has no audio track, return an empty `windows` array.
