# Silence Detection

## Purpose

Find sections of the video where the audio level stays very low.

## Input

`audio_rms.json`

## What We Need

- silence start time
- silence end time

## Implementation

Use the RMS windows produced by the RMS feature.

Mark a window as silent when its RMS value is below the configured silence threshold.

Combine consecutive silent windows into one continuous silence interval.

Ignore very short silent intervals below the minimum silence duration.

No AI model is required.

## Output

`silence.json`

Example:

```json
{
  "intervals": [
    {
      "startMs": 3200,
      "endMs": 4800
    },
    {
      "startMs": 9100,
      "endMs": 10300
    }
  ]
}
```

## Failure Handling

If there is no audio track or no RMS data, return an empty result.
