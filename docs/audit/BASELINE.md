# Repository baseline — 2026-09-27

Snapshot of the **root** checkout `/home/harry/_builds_/iqoo`, before any implementation or integration. This document records observed local state; remote refs were inspected locally, not fetched. No existing changes were staged or altered.

## Git identity and status

- Current branch: `main`, tracking `origin/main` (same commit locally).
- Current commit: `5e5a131366c914c98a1a48cb57109c245e1df671`.
- Initial `git status --porcelain=v1 -uall`: **31 modified tracked files, 106 untracked files, 0 staged files** (137 entries total). The checkout was dirty before this audit.
- Modified tracked files: `src/App.tsx`, `vite.config.ts`; `src/features/{creator-intelligence,home,insights,media-intelligence,onboarding,profile}/` (10 files); `src/shared/{state,types}/` (2 files); and 17 files under `legacy/Creator-AI-Creative-Intelligent-Studio/` including backend routers/services/models, README, `.gitignore`, Compose, and `test_endpoints.py`. Consult `git status --short` for the exact live list.
- Untracked: the complete `backend/` tree (including Python source and `__pycache__/*.pyc`), `src/services/{apiClient,legacyBackend}.ts`, `src/vite-env.d.ts`, additional legacy backend models/routers/services, legacy frontend files and `package-lock.json`, legacy docs/clipping/creator reports/tests. New audit files will also appear untracked after this snapshot.

## Branches and worktrees

| Worktree | Checkout / commit | Initial state |
| --- | --- | --- |
| `/home/harry/_builds_/iqoo` | `main` / `5e5a131` | Dirty; details above |
| `/home/harry/_builds_/iqoo-dynamic-editor` | `feature/dynamic-editor` / `8a38715` | Clean |
| `/home/harry/_builds_/iqoo-recording-teleprompter` | `feature/recording-teleprompter` / `97bae48` | Clean |
| `/home/harry/_builds_/iqoo-static-analysis` | `feature/static-analysis` / `5e5a131` | Dirty: package/config/media-intelligence edits, untracked analyzer integration and `legacy/static-analysis/` |
| `/home/harry/_builds_/iqoo-worktree` | detached / `5e5a131` | Clean |

Local branches: `main`, `feature/dynamic-editor`, `feature/recording-teleprompter`, `feature/static-analysis`. Locally known remote branches: `origin/main` (`5e5a131`), `origin/studio` (`8cc4a72`), `creator-backend/main` (`a67010c`). Remotes are `origin` (iqoo-final) and `creator-backend` (Creator-AI-Creative-Intelligent-Studio). `origin/studio` is an ancestor; `creator-backend/main` has no merge base with root `main`. The legacy backend directory itself contains a separate `.git` on its own `main` at `a67010c` and has two modified files; do not confuse its Git status with the parent's. The static-analysis worktree contains another dirty nested Git clone under `legacy/static-analysis/`.

## Repository structure / entry points

| Location | What is present |
| --- | --- |
| `index.html` → `src/main.tsx` → `src/App.tsx` | Root React/TypeScript Vite SPA, modal/tab navigation |
| `src/features/`, `src/shared/`, `src/ai/`, `src/utils/`, `src/services/` | UI features, localStorage-backed stores, simulated AI helpers, browser utilities, root API clients |
| `public/` | Static frontend assets |
| `backend/run_backend.py` → `backend/app/main.py` → `backend/app/api/endpoints.py` | **Untracked** second FastAPI service, `/api` routes; mock fixtures in `backend/app/mock_data/fixtures.py` |
| `legacy/Creator-AI-Creative-Intelligent-Studio/run.py` → `app/main.py` | Separately runnable legacy FastAPI service, `/profiling`, `/dashboard`, `/trends`, `/intelligence`, `/clipping`, `/publish`; PostgreSQL/SQLite and disk storage |
| `legacy/Creator-AI-Creative-Intelligent-Studio/index.html` → `src/main.tsx` | Additional, untracked legacy Vite frontend in nested directory |
| `legacy/creator-ai-frontend-demo-with-assets/` | Demo/design assets |
| `docs/init.md` | Product brief, not a verified implementation inventory |

