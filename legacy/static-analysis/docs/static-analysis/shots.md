# Shot Detection

## Purpose

Find the parts of the video where the camera view changes significantly.

A shot is one continuous visual scene between two detected changes.

## Input

Input video.

## What We Need

- shot ID
- shot start time
- shot end time

## Implementation

Use FFmpeg's `scdet` scene-change filter on frames sampled at approximately 30 frames per second, before resizing. When `scdet` reports a score at or above its configured threshold, treat the frame timestamp as a cut candidate. The project threshold `SHOT_DIFF_THRESHOLD` defaults to `0.30`; it is calibrated to FFmpeg's score scale so `0.30` maps to an `scdet` threshold of `10.0`.

Cut candidates within 400 ms of the previous accepted boundary are merged by retaining the earlier boundary. The sample interval is configurable with `SHOT_SAMPLE_INTERVAL_MS` (default `33` ms).

Frames are then resized to 160 × 90 and converted to grayscale. Their sharpness is measured incrementally to choose one useful keyframe timestamp per shot. Keyframe images are not saved. FFmpeg attaches the scene score and timestamp to detected frames and reports them when the threshold is reached.

## Output

`shots.json`

Example:

```json
{
  "shots": [
    {
      "id": 1,
      "startMs": 0,
      "endMs": 8200
    },
    {
      "id": 2,
      "startMs": 8200,
      "endMs": 15400
    },
    {
      "id": 3,
      "startMs": 15400,
      "endMs": 23100
    }
  ]
}
```

Each shot represents one continuous visual section of the video.

## Failure Handling

If frames cannot be extracted, return an empty result for this feature.
