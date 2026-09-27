"""OpenAI-backed clipping endpoints for uploaded local videos."""

import shutil
import subprocess
import tempfile
import math
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.models.clipping import ClipAnalysisResponse
from app.services.openai_clipping_service import openai_clipping_service

router = APIRouter(prefix="/clipping", tags=["OpenAI Video Clipping"])


@router.post("/analyze-file", response_model=ClipAnalysisResponse)
def analyze_local_video(
    file: UploadFile = File(...),
    target_duration_seconds: int = Form(45),
    max_clips: int = Form(5),
):
    """Analyze an uploaded local video using FFmpeg signals and GPT-4o mini vision."""
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".mp4", ".mov", ".mkv", ".webm", ".avi"}:
        raise HTTPException(status_code=415, detail="Upload an MP4, MOV, MKV, WebM, or AVI video.")
    if not 15 <= target_duration_seconds <= 90 or not 1 <= max_clips <= 10:
        raise HTTPException(status_code=422, detail="Clip length must be 15–90 seconds and result count 1–10.")

    with tempfile.TemporaryDirectory(prefix="creator-local-video-") as temp_dir:
        video_path = Path(temp_dir) / f"source{suffix}"
        with video_path.open("wb") as destination:
            shutil.copyfileobj(file.file, destination)
        if video_path.stat().st_size == 0:
            raise HTTPException(status_code=422, detail="The uploaded video is empty.")
        try:
            return openai_clipping_service.analyze_local(video_path, file.filename or video_path.name, target_duration_seconds, max_clips)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Local video analysis failed: {exc}") from exc


@router.post("/render-file")
def render_local_clip(
    file: UploadFile = File(...),
    start_seconds: float = Form(...),
    end_seconds: float = Form(...),
):
    """Render and return a trimmed MP4 for download."""
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".mp4", ".mov", ".mkv", ".webm", ".avi"}:
        raise HTTPException(status_code=415, detail="Upload an MP4, MOV, MKV, WebM, or AVI video.")
    if not math.isfinite(start_seconds) or not math.isfinite(end_seconds) or start_seconds < 0 or end_seconds <= start_seconds:
        raise HTTPException(status_code=422, detail="Clip start and end times are invalid.")

    temp_dir = tempfile.TemporaryDirectory(prefix="creator-rendered-clip-")
    temp_path = Path(temp_dir.name)
    source_path = temp_path / f"source{suffix}"
    output_path = temp_path / "clipped-video.mp4"
    try:
        with source_path.open("wb") as destination:
            shutil.copyfileobj(file.file, destination)
        if source_path.stat().st_size == 0:
            raise HTTPException(status_code=422, detail="The uploaded video is empty.")

        subprocess.run(
            [
                "ffmpeg", "-y", "-v", "error", "-ss", str(start_seconds), "-i", str(source_path),
                "-t", str(end_seconds - start_seconds), "-map", "0:v:0", "-map", "0:a?",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac",
                "-movflags", "+faststart", str(output_path),
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=600,
        )
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=422, detail="Could not render the selected clip.")
        return FileResponse(
            output_path,
            media_type="video/mp4",
            filename="clipped-video.mp4",
            background=BackgroundTask(temp_dir.cleanup),
        )
    except HTTPException:
        temp_dir.cleanup()
        raise
    except (subprocess.SubprocessError, OSError) as exc:
        temp_dir.cleanup()
        detail = "Could not render the selected clip."
        if isinstance(exc, subprocess.CalledProcessError) and exc.stderr:
            detail = exc.stderr.strip()[-500:]
        raise HTTPException(status_code=422, detail=detail) from exc


@router.get("/status")
def check_openai_status():
    """Report whether the configured OpenAI model is ready to analyze clips."""
    return openai_clipping_service.openai_status()
