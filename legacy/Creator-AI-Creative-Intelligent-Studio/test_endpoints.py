import sys
import json
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)


def test_additional_api_routes():
    """Exercise auxiliary APIs with service calls mocked where they would scrape externally."""
    assert client.get("/").status_code == 200

    with patch("app.routers.trends.trends_service.get_domain_trends", return_value={"domain": "AI"}):
        response = client.get("/trends/domain?domain=AI&geo=US&limit=3")
        assert response.status_code == 200 and response.json()["domain"] == "AI"

    minimal_intelligence = {
        "creator_name": "Test Creator",
        "niche": "Technology",
        "location": "US",
        "analyzed_at": "2026-01-01T00:00:00Z",
        "platforms_analyzed": ["youtube"],
        "platform_trends": [],
    }
    with patch("app.routers.intelligence.platform_intel_service.run_intelligence", return_value=minimal_intelligence):
        response = client.get("/intelligence/quick?creator_name=Test%20Creator&platforms=youtube")
        assert response.status_code == 200 and response.json()["platforms_analyzed"] == ["youtube"]

    assert client.get("/intelligence/platforms").status_code == 200
    assert client.get("/intelligence/domains").status_code == 200

    domain_profile = {
        "domain_id": "test_domain",
        "domain_name": "Test Domain",
        "sub_niche": "Test niche",
        "primary_search_topics": [],
        "core_verticals": [],
        "content_portfolio": [],
        "investigation_methodology": "Test methodology",
        "audience_profile": {
            "demographics": "Test audience",
            "psychographics": "Test interests",
            "consumption_habits": "Test viewing habits",
        },
        "domain_positioning_and_moat": {
            "mission": "Test mission",
            "positioning": "Test positioning",
            "competitive_moat": "Test moat",
        },
        "domain_monologues": {},
        "vocal_cadence_dynamics": {
            "pitch_modulation": "Measured",
            "micro_pause_timing": "Brief pauses",
            "articulation_and_pacing": "Clear delivery",
            "inclusive_pronoun_habit": "Collaborative",
        },
        "signature_phrases": [],
        "sample_hooks": [],
    }
    with patch("app.routers.intelligence.domain_service.get_creator_domain_profile", return_value=domain_profile):
        response = client.post("/intelligence/identify-domain", json={"creator_name": "Test Creator"})
        assert response.status_code == 200 and response.json()["domain_id"] == "test_domain"

    with patch("app.routers.intelligence.creator_comparator_service.ensure_and_compare_creator", return_value={"status": "ok"}):
        response = client.post("/intelligence/compare", json={"creator_name": "Another Creator"})
        assert response.status_code == 200 and response.json()["status"] == "ok"

    with patch("app.routers.clipping.smolvlm_service.check_on_device_health", return_value={"online": False}):
        response = client.get("/clipping/status")
        assert response.status_code == 200 and response.json()["online"] is False

    clipping_result = {
        "status": "success",
        "video_title": "Test video",
        "video_duration": "00:30",
        "source_type": "direct_url",
        "signals_used": [],
        "on_device_model": "SmolVLM test adapter",
        "total_candidates_analyzed": 0,
        "top_viral_clips": [],
    }
    with patch("app.routers.clipping.clipping_service.analyze_video", return_value=clipping_result):
        response = client.post("/clipping/analyze", json={"video_url": "https://example.com/video.mp4"})
        assert response.status_code == 200 and response.json()["video_title"] == "Test video"

    viral_clip = {
        "clip_id": "test_clip",
        "rank": 1,
        "start_time": "00:10",
        "end_time": "00:40",
        "start_seconds": 10,
        "end_seconds": 40,
        "duration_seconds": 30,
        "virality_score": 85,
        "hook_line": "A test hook",
        "why_viral": "A test rationale",
        "suggested_title": "A test short",
        "suggested_caption": "A test caption",
        "hashtags": ["#test"],
        "transcript_snippet": "A test transcript",
        "recommended_aspect_ratio": "9:16",
    }
    response = client.post("/clipping/to-publish", json={"clip": viral_clip, "creator_id": "test_creator"})
    assert response.status_code == 200 and response.json()["job"]["status"] == "PENDING_APPROVAL"

    create_response = client.post("/publish", json={
        "creator_id": "test_creator",
        "platform": "twitter",
        "content_format": "post",
        "content": "Reject route test",
        "require_human_approval": True,
    })
    assert create_response.status_code == 200
    rejected_job_id = create_response.json()["job"]["job_id"]
    assert client.get(f"/publish/jobs/{rejected_job_id}").status_code == 200
    reject_response = client.post(
        f"/publish/jobs/{rejected_job_id}/reject",
        json={"reviewer_name": "API Test", "rejection_reason": "Test rejection"},
    )
    assert reject_response.status_code == 200 and reject_response.json()["job"]["status"] == "REJECTED"

    print("[PASS] Root, domain trends, intelligence helpers, clipping, and publish detail/reject routes")

