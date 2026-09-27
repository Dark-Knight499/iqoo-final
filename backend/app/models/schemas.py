from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SceneObject(BaseModel):
    id: str
    name: str
    category: str
    confidence: float
    depth_meters: float
    position: Dict[str, float]  # x, y, z
    bounding_box: Dict[str, float]  # x, y, width, height (normalized 0-1)
    trajectory: List[Dict[str, float]] = []
    is_focused: bool = False

class CameraPreset(BaseModel):
    id: str
    name: str
    description: str
    fov: float
    target_object_id: Optional[str] = None
    position: Dict[str, float]
    cinematic_movement: str

class WorldScene(BaseModel):
    project_id: str
    scene_id: str
    timestamp: float
    environment: str
    objects: List[SceneObject]
    camera_presets: List[CameraPreset]
    active_camera: str
    depth_layers: List[str]
    lighting_condition: str

class TimelineTrackItem(BaseModel):
    id: str
    type: str  # "video_clip", "speech", "silence", "beat", "object", "caption"
    start_time: float
    end_time: float
    label: str
    color: str
    metadata: Dict[str, Any] = {}

class TranscriptWord(BaseModel):
    word: str
    start: float
    end: float
    confidence: float
    emphasis: bool = False

class Project(BaseModel):
    id: str
    title: str
    created_at: str
    duration_seconds: float
    aspect_ratio: str  # "16:9", "9:16", "1:1"
    thumbnail_url: str
    creator_style: str
    status: str
    npu_accelerated: bool = True
    fps: int = 60
    resolution: str = "4K Ultra-HD"

class PipelineStep(BaseModel):
    id: str
    name: str
    model: str
    hardware: str  # "Snapdragon NPU", "CPU", "Adreno GPU"
    status: str    # "pending", "running", "completed"
    progress: int  # 0 - 100
    latency_ms: float
    output_summary: str

class AgentAction(BaseModel):
    id: str
    type: str  # "trim", "reframe", "b_roll", "music_duck", "zoom"
    description: str
    timestamp: float
    duration: float
    status: str  # "proposed", "accepted", "rejected"
    confidence: float

class ShortClip(BaseModel):
    id: str
    title: str
    hook_score: int  # e.g. 98 / 100
    engagement_potential: str  # "High - 96%"
    start_time: float
    end_time: float
    duration: float
    aspect_ratio: str = "9:16"
    hook_text: str
    preview_url: str
    suggested_captions: List[str]

class RepurposePackage(BaseModel):
    project_id: str
    original_duration: float
    shorts: List[ShortClip]
    youtube_titles: List[str]
    youtube_chapters: List[Dict[str, str]]
    instagram_captions: List[str]
    hashtags: List[str]
    twitter_thread: List[str]
    thumbnail_prompts: List[str]

class OfficeKitStatus(BaseModel):
    device_name: str
    laptop_connected: bool
    connection_mode: str  # "Wi-Fi 7 Direct / Ultra-Low Latency"
    latency_ms: float
    scrub_position: float
    active_tool: str
    battery_level: int
    npu_temperature_c: float
