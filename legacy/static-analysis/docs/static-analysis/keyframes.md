# Useful Keyframes

## Purpose

Find one useful representative timestamp for each detected shot.

The actual image is not stored.

## Input

- `shots.json`
- input video

## What We Need

- shot ID
- selected frame timestamp

## Implementation

For each shot:

1. Select a few candidate timestamps between the shot start and end.
2. Use Media3 `FrameExtractor` to extract a frame at each candidate timestamp.
3. Resize the frame to a small working size.
4. Measure frame sharpness using the variance of the image Laplacian.
5. Select the sharpest candidate frame.
6. Store only its timestamp.

No image files are created.

## Output

`keyframes.json`

Example:

```json
{
  "keyframes": [
    {
      "shotId": 1,
      "timestampMs": 3200
    },
    {
      "shotId": 2,
      "timestampMs": 9100
    }
  ]
}
```

## Failure Handling

If no frame can be extracted for a shot, skip that shot.

If no keyframes can be found, return an empty `keyframes` array.
