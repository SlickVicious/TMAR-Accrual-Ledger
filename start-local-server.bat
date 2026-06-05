@echo off
REM ============================================================
REM  start-local-server.bat
REM  Serves the TMAR app locally over HTTP so it has a STABLE
REM  origin (localStorage persists, no file:// security errors,
REM  behaves like the deployed site). Double-click to run.
REM
REM  Bookmark this URL and use it for ALL local testing:
REM      http://localhost:5501/TMAR-Accrual-Ledger.html
REM  (Configure your CORS proxy + API key ONCE on that origin;
REM   they'll persist as long as you keep using localhost:5501.)
REM ============================================================
setlocal
set "PORT=5501"
set "PAGE=TMAR-Accrual-Ledger.html"

REM Always serve from THIS script's folder, even if double-clicked from elsewhere.
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo [!] Python was not found on your PATH.
  echo     Install it from https://python.org  ^(check "Add to PATH"^),
  echo     or use VS Code Live Server instead.
  echo.
  pause
  exit /b 1
)

if not exist "%PAGE%" (
  echo [!] %PAGE% not found in this folder:
  echo     %CD%
  echo     Put this .bat in the same folder as the TMAR HTML file.
  echo.
  pause
  exit /b 1
)

echo ============================================================
echo   TMAR local server
echo   Folder : %CD%
echo   URL    : http://localhost:%PORT%/%PAGE%
echo ------------------------------------------------------------
echo   A separate "TMAR Local Server" window will open and STAY
echo   running. CLOSE that window (or press Ctrl+C in it) to stop.
echo ============================================================

REM Launch the server in its own persistent window (inherits this cwd),
REM wait a moment for it to bind, then open the browser to the app.
start "TMAR Local Server" cmd /k python -m http.server %PORT%
timeout /t 1 /nobreak >nul
start "" "http://localhost:%PORT%/%PAGE%"

endlocal
exit /b 0
