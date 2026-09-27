from typing import List, Dict, Any

MOCK_PROJECTS = [
    {
        "id": "proj_iqoo_perf",
        "title": "iQOO 13 Ultra Gaming & NPU Review",
        "created_at": "Today, 10:45 AM",
        "duration_seconds": 184.5,
        "aspect_ratio": "16:9",
        "thumbnail_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        "creator_style": "High-Energy Tech Punchy",
        "status": "Ready to Edit",
        "npu_accelerated": True,
        "fps": 60,
        "resolution": "4K 60FPS"
    },
    {
        "id": "proj_podcast_ep42",
        "title": "The On-Device AI Revolution (Podcast)",
        "created_at": "Yesterday",
        "duration_seconds": 312.0,
        "aspect_ratio": "16:9",
        "thumbnail_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80",
        "creator_style": "Documentary Narrative",
        "status": "Transcribed",
        "npu_accelerated": True,
        "fps": 30,
        "resolution": "4K 30FPS"
    },
    {
        "id": "proj_desk_vlog",
        "title": "Futuristic Desk Setup & AI Studio",
        "created_at": "3 days ago",
        "duration_seconds": 96.2,
        "aspect_ratio": "9:16",
        "thumbnail_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        "creator_style": "Aesthetic Minimalist",
        "status": "Exported",
        "npu_accelerated": True,
        "fps": 60,
        "resolution": "1080p 60FPS"
    }
]

MOCK_PIPELINE_STEPS = [
    {
        "id": "step_1_asr",
        "name": "Speech Recognition & Word Timestamps",
        "model": "Whisper On-Device Int8",
        "hardware": "Snapdragon NPU (45 TOPS)",
        "status": "completed",
        "progress": 100,
        "latency_ms": 28.4,
        "output_summary": "1,420 words indexed with millisecond timestamps and sentiment tagging."
    },
    {
        "id": "step_2_vision",
        "name": "Object Segmentation & Entity Persistence",
        "model": "YOLO-Spatial NPU",
        "hardware": "Snapdragon NPU",
        "status": "completed",
        "progress": 100,
        "latency_ms": 16.2,
        "output_summary": "4 persistent entities: Creator, iQOO Phone, Mechanical Keyboard, Studio Mic."
    },
    {
        "id": "step_3_scene_graph",
        "name": "3D Scene Reconstruction & Depth Mapping",
        "model": "Depth-AnyScene Graph",
        "hardware": "Hexagon DSP + Adreno GPU",
        "status": "completed",
        "progress": 100,
        "latency_ms": 42.1,
        "output_summary": "3D spatial coordinate mesh generated with 4 virtual camera angles."
    },
    {
        "id": "step_4_silence",
        "name": "Silence & Filler Word Removal",
        "model": "VoiceClean V2",
        "hardware": "Snapdragon NPU",
        "status": "completed",
        "progress": 100,
        "latency_ms": 9.8,
        "output_summary": "Detected 14 dead-air pauses (28.4s total) and 9 filler words ('um', 'uh')."
    },
    {
        "id": "step_5_hook",
        "name": "AI Highlight Detection & Hook Scoring",
        "model": "Gemini-Lite On-Device",
        "hardware": "NPU + CPU",
        "status": "completed",
        "progress": 100,
        "latency_ms": 64.5,
        "output_summary": "Found 5 viral clip candidates with Hook Scores up to 98/100."
    }
]

