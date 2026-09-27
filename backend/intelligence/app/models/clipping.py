"""Schemas for OpenAI-assisted video clipping."""

from typing import List, Optional
from pydantic import BaseModel, Field


class VisualAssessment(BaseModel):
    visual_hook_score: float = Field(..., ge=0, le=10, description="Visual engagement score")
    facial_expression: str = Field(..., description="Scene description")
    face_crop_center_x: float = Field(..., ge=0, le=100, description="Recommended horizontal crop center percentage")
    active_speaker_identified: bool = Field(..., description="Whether an active speaker was identified")
    visual_hook_summary: str = Field(..., description="Visual assessment")
    keyframe_timestamp: Optional[float] = Field(None, description="Timestamp in seconds of the analyzed keyframe")


class ViralClipItem(BaseModel):
    clip_id: str = Field(..., description="Unique clip identifier (e.g. 'clip_1')")
    rank: int = Field(..., description="Virality rank (1 = highest viral potential)")
    start_time: str = Field(..., description="Formatted start timestamp (MM:SS or HH:MM:SS)")
    end_time: str = Field(..., description="Formatted end timestamp (MM:SS or HH:MM:SS)")
    start_seconds: float = Field(..., description="Start offset in seconds")
    end_seconds: float = Field(..., description="End offset in seconds")
    duration_seconds: float = Field(..., description="Total clip duration in seconds")
    virality_score: int = Field(..., description="Composite virality score (0-100)")
    hook_line: str = Field(..., description="The opening 3-second hook that captures attention")
    why_viral: str = Field(..., description="Editorial rationale explaining narrative payoff and audience retention")
    suggested_title: str = Field(..., description="High-CTR title for YouTube Shorts / Instagram Reels")
    suggested_caption: str = Field(..., description="Engagement-optimized caption with call-to-action")
    hashtags: List[str] = Field(..., description="Clip hashtags")
    transcript_snippet: str = Field(..., description="Full self-contained transcript snippet for this segment")
    visual_assessment: VisualAssessment = Field(..., description="OpenAI vision analysis")
    recommended_aspect_ratio: str = Field(..., description="Target video aspect ratio")


class ClipAnalysisResponse(BaseModel):
    status: str = Field("success", description="Status of the clipping operation")
    video_title: str = Field(..., description="Extracted video title")
    video_duration: str = Field(..., description="Total duration of the source video")
    source_type: str = Field("local_file", description="Uploaded video source")
    signals_used: List[str] = Field(..., description="List of multi-modal signals leveraged for analysis")
    analysis_model: str = Field("gpt-4o-mini", description="Video analysis model")
    total_candidates_analyzed: int = Field(..., description="Number of candidate segments evaluated")
    top_viral_clips: List[ViralClipItem] = Field(default_factory=list, description="Ranked viral clips with timestamps")
