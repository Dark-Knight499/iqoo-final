from fastapi.testclient import TestClient

from app.main import app
from app.config import settings


def test_health_and_frontend_routes():
    client = TestClient(app)
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'healthy'
    assert settings.PORT == 8001

    paths = client.get('/openapi.json').json()['paths']
    assert {'/profiling', '/dashboard', '/trends', '/intelligence', '/clipping/analyze'} <= paths.keys()
