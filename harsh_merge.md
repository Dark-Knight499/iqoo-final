# Harsh Branch & Repository Merge Assessment (`harsh_merge.md`)

**Generated Date:** September 27, 2026  
**Author / Creator:** Harsh Jain (`harshrajivjain10@gmail.com`)  
**Active Branch:** `harsh`  
**Base Commit:** `441143a` (*feat(camera-reels): ensure camera always opens, integrate user.md/hook.md idea workflow, and add reels safe zone overlays*)  
**Repository Working Directory:** `/home/harry/_builds_/iqoo`

---

## 1. Executive Summary

The `harsh` branch consolidates and reviews the comprehensive work done across the Creator AI Studio repository. This document provides a complete audit of all branches, worktrees, features, backend services, and uncommitted modifications across the codebase.

### Current Git Topology & Identity
* **Current Working Branch:** `harsh` (created directly from `main` at `441143a`).
* **Origin Remote (`origin`):** `git@github.com:Dark-Knight499/iqoo-final.git`
  * `origin/main` is at `eac7eed` (local `main` and `harsh` are ahead by 1 commit: `441143a`).
  * `origin/studio` is at `8cc4a72` (*feat: initialize Creator AI Studio mobile architecture per INIT.md*).
* **Creator Backend Remote (`creator-backend`):** `git@github.com:Raiyyanpatel/Creator-AI-Creative-Intelligent-Studio.git`
  * `creator-backend/main` is at `a67010c` (*fix(clipping): zero-dependency Python http.server for iqoo_smolvlm_server*).
  * Has an independent root commit (`b182f7b`) integrated into the root repo under `backend/intelligence/`.
* **Local Git Worktrees:**
  1. `/home/harry/_builds_/iqoo` (`harsh`, previously `main` @ `441143a`)
  2. `/home/harry/_builds_/iqoo-dynamic-editor` (`feature/dynamic-editor` @ `8a38715`)
  3. `/home/harry/_builds_/iqoo-recording-teleprompter` (`feature/recording-teleprompter` @ `97bae48`)
  4. `/home/harry/_builds_/iqoo-static-analysis` (`feature/static-analysis` @ `5e5a131`, has uncommitted modifications)
  5. `/home/harry/_builds_/iqoo-worktree` (detached HEAD @ `5e5a131`)

---

## 2. Inventory of "The Things and Files"

### 2.1. Frontend Architecture (`src/`)

| Feature Module | Primary Components / Files | Key Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Home Command Center** | `src/features/home/HomeView.tsx` | Greeting, project carousel, quick action tiles (Camera, Editor, Script, Intelligence), recent project review modal, and **AI Shorts Gallery** strip. |
| **Creator Intelligence** | `src/features/creator-intelligence/` | Multi-creator profile dossier system (`mockCreators.ts`), semantic content discovery (`mockContent.ts`), interactive Storyboard (`StoryboardSheet.tsx`), template builder, Copilot revision proposals, and workspace data segregation. |
| **Media Intelligence** | `src/features/media-intelligence/` | Full static and dynamic analysis suite. Inspects audio RMS energy, silence segments, speech transcript, video shots/keyframes, and YOLO object detections (`contracts.ts`, `staticAnalysisService.ts`, `dynamicAssistantService.ts`, `ContentAnalysisScreen.tsx`). |
| **Dynamic Video Editor** | `src/features/editor/` (`page.tsx`, `Timeline.tsx`, `AudioPanel.tsx`, `CaptionPanel.tsx`, `EffectsPanel.tsx`, `ReframePanel.tsx`) | Real-time video player with WebGL GPU fragment shaders (Monochrome, Warm Sunset, Cyberpunk, Film Grain, Vignette, Exposure/Contrast/Saturation tuning), interactive multi-track timeline, captions, and audio gain. |
| **Recording & Camera Assist** | `src/features/recording/RecordingView.tsx` | Front/back camera switching, fallback simulation mode for headless environments, Reels/Shorts 9:16 safe zone overlays (UI margins, profile avatar, description, audio pill), and prompt/hook script prompter. |
| **Teleprompter** | `src/features/teleprompter/TeleprompterView.tsx` | Variable-speed auto-scrolling teleprompter with font size adjustment and mirrored mode for glass reflection mounts. |
| **Brainrot Feed (AI Shorts)** | `src/features/brainrot/` (`BrainrotFeedView.tsx`, `api.ts`) | TikTok/Reels vertical feed player hooked up to local Python `MoneyPrinterTurbo` render engine. Video card poster frame seeking (`#t=0.5`), audio mute toggle, progress bars, and batch generation trigger. |
| **Video Import & Analysis** | `src/features/create/VideoImportAnalysis.tsx` | Post-import validation screen with canvas-based frame-difference scene change detection, hook retention scoring, and one-tap handoff to editor or script generator. |
| **Asset Catalog** | `src/features/assets/` (`AssetsView.tsx`, `assetCatalog.ts`, `public/assets/catalog/*.svg`) | Vector design overlays (Focus Frame, Glow Ring, Midnight Glow, Obsidian Grid, Porcelain, Soft Spotlight) for video framing. |
| **Export Engine** | `src/features/export/ExportModal.tsx`, `src/utils/export.ts` | Multi-resolution WebM client-side MediaRecorder pipeline and server-side FFmpeg export integration. |
| **Shared Stores & Services** | `src/shared/state/` (`project.store.ts`, `creator.store.ts`, `app.store.ts`), `src/utils/files.ts` | Reactive Zustand/custom stores, IndexedDB video blob persistence (`files.ts`), workspace switching and blueprint models. |

