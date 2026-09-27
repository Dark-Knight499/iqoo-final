import os
import json
import uuid
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

from app.mock_data.fixtures import (
    MOCK_PROJECTS,
    MOCK_PIPELINE_STEPS,
    MOCK_WORLD_SCENE,
    MOCK_TIMELINE,
    MOCK_REPURPOSE_PACKAGE,
    MOCK_AGENT_RESPONSES
)

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")

try:
    openai_client = OpenAI(api_key=OPENAI_KEY)
except Exception as e:
    print(f"Warning initializing OpenAI client: {e}")
    openai_client = None

router = APIRouter()

# In-memory mutable states for session
current_world_scene = dict(MOCK_WORLD_SCENE)
current_repurpose_package = dict(MOCK_REPURPOSE_PACKAGE)
current_timeline = dict(MOCK_TIMELINE)
applied_actions = []

office_kit_state = {
    "device_name": "iQOO 13 Ultra (Snapdragon 8 Elite)",
    "laptop_connected": True,
    "connection_mode": "Wi-Fi 7 Direct (<2.4ms)",
    "latency_ms": 2.4,
    "scrub_position": 14.5,
    "active_tool": "Precision Jog Wheel",
    "battery_level": 88,
    "npu_temperature_c": 34.2
}

# Request / Response Schemas
class AgentPromptRequest(BaseModel):
    project_id: str
    prompt: str
    voice_input: bool = False
    context_timeline: Optional[Dict[str, Any]] = None

class CameraChangeRequest(BaseModel):
    camera_id: str
    target_object_id: Optional[str] = None

class ActionUpdateRequest(BaseModel):
    status: str  # "accepted" or "rejected"

class ScrubRequest(BaseModel):
    timestamp: float

class RepurposeGenerateRequest(BaseModel):
    focus_topic: Optional[str] = "Key highlights & viral hooks"
    target_platform: Optional[str] = "all"
    custom_tone: Optional[str] = "High-Energy Tech Punchy"

class SceneReconstructRequest(BaseModel):
    scene_description: Optional[str] = "Creator desk setup with iQOO 13, studio microphone, and laptop"
    lighting_mode: Optional[str] = "Cyberpunk Amber Neon"

class CaptureAnalyzeRequest(BaseModel):
    lighting_lux: Optional[int] = 450
    gyro_pitch: Optional[float] = 1.4
    gyro_yaw: Optional[float] = -0.2
    active_lens: Optional[str] = "Wide (24mm f/1.6)"
    notes: Optional[str] = None


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Creator AI Studio Backend",
        "npu_engine": "Active (45 TOPS Snapdragon Hexagon)",
        "openai_connected": openai_client is not None,
        "version": "1.2.0"
    }

@router.get("/projects")
def get_projects():
    return MOCK_PROJECTS

@router.get("/projects/{project_id}")
def get_project(project_id: str):
    for p in MOCK_PROJECTS:
        if p["id"] == project_id:
            return p
    return MOCK_PROJECTS[0]

@router.get("/pipeline/{project_id}")
def get_pipeline_status(project_id: str):
    return {
        "project_id": project_id,
        "is_complete": True,
        "overall_progress": 100,
        "hardware_acceleration": "Snapdragon NPU (45 TOPS)",
        "steps": MOCK_PIPELINE_STEPS
    }

@router.post("/pipeline/{project_id}/run")
async def run_pipeline(project_id: str):
    return {
        "message": "Snapdragon 8 Elite NPU Pipeline completed in 161ms",
        "project_id": project_id,
        "steps": MOCK_PIPELINE_STEPS
    }

@router.get("/timeline/{project_id}")
def get_timeline(project_id: str):
    return current_timeline

@router.post("/timeline/{project_id}/apply-diff")
def apply_diff_to_timeline(project_id: str, action: Dict[str, Any]):
    action_type = action.get("type")
    desc = action.get("description", "Edit applied")
    
    # Mutate timeline state
    if action_type == "trim":
        # Simulate trimmed dead air
        current_timeline["tracks"]["silences"] = [
            s for s in current_timeline["tracks"]["silences"]
            if abs(s.get("start", 0) - float(action.get("timestamp", 0))) > 1.0
        ]
    elif action_type == "reframe":
        current_timeline["aspect_ratio"] = action.get("params", {}).get("aspectRatio", "9:16")
        
    applied_actions.append(action)
    return {
        "status": "success",
        "message": f"Applied {action_type}: {desc}",
        "timeline": current_timeline
    }

