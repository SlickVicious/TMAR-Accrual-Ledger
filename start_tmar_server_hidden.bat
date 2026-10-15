@echo off
REM ============================================================
REM  start_tmar_server_hidden.bat
REM  Hidden auto-start wrapper for the TMAR local server.
REM  Serves http://localhost:5501 (loopback only).
REM  Launched by the "TMAR Local Server" Scheduled Task at logon
REM  (and re-fired every 5 min as a self-healing watchdog).
REM
REM  Idempotent: exits immediately if 5501 is already listening,
REM  so the 5-minute watchdog never spawns a duplicate server.
REM
REM  Uses `start /min` to DETACH the server from the task's console
REM  so it survives independently (same pattern as the working
REM  8100/8101/8102 servers). The previous version ran python in the
REM  FOREGROUND, so it shared the task's console and was killed with
REM  Ctrl+C (0xC000013A) whenever the console/session tore down.
REM ============================================================
cd /d "%~dp0"

netstat -ano | findstr ":5501 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 exit /b 0

start "" /min C:\Python313\python.exe -m http.server 5501 --bind 127.0.0.1
