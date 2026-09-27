# YOLO Object Detection

## Purpose

Detect objects throughout the video at regular time intervals.

## Input

- input video
- configurable sampling interval

## What We Need

For every sampled time interval:

- start time
- end time
- object name
- confidence
- four bounding-box corner points

## Sampling

Run detection every `X` milliseconds.

Examples:

- `2000` → one detection every 2 seconds
- `3000` → one detection every 3 seconds
- `5000` → one detection every 5 seconds

The sampling interval is configurable.

## Implementation

1. Get the video duration.
2. Generate time intervals using the configured sampling interval.
3. Use Media3 `FrameExtractor` to extract a frame at the start of each interval.
4. Run YOLO object detection on the extracted frame.
5. For every detected object:
   - get its class name
   - get its confidence
   - get its bounding box
   - convert the bounding box into the four corner points
   - store the interval start and end time
6. Continue until the end of the video.

The model is evaluated on the sampled frame. `startMs` and `endMs` define the time interval associated with that sampled detection.

## Output

`yolo.json`

Example:

```json
{
  "sampleIntervalMs": 2000,
  "detections": [
    {
      "startMs": 0,
      "endMs": 2000,
      "objects": [
        {
          "name": "person",
          "confidence": 0.94,
          "box": {
            "x": {
              "x": 214,
              "y": 778
            },
            "y": {
              "x": 214,
              "y": 96
            },
            "z": {
              "x": 626,
              "y": 96
            },
            "t": {
              "x": 626,
              "y": 778
            }
          }
        }
      ]
    }
  ]
}
```

## Bounding Box

The four points use this order:

- `x` = bottom-left
- `y` = top-left
- `z` = top-right
- `t` = bottom-right

All point coordinates are pixels relative to the original video frame.

## Failure Handling

If a frame cannot be extracted, skip that interval.

If YOLO fails for one interval, continue processing the remaining intervals.

If no objects are detected in an interval, store an empty `objects` array.

If no objects are detected in the entire video, return an empty `detections` array.