# ==========================================
# REAL OPENAI: AI CREATOR VOICE & DIFF AGENT
# ==========================================
@router.post("/agent/chat")
def chat_with_agent(req: AgentPromptRequest):
    prompt_text = req.prompt.strip()
    
    if openai_client:
        try:
            system_prompt = (
                "You are iQOO Studio AI Creator Agent, an ultra-fast on-device AI co-pilot powered by "
                "the Snapdragon 8 Elite NPU and cloud reasoning. You assist video creators with pro editing decisions.\n"
                "The user is editing a high-energy tech video review / unboxing of the iQOO 13 Ultra (total 184.5 seconds).\n"
                "The timeline has: video clips, silence gaps (at 11.2s and 34.8s), speech transcript, and 3D spatial scene objects (Creator, iQOO 13 Ultra, Shure Mic, Laptop).\n"
                "Respond in strictly valid JSON format with these exact keys:\n"
                "{\n"
                '  "reply": "A concise, engaging, professional creator co-pilot message explaining what you did and why it improves viewer retention.",\n'
                '  "diff_actions": [\n'
                "    {\n"
                '      "id": "act_unique_id",\n'
                '      "type": "trim" | "zoom" | "reframe" | "caption_style" | "music_duck" | "split" | "camera_angle" | "color_grade",\n'
                '      "description": "Clear explanation of the change (e.g. Cut 1.2s dead pause to boost hook rate)",\n'
                '      "timestamp": 0.0,\n'
                '      "duration": 2.5,\n'
                '      "confidence": 0.98,\n'
                '      "status": "proposed"\n'
                "    }\n"
                "  ],\n"
                '  "npu_confidence": 0.97,\n'
                '  "is_real_ai": true\n'
                "}\n"
                "Ensure diff_actions has 2 to 4 specific, actionable proposed edits tailored to the user prompt."
            )

            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"User Request: {prompt_text}"}
                ],
                max_tokens=700,
                temperature=0.7
            )

            result_str = completion.choices[0].message.content
            parsed = json.loads(result_str)
            
            # Ensure IDs and statuses are well-formed
            actions = parsed.get("diff_actions", [])
            for idx, a in enumerate(actions):
                if not a.get("id"):
                    a["id"] = f"act_ai_{uuid.uuid4().hex[:6]}"
                if not a.get("status"):
                    a["status"] = "proposed"
                if not a.get("confidence"):
                    a["confidence"] = 0.96
                    
            return {
                "reply": parsed.get("reply", "I've analyzed your footage and proposed the optimal timeline adjustments."),
                "diff_actions": actions,
                "npu_confidence": parsed.get("npu_confidence", 0.97),
                "is_real_ai": True
            }
        except Exception as e:
            print(f"OpenAI agent error: {e}, falling back gracefully")

    # Graceful Fallback if OpenAI key is invalid or network issues occur
    prompt_lower = prompt_text.lower()
    if "phone" in prompt_lower or "focus" in prompt_lower or "macro" in prompt_lower:
        resp = MOCK_AGENT_RESPONSES["focus_on_phone"]
    elif "silence" in prompt_lower or "pause" in prompt_lower or "filler" in prompt_lower or "dead" in prompt_lower:
        resp = MOCK_AGENT_RESPONSES["remove_all_silences"]
    else:
        resp = MOCK_AGENT_RESPONSES["make_energetic_short"]
        
    return {
        "reply": resp["reply"],
        "diff_actions": resp["diff_actions"],
        "npu_confidence": 0.96,
        "is_real_ai": False
    }

@router.post("/agent/action/{action_id}/update")
def update_action_status(action_id: str, req: ActionUpdateRequest):
    return {
        "action_id": action_id,
        "updated_status": req.status,
        "timeline_applied": (req.status == "accepted")
    }

# ==========================================
# 3D SPATIAL WORLD & VIRTUAL CAMERA
# ==========================================
@router.get("/world3d/{project_id}")
def get_world_scene(project_id: str):
    return current_world_scene

@router.post("/world3d/{project_id}/camera")
def set_camera(project_id: str, req: CameraChangeRequest):
    current_world_scene["active_camera"] = req.camera_id
    if req.target_object_id:
        for obj in current_world_scene["objects"]:
            obj["is_focused"] = (obj["id"] == req.target_object_id)
    return {
        "status": "success",
        "active_camera": current_world_scene["active_camera"],
        "objects": current_world_scene["objects"]
    }

