# Brainrot Feed

Turns a topic into a vertical (9:16) short with a voiceover and burned-in captions,
rendered by the optional local **MoneyPrinterTurbo** engine.

## Run it

```bash
# one-time: install the engine (vendored copy, gitignored)
npm run mpt:setup

# terminal 1: the render engine (http://127.0.0.1:8080)
npm run mpt:server

# terminal 2: the app
npm run dev -- --host 127.0.0.1
```

Then **Create → Brainrot Feed**. Finished renders also appear on **Home** as an
**AI Shorts** gallery strip (it hides itself when the engine is offline), and
inside the feed as the **Gallery** row.

## How it is wired

- `api.ts` is a typed client for the engine. Requests go to `/mpt/*`, which
  `vite.config.ts` proxies to `http://127.0.0.1:8080`. Override the prefix with
  `VITE_MPT_API_BASE_URL`.
- `BrainrotFeedView.tsx` uploads clips, creates a render task, polls
  `/api/v1/tasks/{id}`, and plays the finished MP4.
- The engine accepts server-side local clip filenames, so the flow is: upload a
  clip once, select it, generate.
- The gallery reads `GET /api/v1/gallery`.

## Local engine patch (re-apply after a re-clone)

The engine's task store is in memory, so `/api/v1/tasks` forgets every render
when the service restarts. To show **previous** videos safely, this repo adds a
small read-only route that scans the task directory instead:

- `MoneyPrinterTurbo/app/controllers/v1/gallery.py` (new)
- `MoneyPrinterTurbo/app/router.py` (registers `gallery.router`)

`GET /api/v1/gallery` returns `{items: [{task_id, file, url, subject, script,
voice_name, size, created_at}]}`, newest first, where `url` is a relative
`/tasks/<task_id>/<file>` path. Intermediate `*TEMP*` files and placeholders
under 10 KB are skipped. It reads `script.json` next to each render for the
topic and script.

`MoneyPrinterTurbo/` is gitignored, so this patch is **not** in version control.
If the engine is re-cloned or updated, re-apply these two files.

## Honest limits

- Rendering runs on the local engine process, not in the browser. If it is
  offline the screen says so.
- Edit `MoneyPrinterTurbo/config.toml` to set an LLM key if you want the engine
  to write the script from the topic. Paste a script to skip that entirely.
- Voices are free Microsoft Edge TTS voices. Character/celebrity voice cloning
  is not available offline and is not shipped here.
- `vite.config.ts` ignores `MoneyPrinterTurbo/**` in the file watcher because the
  engine's Python `.venv` exceeds the OS inotify limit and crashes the dev server.
