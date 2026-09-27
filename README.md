# Creator AI Studio

Creator AI Studio is a browser-based creator workspace. Its **local demo** supports creator setup, sample discovery, a reference-based content blueprint with approve/discard controls, persistent projects, and import/playback/trim/export of your own video. A blueprint and a real video can now live in the **same project**; generating a blueprint does **not** analyze or automatically edit the video.

## Run the local product

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints (normally http://127.0.0.1:5173). No API keys or backend are required for the **local** journey. Choose **Enter sample demo workspace** at onboarding for a deterministic, explicitly labeled sample creator, reference, storyboard, and text-only blueprint project. Alternatively, enter your own name and leave source URLs blank for a local profile. Projects and storyboards are in browser storage; imported video files are in that browser's IndexedDB. Use the same browser/profile after refresh. Large files may exceed browser storage quotas. Chrome supports the tested trimmed WebM export; untrimmed export downloads the original media file.

## Demo walkthrough

1. Choose **Enter sample demo workspace**. On Home open its blueprint project. Alternatively create one via Creator Intelligence → search `AI` → add a sample video/reel to Storyboard → Build Template → preview, **Apply** or **Discard** a Copilot revision → Final → Save to Project.
2. In the Home project review, choose **Attach video to this project → Edit**, and pick a real, playable video. The editor displays the same project and blueprint alongside that source. Refresh and reopen the Home card to verify both remain attached.
3. Choose **Propose opening cut** (the initial range is derived only from blueprint duration, not footage analysis). Adjust Start/End to fit your video. **Preview proposed cut** then press Play; **Apply cut** or **Discard**. Changing the Cut panel also creates a proposal rather than silently changing the export range.
4. Export → Render & Export → preview/download. Refresh and reopen the project to verify the applied range and media persist. Exported file bytes are downloaded, **not saved in Projects**. A full-range export is the original file; a trimmed export is recorded as WebM in supporting browsers. Blueprint scenes, captions, music and other editor decorations do not appear in the export.
5. Reverse route: Create → Edit a Video → import → **Create a content blueprint for this project** → select a sample discovery reference → Build Template → save. The blueprint is added to the same video project, not a second project.
6. Optional: Media Intelligence → sample video → sample analysis and suggestions → approve a review draft. The saved draft is a plan, not a rendered clip. Use Exit to return to the app.

## Optional services

The optional intelligence service now lives at `backend/intelligence/`. To enable source profiling, scans and URL clip *text suggestions*, run from the repository root:

```bash
python3 -m pip install -r backend/intelligence/requirements.txt
python3 backend/intelligence/run.py
```

It defaults to port 8001; Vite proxies `/legacy/*` there. External integrations need their own configured credentials/providers and may fall back to synthetic data; outputs are **not verified media analysis or published clips**. Never share or commit API keys. `VITE_LEGACY_API_BASE_URL` can override the proxy base for other deployments. See `backend/intelligence/README.md` for storage and configuration.

The separate `backend/app/` is a fixture API with an optional OpenAI connection; it is not used by the main user journey and does not perform NPU or Office Kit inference. If running it separately through `backend/run_backend.py`, its `/api` proxy targets port 8000; do not confuse fixture responses with device measurements.

## Verify

```bash
npm run build
node --test src/features/creator-intelligence/tests/*.test.mjs
node --test src/shared/services/projectOperations.test.mjs
python3 -m pytest -q backend/test_api.py  # requires backend Python dependencies
# Separately, from backend/intelligence: python3 -m pytest -q test_service.py
```

There is no browser automation test suite checked into this repository. Publishing, real transcript/scenes from an uploaded video, actual AI generation and hardware inference are not part of the verified local flow. Sample recommendations and the local blueprint generator are template-based; review all claims before using them publicly.

Browser-recorded trimmed WebM may play without finite duration metadata in some players. The app saves trim settings and the name of the last locally rendered file, not the exported bytes; keep the downloaded file yourself. Browser Back does not traverse in-app screens, and refresh returns to Home, where the project can be reopened.