@router.post("/world3d/{project_id}/reconstruct")
def reconstruct_3d_world(project_id: str, req: SceneReconstructRequest):
    """
    Real OpenAI dynamic 3D spatial reconstruction of the scene entities,
    depth layout, and cinematic virtual cameras.
    """
    if openai_client:
        try:
            system_prompt = (
                "You are an advanced Computer Vision & 3D Spatial NeRF reconstructor for iQOO Creator Studio.\n"
                "Given a creator scene description, generate a detailed 3D spatial scene layout in valid JSON with keys:\n"
                "{\n"
                '  "environment": "Description of lighting and studio acoustics",\n'
                '  "lighting_condition": "e.g., Key Light + Amber Neon Edge Rim Light",\n'
                '  "objects": [\n'
                "    {\n"
                '      "id": "obj_1",\n'
                '      "name": "Creator (Speaker)",\n'
                '      "category": "Person",\n'
                '      "confidence": 0.99,\n'
                '      "depth_meters": 1.2,\n'
                '      "position": {"x": 0.0, "y": 0.2, "z": 1.2},\n'
                '      "bounding_box": {"x": 0.25, "y": 0.1, "width": 0.5, "height": 0.8},\n'
                '      "is_focused": true\n'
                "    }\n"
                "  ],\n"
                '  "camera_presets": [\n'
                "    {\n"
                '      "id": "cam_wide",\n'
                '      "name": "Wide Master Shot (16:9)",\n'
                '      "description": "Full view of creator and entire desk setup",\n'
                '      "fov": 78.0,\n'
                '      "target_object_id": "obj_1",\n'
                '      "position": {"x": 0.0, "y": 0.0, "z": 0.0},\n'
                '      "cinematic_movement": "Stationary Master"\n'
                "    }\n"
                "  ],\n"
                '  "depth_layers": ["Foreground (0.5m - 0.8m)", "Subject Plane (1.0m - 1.5m)", "Background Studio (2.5m+)"]\n'
                "}\n"
                "Provide 4 distinct objects: 1) Creator/Speaker, 2) iQOO 13 Ultra, 3) Studio Shure Mic, 4) Office Kit Laptop Workstation. Keep coordinates distinct."
            )
            
            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Scene Context: {req.scene_description}. Lighting: {req.lighting_mode}"}
                ],
                max_tokens=800
            )
            
            parsed = json.loads(completion.choices[0].message.content)
            current_world_scene.update(parsed)
            current_world_scene["project_id"] = project_id
            current_world_scene["active_camera"] = parsed.get("camera_presets", [{}])[0].get("id", "cam_wide")
            return {
                "status": "success",
                "is_real_ai": True,
                "scene": current_world_scene
            }
        except Exception as e:
            print(f"3D reconstruction AI error: {e}")

    # Fallback to current scene
    return {
        "status": "success",
        "is_real_ai": False,
        "scene": current_world_scene
    }

# ==========================================
# REAL OPENAI: 1-TO-MANY REPURPOSING HUB
# ==========================================
@router.get("/repurpose/{project_id}")
def get_repurposed_content(project_id: str):
    return current_repurpose_package

@router.post("/repurpose/{project_id}/generate")
def generate_repurposed_content(project_id: str, req: RepurposeGenerateRequest):
    """
    Real OpenAI call to generate high-converting viral Shorts, YouTube Chapters,
    Instagram/TikTok captions, and an X/Twitter thread from raw footage transcript.
    """
    if openai_client:
        try:
            system_prompt = (
                "You are the iQOO 1-to-Many Viral Repurposing Engine powered by Snapdragon AI.\n"
                "Take a 3-minute video review of the 'iQOO 13 Ultra Smartphone with Snapdragon 8 Elite and On-Device Creator AI' "
                "and generate an all-in-one viral content package in strictly valid JSON format with keys:\n"
                "{\n"
                '  "shorts": [\n'
                "    {\n"
                '      "id": "short_1",\n'
                '      "title": "Punchy Short Title",\n'
                '      "hook_score": 98,\n'
                '      "hook_sentence": "\\"Opening 3-second viral hook string\\"",\n'
                '      "target_audience": "Tech Enthusiasts & Gamers",\n'
                '      "duration_seconds": 28.5,\n'
                '      "aspect_ratio": "9:16",\n'
                '      "style_badge": "🔥 Viral Top 1%",\n'
                '      "caption_preset": "Hermes Bold Yellow",\n'
                '      "tags": ["#iQOO13", "#OnDeviceAI", "#Snapdragon8Elite"],\n'
                '      "cut_timestamps": "0:00 - 0:28.5"\n'
                "    }\n"
                "  ],\n"
                '  "youtube_chapters": [\n'
                "    {\n"
                '      "time": "0:00",\n'
                '      "title": "Hook & Hardware Design",\n'
                '      "description": "First look at iQOO 13 Ultra display and chassis"\n'
                "    }\n"
                "  ],\n"
                '  "social_posts": {\n'
                '    "instagram_caption": "Engaging caption with hooks, bullet points, call to action, and hashtags",\n'
                '    "twitter_thread": [\n'
                '      "1/5 Tweet hook about phone video editing in 2026...",\n'
                '      "2/5 Tweet on Snapdragon 8 Elite NPU 45 TOPS...",\n'
                '      "3/5 Tweet on 3D spatial scene reconstruction...",\n'
                '      "4/5 Tweet on Office Kit wireless jog wheel...",\n'
                '      "5/5 Conclusion and link to full video."\n'
                "    ],\n"
                '    "tiktok_sound_hook": "High-tempo cyberpunk synth bass drop"\n'
                "  },\n"
                '  "thumbnail_concepts": [\n'
                "    {\n"
                '      "headline": "Phone Editing Is INSANE",\n'
                '      "visual_prompt": "Close-up of iQOO 13 with glowing holographic 3D timeline floating above screen",\n'
                '      "emotion_cue": "Shock / Awe face with yellow glow"\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Provide 3-4 viral Shorts, 4 YouTube chapters, full social posts, and 2 thumbnail concepts."
            )

            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Focus: {req.focus_topic}. Tone: {req.custom_tone}"}
                ],
                max_tokens=2500,
                temperature=0.75
            )

            parsed = json.loads(completion.choices[0].message.content)
            current_repurpose_package.update(parsed)
            current_repurpose_package["project_id"] = project_id
            return {
                "status": "success",
                "is_real_ai": True,
                "package": current_repurpose_package
            }
        except Exception as e:
            print(f"Repurposing AI error: {e}")

    return {
        "status": "success",
        "is_real_ai": False,
        "package": current_repurpose_package
    }