MOCK_WORLD_SCENE = {
    "project_id": "proj_iqoo_perf",
    "scene_id": "scene_studio_01",
    "timestamp": 14.5,
    "environment": "Cyberpunk Tech Studio (Neon Amber & Matte Slate)",
    "objects": [
        {
            "id": "obj_speaker",
            "name": "Creator (Speaker)",
            "category": "Person",
            "confidence": 0.99,
            "depth_meters": 1.2,
            "position": {"x": 0.0, "y": 0.2, "z": 1.2},
            "bounding_box": {"x": 0.25, "y": 0.1, "width": 0.5, "height": 0.8},
            "is_focused": True
        },
        {
            "id": "obj_phone",
            "name": "iQOO 13 Ultra",
            "category": "Hero Device",
            "confidence": 0.98,
            "depth_meters": 0.65,
            "position": {"x": -0.22, "y": -0.15, "z": 0.65},
            "bounding_box": {"x": 0.35, "y": 0.55, "width": 0.18, "height": 0.3},
            "is_focused": False
        },
        {
            "id": "obj_laptop",
            "name": "Office Kit Workstation",
            "category": "Hardware",
            "confidence": 0.95,
            "depth_meters": 1.05,
            "position": {"x": 0.38, "y": -0.1, "z": 1.05},
            "bounding_box": {"x": 0.65, "y": 0.45, "width": 0.3, "height": 0.4},
            "is_focused": False
        },
        {
            "id": "obj_mic",
            "name": "Studio Shure Mic",
            "category": "Audio Gear",
            "confidence": 0.94,
            "depth_meters": 0.8,
            "position": {"x": -0.35, "y": 0.05, "z": 0.8},
            "bounding_box": {"x": 0.1, "y": 0.35, "width": 0.15, "height": 0.35},
            "is_focused": False
        }
    ],
    "camera_presets": [
        {
            "id": "cam_wide",
            "name": "Wide Master Shot (16:9)",
            "description": "Full view of creator and entire desk setup",
            "fov": 78.0,
            "target_object_id": "obj_speaker",
            "position": {"x": 0.0, "y": 0.0, "z": 0.0},
            "cinematic_movement": "Stationary Master"
        },
        {
            "id": "cam_closeup_speaker",
            "name": "Punch-in Reel Shot (9:16)",
            "description": "AI face tracking portrait framed for TikTok & Reels",
            "fov": 52.0,
            "target_object_id": "obj_speaker",
            "position": {"x": 0.0, "y": 0.15, "z": 0.4},
            "cinematic_movement": "Gentle Breathing Push-In"
        },
        {
            "id": "cam_device_macro",
            "name": "Gadget Macro Focus",
            "description": "Virtual camera slides down to showcase iQOO display & chassis",
            "fov": 45.0,
            "target_object_id": "obj_phone",
            "position": {"x": -0.2, "y": -0.1, "z": 0.3},
            "cinematic_movement": "Smooth 45-degree Orbit"
        },
        {
            "id": "cam_isometric_3d",
            "name": "Spatial Isometric Orbit",
            "description": "3D top-down scene overview with live depth cues",
            "fov": 65.0,
            "target_object_id": None,
            "position": {"x": 0.8, "y": 1.1, "z": 0.5},
            "cinematic_movement": "Continuous Slow Parallax"
        }
    ],
    "active_camera": "cam_wide",
    "depth_layers": ["Foreground (0.5m - 0.8m)", "Subject Plane (1.0m - 1.5m)", "Background Studio (2.5m+)"],
    "lighting_condition": "Key Light + Amber Neon Edge Rim Light"
}

