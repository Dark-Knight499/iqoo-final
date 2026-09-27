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

Then **Create → Brainrot Feed**.

## How it is wired

- `api.ts` is a typed client for the engine. Requests go to `/mpt/*`, which
  `vite.config.ts` proxies to `http://127.0.0.1:8080`. Override the prefix with
  `VITE_MPT_API_BASE_URL`.
- `BrainrotFeedView.tsx` uploads clips, creates a render task, polls
  `/api/v1/tasks/{id}`, and plays the finished MP4.
- The engine accepts server-side local clip filenames, so the flow is: upload a
  clip once, select it, generate.

## Honest limits

- Rendering runs on the local engine process, not in the browser. If it is
  offline the screen says so.
- Edit `MoneyPrinterTurbo/config.toml` to set an LLM key if you want the engine
  to write the script from the topic. Paste a script to skip that entirely.
- Voices are free Microsoft Edge TTS voices. Character/celebrity voice cloning
  is not available offline and is not shipped here.
- `vite.config.ts` ignores `MoneyPrinterTurbo/**` in the file watcher because the
  engine's Python `.venv` exceeds the OS inotify limit and crashes the dev server.