---

### 2.2. Backend & Runtime Engines (`backend/`, `server/`, `legacy/`)

The repository contains distinct backend services, consolidated on the `harsh` branch:

1. **Dynamic Editor Node Engine (`server/`)**:
   * Entry point: `server/index.mjs`
   * Engine: `server/engine.mjs` (Tested via `server/engine.test.mjs`)
   * Features: Node HTTP server on port 4173/4175 handling video upload, byte-range streaming, canvas frame rendering, and server-side FFmpeg trimming/denoising.

2. **Core API Backend (`backend/app/`)**:
   * Entry point: `backend/run_backend.py` (`app/main.py`)
   * Endpoints: `backend/app/api/endpoints.py`
   * Features: FastAPI service on port 8000 providing `/api/health`, `/api/projects`, `/api/pipeline/{id}`, `/api/world3d/{id}`, `/api/agent/chat`, `/api/repurpose/{id}`, and `/api/officekit/status`. (All 7 endpoints pass via `backend/test_api.py`).

3. **Platform Intelligence & Clipping Engine (`backend/intelligence/`)**:
   * Origin: Raiyyan Patel's `creator-backend/main`.
   * Entry point: `backend/intelligence/run.py`
   * Routers: `clipping`, `dashboard`, `intelligence`, `profiling`, `publish`, `trends`.
   * Integrations: Composio v3 SDK, Apify scrapers, YouTube Data API v3, Twitter API v2, PostgreSQL ORM (`db_models.py`), and on-device SmolVLM viral clipping pipeline for Snapdragon 8 Elite / Termux (`smolvlm_service.py`).

4. **Static Video Analysis Runtime (`backend/analysis/` & `legacy/static-analysis/`)**:
   * Engines: Faster-Whisper (speech transcription), YOLOv8 / YOLO26n (`yolo26n.pt`), librosa/scipy audio RMS & silence boundary detectors, OpenCV scene cut analysis.
   * Server: `backend/analysis/server/` and `legacy/static-analysis/server/` providing endpoints for `/api/analyze`, keyframe generation, and dynamic assistant suggestions.

5. **AI Shorts Generator (`MoneyPrinterTurbo/`)**:
   * Local Python pipeline for automated voiceover synthesis (Edge-TTS), Pexels video B-roll fetching, subtitle burning, and short-video composition.

---

## 3. Cross-Branch Comparison & Reconciliation

### What `harsh` Inherits vs Other Branches

```
5e5a131 (feature/static-analysis base)
  ├── 8a38715 (feature/dynamic-editor)
  ├── 97bae48 (feature/recording-teleprompter)
  └── b836687 ─> 1b08fc6 ─> e89eb1c ─> eac7eed ─> 441143a (main -> harsh)
```

