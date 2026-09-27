import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing Backend Endpoints...")
    
    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print("[PASS] /api/health:", res.json()["service"])

    # 2. Projects
    res = client.get("/api/projects")
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) >= 3
    print(f"[PASS] /api/projects: {len(projects)} projects loaded")

    # 3. Pipeline
    res = client.get(f"/api/pipeline/{projects[0]['id']}")
    assert res.status_code == 200
    print("[PASS] /api/pipeline: DAG steps loaded")

    # 4. 3D World Scene (USP 1)
    res = client.get(f"/api/world3d/{projects[0]['id']}")
    assert res.status_code == 200
    scene = res.json()
    assert len(scene["objects"]) >= 4
    assert len(scene["camera_presets"]) >= 4
    print(f"[PASS] /api/world3d: {len(scene['objects'])} 3D entities, {len(scene['camera_presets'])} camera presets")

    # 5. AI Agent Chat (USP 2)
    res = client.post("/api/agent/chat", json={"project_id": projects[0]["id"], "prompt": "Make an energetic 28s Short"})
    assert res.status_code == 200
    agent_data = res.json()
    assert len(agent_data["diff_actions"]) >= 3
    print(f"[PASS] /api/agent/chat: {len(agent_data['diff_actions'])} diff actions proposed")

    # 6. Repurpose Engine (USP 3)
    res = client.get(f"/api/repurpose/{projects[0]['id']}")
    assert res.status_code == 200
    repurpose = res.json()
    assert len(repurpose["shorts"]) >= 3
    print(f"[PASS] /api/repurpose: {len(repurpose['shorts'])} viral shorts generated with Hook Scores up to {repurpose['shorts'][0]['hook_score']}/100")

    # 7. Office Kit (USP 4)
    res = client.get("/api/officekit/status")
    assert res.status_code == 200
    office = res.json()
    assert office["laptop_connected"] is True
    print(f"[PASS] /api/officekit/status: Connected with {office['latency_ms']}ms latency")

    print("\nALL 7 BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
