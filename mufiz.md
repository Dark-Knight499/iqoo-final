# Mufiz branch

## Work in this branch

- Added an upload-only clipping flow; removed YouTube URL analysis.
- Uses local audio/scene signals to find candidate moments and OpenAI frame analysis for titles, captions, hooks, and visual assessments.
- Added clip-range preview and MP4 download for each selected segment.
- Added clipping entry points to the app and strengthened the prompt to keep generated text grounded in the available frame/transcript.
- Configure `OPENAI_API_KEY` in the repository root `.env`. Keep `.env` out of commits.

## Merge into `main`

Commit the branch work on `mufiz` first, then merge and push:

```bash
git switch mufiz
git add -A
git commit -m "Add upload-based AI clipping"
git fetch origin
git switch main
git pull --ff-only origin main
git merge --no-ff mufiz
# Resolve conflicts if Git reports any, then commit the resolution.
git push origin main
```
