@echo off
echo Starting CognivueX Backend...
echo This will bind to 0.0.0.0 so your phone can reach it.
echo IF WINDOWS FIREWALL PROMPTS YOU, CLICK "ALLOW ACCESS".
cd %~dp0backend
call venv\Scripts\activate 2>nul
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