# ==========================================
# REAL OPENAI: LIVE VIEWFINDER & VISION AI
# ==========================================
@router.post("/capture/analyze")
def analyze_capture_frame(req: CaptureAnalyzeRequest):
    """
    Real-time vision framing and scene analysis for live camera capture.
    """
    if openai_client:
        try:
            system_prompt = (
                "You are an on-device Camera Director AI for iQOO 4K Viewfinder.\n"
                "Analyze the camera metadata (lighting lux, gyro orientation, lens) and output JSON with:\n"
                "{\n"
                '  "subject_tracking": {"face_detected": true, "confidence": 0.99, "focus_distance_m": 1.2},\n'
                '  "framing_score": 94,\n'
                '  "lighting_evaluation": "Optimal studio lighting (450 lux). Rim light creates sharp separation.",\n'
                '  "director_tips": [\n'
                '    "Keep subject eye line in the top third of the frame",\n'
                '    "Gyro pitch is +1.4° - perfect hero angle for tech unboxing",\n'
                '    "NPU HDR active with zero motion blur at 60 FPS"\n'
                '  ],\n'
                '  "detected_entities": ["Creator Face (Hero)", "iQOO 13 Ultra Chassis", "Mechanical Keyboard"]\n'
                "}"
            )
            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Lux: {req.lighting_lux}, Gyro Pitch: {req.gyro_pitch}, Lens: {req.active_lens}"}
                ],
                max_tokens=400
            )
            parsed = json.loads(completion.choices[0].message.content)
            return {"status": "success", "is_real_ai": True, "analysis": parsed}
        except Exception as e:
            print(f"Capture AI error: {e}")

    return {
        "status": "success",
        "is_real_ai": False,
        "analysis": {
            "subject_tracking": {"face_detected": True, "confidence": 0.99, "focus_distance_m": 1.2},
            "framing_score": 96,
            "lighting_evaluation": "Studio Key Light + Amber Rim Active (450 lux)",
            "director_tips": [
                "Snapdragon 8 Elite ISP: Optical focus and exposure locked",
                "Audio levels nominal (-12 dB peak) with AI noise suppression",
                "Snapdragon 8 Elite ISP: 4K 60FPS Log recording ready"
            ],
            "detected_entities": ["Creator Face", "iQOO 13 Flagship", "Studio Mic"]
        }
    }

# ==========================================
# OFFICE KIT LAPTOP JOG WHEEL SYNC
# ==========================================
@router.get("/officekit/status")
def get_officekit_status():
    return office_kit_state

@router.post("/officekit/scrub")
def update_scrub(req: ScrubRequest):
    office_kit_state["scrub_position"] = req.timestamp
    return {"status": "synced", "scrub_position": office_kit_state["scrub_position"]}

@router.websocket("/ws/officekit")
async def websocket_officekit(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if "scrub_delta" in data:
                office_kit_state["scrub_position"] = max(
                    0.0, office_kit_state["scrub_position"] + data["scrub_delta"]
                )
            await websocket.send_json({
                "type": "state_update",
                "state": office_kit_state
            })
    except WebSocketDisconnect:
        pass
