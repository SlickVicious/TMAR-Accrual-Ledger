@echo off
setlocal EnableDelayedExpansion

:: ═══════════════════════════════════════════════════════════════
:: NOI Agent Browser — Hardened Local Launcher
:: Forces 127.0.0.1 binding, workspace-only autonomy
:: Usage:
::   NOI_Agent_Browser.bat                  (normal start)
::   NOI_Agent_Browser.bat --dry-run        (validate without starting)
::   NOI_Agent_Browser.bat --enable-startup (add startup shortcut)
:: ═══════════════════════════════════════════════════════════════

title NOI Agent Browser — Hardened Launcher
color 0A

:: ── Parse arguments ─────────────────────────────────────────────
set "DRY_RUN=0"
set "ENABLE_STARTUP=0"

:argloop
if /i "%~1"=="--dry-run"        set "DRY_RUN=1"
if /i "%~1"=="--enable-startup" set "ENABLE_STARTUP=1"
shift
if not "%~1"=="" goto argloop

:: ── Display banner ───────────────────────────────────────────────
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║          NOI AGENT BROWSER — HARDENED LAUNCHER          ║
echo  ║        zeroclaw + NOI / Local-Only / SYPHER-7.8          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

if "%DRY_RUN%"=="1" (
  echo  [DRY-RUN] Validation mode — no gateway will be started.
  echo.
)

:: ── Verify PowerShell is available ───────────────────────────────
where powershell.exe >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] PowerShell not found. Cannot continue.
  pause & exit /b 1
)

:: ── Verify harden script exists ──────────────────────────────────
if not exist "%~dp0NOI_Agent_Browser_Harden.ps1" (
  echo  [ERROR] NOI_Agent_Browser_Harden.ps1 not found in %~dp0
  pause & exit /b 1
)

:: ── Launch hardening script ──────────────────────────────────────
echo  Starting hardened launch sequence...
echo.

powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass ^
  -File "%~dp0NOI_Agent_Browser_Harden.ps1" ^
  -DryRun:%DRY_RUN% ^
  -EnableStartup:%ENABLE_STARTUP% ^
  -WorkDir:"%~dp0"

set PS_EXIT=%ERRORLEVEL%

if %PS_EXIT% NEQ 0 (
  echo.
  echo  [ERROR] Hardening script exited with code %PS_EXIT%.
  echo  Check the output above for details.
  pause & exit /b %PS_EXIT%
)

if "%DRY_RUN%"=="1" (
  echo.
  echo  [DRY-RUN] Validation complete. No gateway started.
  pause & exit /b 0
)

echo.
echo  NOI Agent Browser is running at http://127.0.0.1
echo  Close this window to stop the gateway.
echo.
pause
endlocal