MOCK_TIMELINE = {
    "duration": 184.5,
    "current_time": 14.5,
    "tracks": {
        "video": [
            {"id": "v1", "start": 0.0, "end": 12.0, "label": "Hook: 144FPS Gaming", "type": "video_clip", "color": "#F5B800"},
            {"id": "v2", "start": 12.0, "end": 35.5, "label": "NPU On-Device Benchmarks", "type": "video_clip", "color": "#00F2FE"},
            {"id": "v3", "start": 35.5, "end": 78.0, "label": "Office Kit Wireless Sync", "type": "video_clip", "color": "#9D4EDD"},
            {"id": "v4", "start": 78.0, "end": 120.0, "label": "Real-time 3D Scene Test", "type": "video_clip", "color": "#FF007F"},
            {"id": "v5", "start": 120.0, "end": 184.5, "label": "Creator Verdict & Outro", "type": "video_clip", "color": "#10B981"}
        ],
        "silences": [
            {"id": "s1", "start": 11.2, "end": 12.1, "label": "Silence (0.9s)", "type": "silence", "color": "#EF4444"},
            {"id": "s2", "start": 34.8, "end": 35.6, "label": "Pause (0.8s)", "type": "silence", "color": "#EF4444"},
            {"id": "s3", "start": 76.5, "end": 78.0, "label": "Hesitation (1.5s)", "type": "silence", "color": "#EF4444"}
        ],
        "audio_beats": [
            {"id": "b1", "time": 0.5, "intensity": 0.8},
            {"id": "b2", "time": 2.0, "intensity": 0.95},
            {"id": "b3", "time": 3.5, "intensity": 0.75},
            {"id": "b4", "time": 5.0, "intensity": 1.0},
            {"id": "b5", "time": 6.5, "intensity": 0.85},
            {"id": "b6", "time": 8.0, "intensity": 0.9},
            {"id": "b7", "time": 9.5, "intensity": 0.7},
            {"id": "b8", "time": 11.0, "intensity": 1.0},
            {"id": "b9", "time": 12.5, "intensity": 0.88},
            {"id": "b10", "time": 14.0, "intensity": 0.94}
        ],
        "speech": [
            {"word": "What", "start": 0.0, "end": 0.3, "confidence": 0.99, "emphasis": False},
            {"word": "if", "start": 0.3, "end": 0.5, "confidence": 0.98, "emphasis": False},
            {"word": "your", "start": 0.5, "end": 0.7, "confidence": 0.99, "emphasis": False},
            {"word": "phone", "start": 0.7, "end": 1.1, "confidence": 0.99, "emphasis": True},
            {"word": "could", "start": 1.1, "end": 1.3, "confidence": 0.97, "emphasis": False},
            {"word": "edit", "start": 1.3, "end": 1.6, "confidence": 0.99, "emphasis": True},
            {"word": "entire", "start": 1.6, "end": 2.0, "confidence": 0.99, "emphasis": False},
            {"word": "videos", "start": 2.0, "end": 2.5, "confidence": 0.99, "emphasis": True},
            {"word": "in", "start": 2.5, "end": 2.7, "confidence": 0.96, "emphasis": False},
            {"word": "seconds?", "start": 2.7, "end": 3.3, "confidence": 0.99, "emphasis": True},
            {"word": "This", "start": 3.4, "end": 3.6, "confidence": 0.98, "emphasis": False},
            {"word": "is", "start": 3.6, "end": 3.8, "confidence": 0.98, "emphasis": False},
            {"word": "the", "start": 3.8, "end": 4.0, "confidence": 0.97, "emphasis": False},
            {"word": "iQOO", "start": 4.0, "end": 4.4, "confidence": 1.0, "emphasis": True},
            {"word": "NPU", "start": 4.4, "end": 4.9, "confidence": 1.0, "emphasis": True},
            {"word": "accelerated", "start": 4.9, "end": 5.5, "confidence": 0.98, "emphasis": False},
            {"word": "video", "start": 5.5, "end": 5.9, "confidence": 0.99, "emphasis": False},
            {"word": "studio!", "start": 5.9, "end": 6.5, "confidence": 0.99, "emphasis": True}
        ]
    }
}

MOCK_REPURPOSE_PACKAGE = {
    "project_id": "proj_iqoo_perf",
    "original_duration": 184.5,
    "shorts": [
        {
            "id": "short_1",
            "title": "Phone Editing In 2026 Is INSANE 🤯",
            "hook_score": 98,
            "engagement_potential": "Viral Top 1%",
            "start_time": 0.0,
            "end_time": 28.5,
            "duration": 28.5,
            "aspect_ratio": "9:16",
            "hook_text": "What if your phone edited your videos automatically?",
            "preview_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
            "suggested_captions": ["Hermes Bold Yellow", "Dynamic Pop", "Karaoke Neon"]
        },
        {
            "id": "short_2",
            "title": "Snapdragon NPU vs RTX 4090: The Benchmark Test",
            "hook_score": 94,
            "engagement_potential": "High Tech Audience",
            "start_time": 12.0,
            "end_time": 44.0,
            "duration": 32.0,
            "aspect_ratio": "9:16",
            "hook_text": "Is cloud video editing officially obsolete?",
            "preview_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
            "suggested_captions": ["Cyberpunk Matrix", "Clean Subtitle"]
        },
        {
            "id": "short_3",
            "title": "How iQOO Office Kit Turns Your Phone Into A Jog Wheel",
            "hook_score": 91,
            "engagement_potential": "High Shareability",
            "start_time": 35.5,
            "end_time": 68.0,
            "duration": 32.5,
            "aspect_ratio": "9:16",
            "hook_text": "This secret feature connects phone to laptop seamlessly.",
            "preview_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
            "suggested_captions": ["Tech Punch Minimal"]
        }
    ],
    "youtube_titles": [
        "I Stopped Using Premiere Pro After Testing This iQOO AI Feature!",
        "The First AI Phone That Understands 3D Video Scenes",
        "iQOO 13 Creator Studio: On-Device NPU Breakdown"
    ],
    "youtube_chapters": [
        {"timestamp": "00:00", "title": "The Hook: 3D Video Understanding"},
        {"timestamp": "00:12", "title": "On-Device NPU vs Cloud Latency"},
        {"timestamp": "00:35", "title": "Office Kit Wireless Controller Demo"},
        {"timestamp": "01:18", "title": "Auto Beat-Synced Shorts Repurposing"},
        {"timestamp": "02:44", "title": "Final Verdict: Creator Gamechanger"}
    ],
    "instagram_captions": [
        "Tested the new on-device AI editing studio on the iQOO 13. Reconstructed the 3D scene in real-time, cut out 14 awkward silences, and exported 3 Reels without touching a laptop. Link in bio! ⚡📱 #iQOO #CreatorAI #TechReview",
        "Why wait for cloud uploads? All AI transcription and 3D camera reframing runs locally on the Snapdragon NPU. 🚀 #ContentCreator #VideoEditing"
    ],
    "hashtags": ["#iQOO", "#CreatorStudio", "#OnDeviceAI", "#VideoEditing", "#Snapdragon", "#ShortsCreator", "#TechHacks"],
    "twitter_thread": [
        "1/5 Mobile video editing just had its biggest upgrade. I just edited a full 4K video using only on-device NPU models on iQOO. Here's why this changes everything 🧵👇",
        "2/5 Instead of pixels on a 2D timeline, it builds a 3D Semantic World Graph. It knows where I am, where the phone is, and can create new camera angles from ONE shot.",
        "3/5 Zero cloud latency. Whisper transcription and YOLO object tracking run 100% offline at 45 TOPS.",
        "4/5 Office Kit connects the phone as a physical scrub wheel to your laptop with <5ms latency.",
        "5/5 Try it out and let me know your thoughts!"
    ],
    "thumbnail_prompts": [
        "Shocked creator pointing at floating holographic 3D timeline with bold yellow text 'PREMIERE IS DEAD?'",
        "Split comparison showing cloud upload loading bar vs instant on-device NPU badge with green checkmark",
        "Cinematic macro of iQOO phone emitting glowing neon audio waveforms"
    ]
}

