# Creator Intelligence service

This is a source-only copy of the Python creator intelligence service previously under `legacy/Creator-AI-Creative-Intelligent-Studio/`. It lives alongside the unrelated `backend/app/` fixture API; it does **not** import that fixture app. `/profiling`, `/dashboard`, `/trends`, `/intelligence`, and `/clipping/*` are used by the frontend through Vite's `/legacy` proxy. The optional `/publish` endpoint should not be treated as verified external publication.

From the repository root:

```bash
python3 -m pip install -r backend/intelligence/requirements.txt
python3 backend/intelligence/run.py
```

Defaults to port **8001**. Set `PORT=...` to override it. Copy only the values you need into a local `backend/intelligence/.env` (never commit that file). Without keys and external providers, several routes return templates or fallbacks rather than measured intelligence. The default database is local SQLite under `backend/intelligence/data/`; creator profile files go under `backend/intelligence/creators/`. Neither data nor credentials were copied from the legacy checkout.

`backend/run_backend.py` remains the separate, experimental `/api/*` fixture service on port 8000. Its responses are not hardware measurements. There is no need to run it for the main UI workflow.

Smoke test the service independently from the fixture app (both packages are named `app`):

```bash
cd backend/intelligence
python3 -m pytest -q test_service.py
```
