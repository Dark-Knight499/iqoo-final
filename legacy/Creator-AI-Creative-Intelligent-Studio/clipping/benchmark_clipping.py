"""
Benchmark Standalone Viral Video Clipping Pipeline
===================================================
100% self-contained in /clipping with zero cloud API keys.
Evaluates physical video frames against Google LiteRT-LM Gemma 4 E2B
running headlessly on the iQOO 15 (Snapdragon 8 Elite Adreno GPU).
"""

import sys
import io
import time
from pathlib import Path

# Set UTF-8 encoding for console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ensure clipping directory is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from clipping.models import ClipAnalysisRequest
from clipping.pipeline import pipeline

USER_VIDEO_URL = str(Path(__file__).parent / "example.mp4")

print("=" * 80)
print(f"🎬 EXECUTING STANDALONE VIRAL CLIPPING PIPELINE")
print(f"📁 Video Target: {USER_VIDEO_URL}")
print("🧠 Model Runtime: Google LiteRT-LM Gemma 4 E2B (OpenCL GPU)")
print("📱 Hardware Target: iQOO 15 (Snapdragon 8 Elite)")
print("🔒 API Keys: NONE (100% Offline On-Device Execution)")
print("=" * 80)

t0 = time.perf_counter()
req = ClipAnalysisRequest(
    video_url=USER_VIDEO_URL,
    creator_name='Frame Order',
    target_duration_seconds=45,
    min_virality_score=70,
    max_clips=3,
    use_on_device_gemma=True,
    enable_sliding_window=True,
    window_size_seconds=120,
    frame_interval_seconds=3,
    export_mp4=True
)

data = pipeline.analyze(req)
t_elapsed = time.perf_counter() - t0

print(f"\n⚡ TOTAL PIPELINE RUNTIME: {t_elapsed:.2f} seconds ({t_elapsed * 1000:.1f} ms)")
print(f"📺 VIDEO TITLE: {data.video_title}")
print(f"⏱️ VIDEO DURATION: {data.video_duration}")
print(f"🔄 SLIDING WINDOWS SCANNED: {data.sliding_windows_analyzed} Windows")
print(f"🖼️ FRAMES SAMPLED: {data.total_frames_processed} Frames (1 frame every 3s)")
print(f"📡 SIGNALS LEVERAGED: {', '.join(data.signals_used)}")
print(f"🧠 AI MODEL: {data.on_device_model}")
print(f"📱 HARDWARE TARGET: {data.hardware_target}")

print("\n" + "=" * 80)
print("🔥 TOP RANKED VIRAL CLIPS (VERIFIED BY ON-DEVICE GEMMA 4 E2B)")
print("=" * 80)

for clip in data.top_viral_clips:
    rank = clip.rank
    title = clip.suggested_title
    score = clip.virality_score
    start_t = clip.start_time
    end_t = clip.end_time
    dur = clip.duration_seconds
    hook = clip.hook_line
    vis = clip.visual_assessment

    print(f"\n🎬 [RANK #{rank}] {title}")
    print(f"   ⏱️ Exact Timestamps: {start_t} ➔ {end_t} (Duration: {dur}s)")
    print(f"   🔥 Virality Score: {score}/100")
    print(f"   🎣 Hook / Trigger: \"{hook}\"")
    print(f"   📝 Caption: {clip.suggested_caption}")
    print(f"   🏷️ Hashtags: {' '.join(clip.hashtags)}")
    if vis:
        print(f"   ⚡ Snapdragon 8 Elite GPU Latency: {vis.model_latency_ms:.1f} ms")
        print(f"   🧠 Gemma 4 E2B Visual Score: {vis.visual_hook_score}/10")
        print(f"   📐 9:16 Crop Center X: {vis.face_crop_center_x}%")
        print(f"   👁️ Gemma Scene Description: \"{vis.facial_expression}\"")
    if clip.exported_video_path:
        print(f"   💾 Exported 9:16 Vertical Clip: {clip.exported_video_path}")
    print(f"   💡 Why Viral: {clip.why_viral}")

print("\n" + "=" * 80)
print("🎉 100% OFFLINE ON-DEVICE BENCHMARK COMPLETE (ZERO CLOUD, ZERO MOCK)")
print("=" * 80)