def run_tests():
    print("=" * 60)
    print("RUNNING CREATOR AI BACKEND API VERIFICATION SUITE")
    print("=" * 60)

    # 1. Test Health
    print("\n[1/5] Testing Health Check (/health)...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print("  -> Passed. Server healthy.")

    # 2. Test /trends
    print("\n[2/5] Testing /trends Endpoint (Live Google Trends RSS & Niche Trends)...")
    res = client.get("/trends?domain=Tech%20%26%20AI&geo=US&limit=5")
    assert res.status_code == 200, f"Trends failed: {res.text}"
    trends_data = res.json()
    assert len(trends_data["world_trends"]) > 0, "No world trends returned from Google Trends RSS"
    assert len(trends_data["niche_trends"]) > 0, "No niche trends returned"
    assert len(trends_data["viral_formats"]) > 0, "No viral formats returned"
    print(f"  -> Passed. Fetched {len(trends_data['world_trends'])} real-time world trends and {len(trends_data['niche_trends'])} niche trends.")
    print(f"  -> Sample Live World Trend: '{trends_data['world_trends'][0]['title']}' ({trends_data['world_trends'][0]['traffic_volume']})")

    # 3. Test /dashboard
    print("\n[3/5] Testing /dashboard Endpoint...")
    res = client.get("/dashboard?creator_name=Ali%20Abdaal&timeframe=7d")
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    dash_data = res.json()
    assert "youtube" in dash_data["platforms"], "YouTube platform data missing in dashboard"
    assert "app_platform_metrics" in dash_data, "App metrics missing"
    assert "charts" in dash_data, "Charts data missing"
    print(f"  -> Passed. Total estimated reach: {dash_data['overall_reach']:,}")
    print(f"  -> Ready-to-render chart data points: {len(dash_data['charts']['views_trend'])}")

    # 4. Test /publish with Human Approval and Composio
    print("\n[4/5] Testing /publish Workflow (Creation -> Pending Approval -> Human Approval -> Composio)...")
    pub_payload = {
        "creator_id": "ali-abdaal",
        "platform": "twitter",
        "content_format": "post",
        "title": "3 Lessons on Inconsistency",
        "content": "Most people think inconsistency is a character flaw. It's actually an uncalibrated feedback loop.",
        "media_urls": [],
        "require_human_approval": True
    }
    create_res = client.post("/publish", json=pub_payload)
    assert create_res.status_code == 200, f"Publish create failed: {create_res.text}"
    create_data = create_res.json()
    job_id = create_data["job"]["job_id"]
    assert create_data["job"]["status"] == "PENDING_APPROVAL", "Job should start as PENDING_APPROVAL"
    print(f"  -> Created job: {job_id} with status '{create_data['job']['status']}'")
    assert client.get(f"/publish/jobs/{job_id}").status_code == 200

    # List jobs
    list_res = client.get(f"/publish/jobs?creator_id=ali-abdaal&status=PENDING_APPROVAL")
    assert list_res.status_code == 200
    assert any(j["job_id"] == job_id for j in list_res.json()), "Created job not found in approval queue"
    print(f"  -> Verified job {job_id} in approval queue.")

    # Approve job (Human in the loop)
    approve_res = client.post(
        f"/publish/jobs/{job_id}/approve",
        json={
            "reviewer_name": "Ali Abdaal (Lead Creator)",
            "feedback": "Hook is punchy, approved for direct broadcast."
        }
    )
    assert approve_res.status_code == 200, f"Approve failed: {approve_res.text}"
    approved_data = approve_res.json()
    assert approved_data["job"]["status"] == "PUBLISHED", "Job should transition to PUBLISHED after approval"
    print(f"  -> Human Approval executed. Composio action status: {approved_data['job']['composio_execution_status']}")
    print(f"  -> Published link generated: {approved_data['job']['published_url']}")

    # 5. Test /profiling
    print("\n[5/5] Testing /profiling Endpoint (Ingesting real YouTube videos, Substack & generating user.md / hook.md)...")
    prof_payload = {
        "creator_name": "Ali Abdaal",
        "substack_handle_or_url": "https://aliabdaal.substack.com/feed",
        "max_videos_to_analyze": 3,
        "max_articles_to_analyze": 2
    }
    prof_res = client.post("/profiling", json=prof_payload)
    assert prof_res.status_code == 200, f"Profiling failed: {prof_res.text}"
    prof_data = prof_res.json()
    assert prof_data["user_md"], "user_md not generated"
    assert prof_data["hook_md"], "hook_md not generated"
    assert len(prof_data["analysis"]["frequent_spoken_phrases"]) > 0, "No spoken phrases extracted from transcripts"
    
    print(f"  -> Successfully generated user.md ({len(prof_data['user_md'])} chars) and hook.md ({len(prof_data['hook_md'])} chars)")
    print(f"  -> Spoken vocal mannerisms extracted from audio:")
    for phrase_item in prof_data["analysis"]["frequent_spoken_phrases"][:3]:
        print(f"     * \"{phrase_item['phrase']}\" ({phrase_item['category']})")
    print(f"  -> Persisted files at: {prof_data['file_paths']}")
    saved_profile_res = client.get(f"/profiling/{prof_data['creator_slug']}")
    assert saved_profile_res.status_code == 200, f"Profile retrieval failed: {saved_profile_res.text}"

    # 6. Test /intelligence (Cross-Platform Creator Footprint & Trends)
    print("\n[6/6] Testing /intelligence Endpoint (Auditing creator footprint across YouTube, Instagram, LinkedIn, X)...")
    intel_payload = {
        "creator_name": "Raiyyan Patel",
        "niche": "AI & Full-Stack Development",
        "location": "IN",
        "platforms": ["youtube", "instagram", "linkedin", "x_twitter"],
        "goals": {
            "youtube": "increase_followers",
            "instagram": "increase_reach",
            "linkedin": "increase_connections",
            "x_twitter": "increase_engagement"
        },
        "generate_platform_md": True
    }
    intel_res = client.post("/intelligence", json=intel_payload)
    assert intel_res.status_code == 200, f"Intelligence failed: {intel_res.text}"
    intel_data = intel_res.json()
    assert len(intel_data["platforms_analyzed"]) == 4, "Not all 4 platforms were analyzed"
    assert "creator_profiles" in intel_data, "creator_profiles missing from response"
    assert len(intel_data["platform_md_files"]) == 4, "Not all 4 platform.md files were generated"
    print(f"  -> Successfully audited {len(intel_data['platforms_analyzed'])} platforms.")
    for p, profile in intel_data["creator_profiles"].items():
        print(f"     * [{p}] Handle: {profile.get('handle')}, Diagnostics: {profile.get('growth_gap_analysis')[:75]}...")
    print(f"  -> Generated Strategy Reports: {list(intel_data['platform_md_files'].keys())}")
    print(f"  -> AI Content Blueprints generated: {len(intel_data['top_recommendations'])}")

    test_additional_api_routes()

    print("\n" + "=" * 60)
    print("ALL 5 CREATOR AI CORE ENGINES VERIFIED AND PASSING SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