MOCK_AGENT_RESPONSES = {
    "make_energetic_short": {
        "reply": "I've analyzed the footage and configured an energetic 28s YouTube Short with 6 rapid jump cuts, auto punch-in on keywords, and Hormozi-style neon captions.",
        "diff_actions": [
            {
                "id": "act_1",
                "type": "trim",
                "description": "Trim dead air intro (0:00 - 0:03.2s) to maximize hook retention",
                "timestamp": 0.0,
                "duration": 3.2,
                "status": "proposed",
                "confidence": 0.98
            },
            {
                "id": "act_2",
                "type": "zoom",
                "description": "Dynamic 1.25x punch-in at 0:04.5 on keyword 'iQOO NPU'",
                "timestamp": 4.5,
                "duration": 2.0,
                "status": "proposed",
                "confidence": 0.95
            },
            {
                "id": "act_3",
                "type": "reframe",
                "description": "Auto-center speaker face in 9:16 vertical canvas",
                "timestamp": 0.0,
                "duration": 28.5,
                "status": "proposed",
                "confidence": 0.99
            },
            {
                "id": "act_4",
                "type": "music_duck",
                "description": "Insert Cyberpunk Synthwave track ducked to -16dB under voice",
                "timestamp": 0.0,
                "duration": 28.5,
                "status": "proposed",
                "confidence": 0.92
            }
        ]
    },
    "focus_on_phone": {
        "reply": "3D World camera redirected. Switching to Macro Device Focus (cam_device_macro) at timestamp 0:04 when you present the iQOO phone.",
        "diff_actions": [
            {
                "id": "act_focus_1",
                "type": "reframe",
                "description": "Virtual camera slide-in to frame iQOO 13 Ultra display",
                "timestamp": 4.0,
                "duration": 3.5,
                "status": "proposed",
                "confidence": 0.97
            }
        ]
    },
    "remove_all_silences": {
        "reply": "Detected 3 awkward pauses and 9 filler words. Removing 4.2 seconds of dead time will improve pacing by +32%.",
        "diff_actions": [
            {
                "id": "act_sil_1",
                "type": "trim",
                "description": "Cut silence at 11.2s (duration 0.9s)",
                "timestamp": 11.2,
                "duration": 0.9,
                "status": "proposed",
                "confidence": 0.99
            },
            {
                "id": "act_sil_2",
                "type": "trim",
                "description": "Cut silence at 34.8s (duration 0.8s)",
                "timestamp": 34.8,
                "duration": 0.8,
                "status": "proposed",
                "confidence": 0.99
            }
        ]
    }
}