## Package managers, build, test, lint/typecheck

- Root: npm (`package-lock.json`), `npm ci`, `npm run dev` (Vite), `npm run build` (`tsc && vite build`), `npm run preview`. Typecheck alone: `npm exec -- tsc --noEmit --incremental false`. Root `package.json` has **no** `test`, `lint`, or separate `typecheck` script.
- Untracked root `backend/`: Python pip (`python3 -m pip install -r backend/requirements.txt`); `python3 backend/run_backend.py` runs Uvicorn on port 8000; `python3 -m pytest backend/test_api.py` or `python3 backend/test_api.py` exercises its fixture-based API. No declared backend build/lint/typecheck scripts.
- Legacy backend: Python pip (`legacy/Creator-AI-Creative-Intelligent-Studio/requirements.txt`); from that directory `python3 run.py`, or `docker compose up -d` for FastAPI + PostgreSQL; `python3 test_endpoints.py` and additional `test_*.py` files. Run these from the legacy directory because `app` imports and paths are local. Tests may access external services or write reports; not executed for baseline.
- Untracked legacy Vite frontend: npm and its own `package-lock.json`; `npm run dev`, `npm run build` (`vite build`, **without** TypeScript check), `npm run preview`. No test/lint scripts observed.

## Environment / configuration

- Root development proxy in `vite.config.ts`: `/api` and `/ws` → `localhost:8000`. Root `src/services/legacyBackend.ts` uses `VITE_API_BASE_URL` or **direct** `http://localhost:8000`, not the Vite `/api` proxy. Both Python services default to port **8000**, but expose different URL namespaces; choose the appropriate backend per feature. This also matters when visiting from a phone: browser `localhost` refers to the phone.
- Root JS needs Node/npm compatible with Vite 5 and TypeScript 5; no pinned Node version was found. Local Python needs Python 3 and dependencies from each backend's `requirements.txt`.
- `backend/app/api/endpoints.py` imports `dotenv` and `openai`, but `backend/requirements.txt` lists only `fastapi`, `uvicorn`, `pydantic`, `websockets`; those two imports require separately supplied packages. `OPENAI_API_KEY` optionally enables its cloud-call paths; missing/failed calls use fixtures. It does not provide actual NPU integration.
- Legacy backend reads `legacy/Creator-AI-Creative-Intelligent-Studio/.env` via `app/config.py`; **do not copy secrets into docs**. Refer to `.env.example` for `HOST`, `PORT`, `DEBUG`, `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `DEFAULT_LLM_MODEL`, `GEMINI_API_KEY`, `COMPOSIO_API_KEY`, `COMPOSIO_ENTITY_ID`, `YOUTUBE_API_KEY`, `TWITTER_BEARER_TOKEN`; Compose additionally passes `APIFY_API_KEY`, `BRIGHT_DATA_API_KEY`. Compose provisions PostgreSQL 16 on 5432; service code can fall back to SQLite in `data/`. Clipping can contact optional `ON_DEVICE_VLM_ENDPOINT` (default `http://localhost:8080/v1`).
- Browser localStorage holds theme/onboarding/creator/projects/assets; camera/microphone require permission and a secure browser context. No root authentication configuration or worker process was found.

## Obvious baseline risks

1. Existing main work is uncommitted, including **the entire root backend**; rebuilding from `main` alone omits it.
2. Two incompatible servers compete for port 8000; root `/api` proxy targets the fixture backend while onboarding/insights/intelligence/clipping call the legacy backend directly.
3. First-run onboarding requires the legacy `/profiling` route to succeed; root fixture backend does not implement it.
4. Demo values and simulated AI/media paths can look like actual processing. Nested repositories and dirty feature worktrees require independent review before any integration.
5. The legacy `.env` exists locally and is ignored; treat values as private. Tests that instantiate the legacy app may create files or use external services.
