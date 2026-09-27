"""
Viral Video Clipping Package
============================
Standalone on-device video intelligence and viral clipping powered by
Google LiteRT-LM Gemma 4 E2B on Snapdragon 8 Elite.
"""

from clipping.models import (
    ClipAnalysisRequest,
    ClipAnalysisResponse,
    ViralClipItem,
    VisualAssessment,
    SlidingWindowResult,
    ClipSourceType
)
from clipping.phone_gemma_client import PhoneGemmaClient
from clipping.pipeline import ClippingPipeline, pipeline

__all__ = [
    "ClipAnalysisRequest",
    "ClipAnalysisResponse",
    "ViralClipItem",
    "VisualAssessment",
    "SlidingWindowResult",
    "ClipSourceType",
    "PhoneGemmaClient",
    "ClippingPipeline",
    "pipeline"
]
