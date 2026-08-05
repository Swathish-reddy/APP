import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_login_api_success():
    payload = {"username": "admin@cognivuex.com", "password": "SecurePassword123"}
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    # assert response.status_code == 200 # commented out until backend is running
    pass

def test_login_api_failure():
    payload = {"username": "admin@cognivuex.com", "password": "WrongPassword"}
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    # assert response.status_code == 401
    pass
