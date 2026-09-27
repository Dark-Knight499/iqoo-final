"""Video clipping analysis using transcripts, FFmpeg signals, and OpenAI vision."""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
import tempfile
import base64
from pathlib import Path
from typing import Any

from dotenv import dotenv_values
from fastapi import HTTPException
from openai import OpenAI

from app.models.clipping import (
    ClipAnalysisResponse,
    ViralClipItem,
    VisualAssessment,
)


class OpenAIClippingService:
    def __init__(self) -> None:
        root_env = dotenv_values(Path(__file__).resolve().parents[4] / ".env")
        self.api_key = (os.getenv("OPENAI_API_KEY") or root_env.get("OPENAI_API_KEY") or "").strip()
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o-mini"

    def openai_status(self) -> dict[str, Any]:
        return {"configured": bool(self.client), "provider": "OpenAI", "model": self.model}

    def analyze_local(self, path: Path, filename: str, target_duration: int, max_clips: int) -> ClipAnalysisResponse:
        self._require_openai()
        duration = self._probe_duration(path)
        peaks = self._local_peaks(path, duration)
        candidates = self._peak_candidates(peaks, duration, target_duration, max_clips)
        clips = self._score_candidates(candidates, path, max_clips)
        return ClipAnalysisResponse(
            status="success", video_title=Path(filename).stem, video_duration=self._timestamp(duration),
            source_type="local_file",
            signals_used=["ffmpeg_audio_rms", "ffmpeg_scene_changes", "gpt_4o_mini_vision"],
            analysis_model=self.model, total_candidates_analyzed=len(candidates), top_viral_clips=clips,
        )

    def _require_openai(self) -> None:
        if self.client is None:
            raise HTTPException(status_code=503, detail="OPENAI_API_KEY is missing from the repository root .env file.")

    def _local_peaks(self, path: Path, duration: float) -> list[dict[str, float]]:
        audio_cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"]
        audio = subprocess.run(audio_cmd, capture_output=True, check=True, timeout=180).stdout
        rms_peaks: list[dict[str, float]] = []
        samples = memoryview(audio).cast("h")
        window = 16000
        all_rms = []
        for offset in range(0, len(samples), window):
            chunk = samples[offset:offset + window]
            if len(chunk):
                rms = math.sqrt(sum(sample * sample for sample in chunk) / len(chunk))
                all_rms.append((offset / 8000, rms))
        maximum = max((rms for _, rms in all_rms), default=0)
        if maximum <= 0:
            raise HTTPException(status_code=422, detail="The video has no measurable audio signal.")
        for second, rms in all_rms:
            score = rms / maximum
            if score >= 0.70:
                rms_peaks.append({"start": max(0, second - 2), "end": min(duration, second + 22), "score": score})

        scene_cmd = ["ffmpeg", "-i", str(path), "-vf", r"fps=10,scale=320:180,select=gt(scene\,0.35),metadata=print", "-f", "null", "-"]
        scene = subprocess.run(scene_cmd, capture_output=True, text=True, check=True, timeout=180)
        scene_peaks = [{"start": max(0.0, float(second) - 3), "end": min(duration, float(second) + 25), "score": 0.88}
                       for second in re.findall(r"pts_time:([0-9.]+)", scene.stderr)[:40]]
        combined = sorted(rms_peaks + scene_peaks, key=lambda point: point["score"], reverse=True)
        peaks = []
        for point in combined:
            center = (point["start"] + point["end"]) / 2
            if all(abs(center - (existing["start"] + existing["end"]) / 2) >= 20 for existing in peaks):
                peaks.append(point)
            if len(peaks) >= 20:
                break
        if not peaks:
            raise HTTPException(status_code=422, detail="No audio or scene-change peaks were detected in the video.")
        return peaks

    def _peak_candidates(self, peaks: list[dict[str, float]], duration: float, target: int, limit: int) -> list[dict[str, Any]]:
        clip_duration = max(15, min(target, 90))
        candidates = []
        for peak in peaks:
            center = (peak["start"] + peak["end"]) / 2
            start = max(0.0, min(center - clip_duration / 2, duration - clip_duration))
            end = min(duration, start + clip_duration)
            if any(abs((item["start"] + item["end"]) / 2 - center) < clip_duration * 0.6 for item in candidates):
                continue
            candidates.append({"start": start, "end": end, "score": peak["score"], "transcript": ""})
            if len(candidates) >= limit:
                break
        if not candidates:
            raise HTTPException(status_code=422, detail="No candidate segments could be formed from the detected peaks.")
        return candidates

    def _score_candidates(self, candidates: list[dict[str, Any]], video_path: Path, limit: int) -> list[ViralClipItem]:
        results = []
        with tempfile.TemporaryDirectory(prefix="openai-frames-") as temp_dir:
            for index, candidate in enumerate(candidates[:limit], start=1):
                frame_path = Path(temp_dir) / f"frame-{index}.jpg"
                command = ["ffmpeg", "-v", "error", "-ss", str(candidate["start"] + min(2.0, (candidate["end"] - candidate["start"]) / 4)), "-i", str(video_path), "-frames:v", "1", "-vf", "scale=384:384:force_original_aspect_ratio=decrease", str(frame_path), "-y"]
                subprocess.run(command, capture_output=True, check=True, timeout=30)
                if not frame_path.is_file() or frame_path.stat().st_size == 0:
                    raise HTTPException(status_code=422, detail=f"Could not extract the analysis keyframe for candidate {index}.")
                with frame_path.open("rb") as frame:
                    image_url = f"data:image/jpeg;base64,{base64.b64encode(frame.read()).decode('ascii')}"
                try:
                    response = self.client.chat.completions.create(
                        model=self.model,
                        temperature=0.2,
                        response_format={"type": "json_object"},
                        messages=[
                            {
                                "role": "system",
                                "content": (
                                    "You are an accurate short-form video editor. Analyze the supplied frame and any supplied transcript, "
                                    "then return one JSON object with exactly these fields: visual_hook_score (number from 0 to 10), "
                                    "facial_expression (brief description of visible people and expressions; if none are clear, describe the scene), "
                                    "face_crop_center_x (number from 0 to 100), active_speaker_identified (boolean), "
                                    "visual_hook_summary (one specific sentence explaining what is visually happening and why it may hold attention), "
                                    "suggested_title (concise, concrete title of 3 to 8 words), suggested_caption (one natural sentence that fits the clip), "
                                    "hashtags (array of 3 to 5 relevant strings), and hook_line (a concise opening line suitable for this clip). "
                                    "Ground every claim in visible evidence or the supplied transcript. The image is a single still frame, not a video: "
                                    "do not claim movement, events, emotions, identities, relationships, dialogue, or outcomes that the evidence does not establish. "
                                    "Do not mention AI, scores, timestamps, uncertainty, or that you are analyzing a frame in the title or caption. "
                                    "Avoid generic descriptions, clickbait, invented quotes, and unsupported superlatives. If the frame and transcript provide "
                                    "too little context for a specific title, use a short neutral description of the visible subject or scene. Return valid JSON only."
                                ),
                            },
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": (
                                            f"Clip time range: {self._timestamp(candidate['start'])} to {self._timestamp(candidate['end'])}. "
                                            f"Local audio/scene signal strength: {candidate['score']:.2f}. "
                                            f"Transcript: {candidate['transcript'] or 'No transcript is available; do not invent speech.'} "
                                            "Use the time range and signal strength only as context; do not include them in viewer-facing text. "
                                            "Describe the frame specifically and keep all generated text faithful to the available evidence."
                                        ),
                                    },
                                    {"type": "image_url", "image_url": {"url": image_url, "detail": "low"}},
                                ],
                            },
                        ],
                    )
                    generated = response.choices[0].message.content or ""
                    visual_data = json.loads(generated)
                    visual = VisualAssessment(**visual_data, keyframe_timestamp=candidate["start"] + 2)
                except Exception as exc:
                    raise HTTPException(status_code=502, detail=f"OpenAI analysis failed for candidate {index}: {exc}") from exc
                score = max(0, min(100, round(candidate["score"] * 45 + visual.visual_hook_score * 5.5)))
                results.append(ViralClipItem(
                    clip_id=f"clip_{index}", rank=index,
                    start_time=self._timestamp(candidate["start"]), end_time=self._timestamp(candidate["end"]),
                    start_seconds=round(candidate["start"], 2), end_seconds=round(candidate["end"], 2),
                    duration_seconds=round(candidate["end"] - candidate["start"], 1), virality_score=score,
                    hook_line=visual_data.get("hook_line") or (candidate["transcript"].split(". ")[0] if candidate["transcript"] else visual.facial_expression),
                    why_viral=f"Signal strength {candidate['score']:.2f}; AI visual hook {visual.visual_hook_score:.1f}/10. {visual.visual_hook_summary}",
                    suggested_title=str(visual_data.get("suggested_title") or visual.facial_expression)[:100],
                    suggested_caption=str(visual_data.get("suggested_caption") or ""),
                    hashtags=[str(tag) for tag in visual_data.get("hashtags", [])],
                    transcript_snippet=candidate["transcript"], visual_assessment=visual, recommended_aspect_ratio="9:16",
                ))
        results.sort(key=lambda clip: clip.virality_score, reverse=True)
        for rank, clip in enumerate(results, start=1):
            clip.rank = rank
        return results

    @staticmethod
    def _probe_duration(path: Path) -> float:
        result = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)], capture_output=True, text=True, check=True, timeout=30)
        duration = float(result.stdout.strip())
        if duration <= 0:
            raise HTTPException(status_code=422, detail="The video duration is invalid.")
        return duration

    @staticmethod
    def _timestamp(seconds: float) -> str:
        value = int(seconds)
        hours, remainder = divmod(value, 3600)
        minutes, secs = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}" if hours else f"{minutes:02d}:{secs:02d}"


openai_clipping_service = OpenAIClippingService()
