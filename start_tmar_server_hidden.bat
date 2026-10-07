@echo off
REM ============================================================
REM  start_tmar_server_hidden.bat
REM  Hidden auto-start wrapper for the TMAR local server.
REM  Serves http://localhost:5501 (loopback only), logging to
REM  %LOCALAPPDATA%\TMAR\tmar-server.log
REM  Launched by the "TMAR Local Server" Scheduled Task at logon.
REM ============================================================
cd /d "%~dp0"
set "PORT=5501"
set "LOGDIR=%LOCALAPPDATA%\TMAR"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
"C:\Python313\python.exe" -m http.server %PORT% --bind 127.0.0.1 >> "%LOGDIR%\tmar-server.log" 2>&1
