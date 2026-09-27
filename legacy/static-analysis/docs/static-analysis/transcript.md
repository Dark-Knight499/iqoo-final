# Transcription

## Purpose

Convert speech in the video into text with timestamps.

## Input

Audio extracted from the input video.

## What We Need

- transcript text
- segment start timestamp
- segment end timestamp
- word timestamps

## Implementation

Use `whisper.cpp` locally on the device.

Use the `ggml-small.bin` Whisper model.

Process the audio in chunks and rebase timestamps to the original video timeline.

Enable word-level timestamps because subtitles and later editing features need to know when individual words are spoken.

## Output

`transcript.json`

Example:

```json
{
  "segments": [
    {
      "startMs": 1200,
      "endMs": 4200,
      "text": "This is my video",
      "words": [
        {
          "word": "This",
          "startMs": 1200,
          "endMs": 1450
        },
        {
          "word": "is",
          "startMs": 1450,
          "endMs": 1550
        }
      ]
    }
  ]
}
```

## Failure Handling

If transcription fails, return an error for this feature and do not create fake transcript data.