| Component / File | `feature/dynamic-editor` (`8a38715`) | `feature/recording-teleprompter` (`97bae48`) | `harsh` (`441143a` + workdir) | Status in `harsh` |
| :--- | :--- | :--- | :--- | :--- |
| `server/index.mjs` & `server/engine.mjs` | Added (first version) | Not present | **Included & enhanced** | Fully incorporated. All unit tests pass. |
| `public/assets/catalog/*.svg` | Added (6 vector SVGs) | Not present | **Included** | Fully preserved in catalog. |
| `src/features/assets/assetCatalog.ts` | Added | Not present | **Included** | Fully preserved. |
| `src/features/create/VideoImportAnalysis.tsx` | Not present | Added (initial scene diff) | **Enhanced with IndexedDB restore & Hook scoring** | Superior implementation on `harsh`. |
| `src/features/recording/RecordingView.tsx` | Base version | Added teleprompter panel | **Enhanced with Reels Safe Zones & Camera Fallbacks** | Superior implementation on `harsh`. |
| `src/features/editor/page.tsx` | Basic canvas trim | Timeline refactoring | **Full WebGL GPU Shaders, LUTs, Audio Controls, Captions** | Canonical implementation on `harsh`. |
| `src/features/brainrot/` | Not present | Not present | **Included with AI Shorts & Feed** | Canonical implementation on `harsh`. |
| `backend/` (App, Intelligence, Analysis) | Not present | Not present | **Integrated in `harsh`** | Consolidated from Raiyyan's backend & static analysis. |
| `docs/dynamic-editor.md` | Present | Not present | Present in branch `feature/dynamic-editor` | Retained as branch documentation. |
| `docs/video-editor-camera-assist.md` | Not present | Present | Present in branch `feature/recording-teleprompter` | Retained as branch documentation. |
| `docs/mobile-static-analysis.md` | Not present | Not present | Present in `iqoo-static-analysis` worktree | Retained for reference on LAN setup. |

---

## 4. Uncommitted Working Changes in `harsh`

The following files are modified/untracked in the working directory on branch `harsh`:
1. `src/features/home/HomeView.tsx`:
   * Adds the **AI Shorts** gallery section on Home. Queries `brainrotEngine.listGallery()` on mount and dynamically displays generated video cards with title, date, and click-to-open feed modal. Automatically hides if engine has no renders.
2. `src/features/brainrot/BrainrotFeedView.tsx`:
   * Appends `#t=0.5` media fragment to `<video>` source URLs so browsers immediately decode and render a non-black poster frame.
3. `src/features/brainrot/README.md`:
   * Documents that finished renders populate both the in-feed Gallery row and the Home command center AI Shorts row.
4. `public/qr.png` & `public/expo-qr.png`:
   * QR codes for instant mobile LAN connection and Expo testing.

---

## 5. Verification & Test Report

1. **TypeScript & Vite Build**:
   ```sh
   npm run build
   # Output: tsc && vite build -> built in 3.14s (0 errors, 1992 modules transformed)
   ```
2. **Node Unit & Integration Tests**:
   ```sh
   node --test src/shared/services/projectOperations.test.mjs src/features/creator-intelligence/tests/*.test.mjs server/*.test.mjs
   # Output: 16 passing, 0 failing, duration: 2.22s
   ```
   * Tested: Server trim/denoise engine, API byte-range streaming, template builder, bookmark persistence, proposal isolation, workspace boundaries, legacy owner migration.
3. **Core Backend Endpoints**:
   ```sh
   python3 backend/test_api.py
   # Output: ALL 7 BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY (health, projects, pipeline, 3d scene, agent chat, repurpose, office kit).
   ```

---

## 6. Recommendations & Canonical Merge Strategy

1. **Keep `harsh` as the Canonical Integration Branch**:
   * Branch `harsh` contains the superset of all major capabilities: dynamic editor, recording teleprompter, WebGL shaders, static analysis, Creator Intelligence, and the unified dark UI.
2. **Commit Working Tree Changes**:
   * Commit the AI Shorts gallery addition in `HomeView.tsx` and the `#t=0.5` video poster frame fix in `BrainrotFeedView.tsx` to `harsh`.
3. **Preserve Isolated Worktrees for Reference**:
   * The worktrees `/home/harry/_builds_/iqoo-dynamic-editor` and `/home/harry/_builds_/iqoo-recording-teleprompter` can be safely kept or retired as their core features have been unified into `harsh`.
4. **Honest Capabilities & Demo Readiness**:
   * All client-side UI flows (Storyboards, Blueprints, Camera Recording, GPU Video Editing, WebM Export) are 100% operational locally with zero required external API keys.
   * External intelligence scrapers (Apify, Composio, Twitter, YouTube) in `backend/intelligence/` remain available for production deployment with credentials.
