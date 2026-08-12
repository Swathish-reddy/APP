import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "online",
        "service": "CogniVueX AI Platform Backend",
        "version": "1.0.0"
    }

def test_cors_headers():
    response = client.options("/", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_websocket_vitals_not_found():
    # Test websocket connection rejection for non-existent patient
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/vitals/invalid_id") as websocket:
            websocket.receive_text()
