@echo off
REM ============================================================
REM  start_tmar_server_hidden.bat
REM  Hidden auto-start wrapper for the TMAR local server.
REM  Serves http://localhost:5501 (loopback only, repo root).
REM  Launched by the "TMAR Local Server" Scheduled Task at logon
REM  (and re-fired every 5 min as a self-healing watchdog).
REM
REM  Idempotent: exits immediately if 5501 is already listening,
REM  so the 5-minute watchdog never spawns a duplicate server.
REM
REM  CRITICAL (2026-11-21) -- why the UI stopped launching:
REM  pythonw.exe has NO stdout/stderr handles. Python 3.13's
REM  http.server writes one log line per request via
REM  log_message() -> sys.stderr.write(). With no handle that write
REM  RAISES, the request handler dies mid-response, the socket
REM  closes with zero bytes, and the browser reports
REM  "connection closed unexpectedly" / ERR_EMPTY_RESPONSE -- while
REM  the process is still alive and LISTENING (so it looks like the
REM  server is up).
REM  Do NOT "fix" this with `start "" /min ... > log 2>&1`: cmd
REM  applies that redirect to the `start` command, NOT to the
REM  detached child, so the log stays 0 bytes and pythonw is still
REM  handle-less.
REM  The real fix: launch _serve_static.py, which subclasses the
REM  handler and makes access logging non-fatal.
REM ============================================================
cd /d "%~dp0"

setlocal
set "PORT=5501"
set "PYW=C:\Python313\pythonw.exe"
set "SCRIPT=%~dp0_serve_static.py"
set "TMAR_PORT=5501"
set "TMAR_ROOT=%~dp0"
set "TMAR_NOACCESSLOG=1"

netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 exit /b 0

start "" /min "%PYW%" "%SCRIPT%"
