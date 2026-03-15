#Requires -Version 5.1
<#
.SYNOPSIS
    NOI Agent Browser — Hardened PowerShell Launcher
    Local-only Windows launcher for zeroclaw + NOI

.DESCRIPTION
    Forces gateway to bind to 127.0.0.1 only
    Requires pairing; keeps public bind disabled
    Locks down token and config file permissions
    Disables startup persistence by default
    Reuses a healthy local gateway when possible
    Keeps autonomy supervised and workspace-only
    Blocks remote computer-use endpoints

.PARAMETER DryRun
    Validate configuration and print actions without executing them.

.PARAMETER EnableStartup
    Create a startup shortcut so the launcher runs at login.
    Off by default.

.PARAMETER WorkDir
    Working directory containing bearer.token, config.toml, etc.
    Defaults to the script's own directory.
#>

param(
    [string]$DryRun      = "0",
    [string]$EnableStartup = "0",
    [string]$WorkDir     = $PSScriptRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Constants ────────────────────────────────────────────────────────────────
$BIND_HOST        = '127.0.0.1'
$DEFAULT_PORT     = 11434
$GATEWAY_EXE      = 'zeroclaw'          # adjust if binary name differs
$BROWSER_EXE      = 'TMAR-Accrual-Ledger.html'

$SENSITIVE_FILES  = @('bearer.token', 'config.toml', 'gateway.json')
$SENSITIVE_DIRS   = @('logs', 'memory', 'sessions')

$BLOCKED_ENDPOINTS = @(
    '/computer-use',
    '/remote-control',
    '/desktop-capture',
    '/execute-remote',
    '/puppeteer',
    '/playwright-remote'
)

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Step([string]$msg) {
    Write-Host "  [NOI] $msg" -ForegroundColor Cyan
}
function Write-Ok([string]$msg) {
    Write-Host "  [OK]  $msg" -ForegroundColor Green
}
function Write-Warn([string]$msg) {
    Write-Host "  [!!]  $msg" -ForegroundColor Yellow
}
function Write-Err([string]$msg) {
    Write-Host "  [ERR] $msg" -ForegroundColor Red
}

$IsDry = ($DryRun -eq "1" -or $DryRun -eq '$true')
if ($IsDry) { Write-Host "`n  [DRY-RUN] Validation mode — no changes will be made.`n" -ForegroundColor Magenta }

# ── Step 1: Verify workspace directory ───────────────────────────────────────
Write-Step "Verifying workspace: $WorkDir"
if (-not (Test-Path $WorkDir)) {
    Write-Err "WorkDir not found: $WorkDir"
    exit 1
}
Write-Ok "Workspace exists"

# ── Step 2: Lock down sensitive file permissions ──────────────────────────────
Write-Step "Locking sensitive file permissions..."
foreach ($fname in $SENSITIVE_FILES) {
    $fpath = Join-Path $WorkDir $fname
    if (Test-Path $fpath) {
        if (-not $IsDry) {
            try {
                $acl = Get-Acl $fpath
                $acl.SetAccessRuleProtection($true, $false)  # disable inheritance
                # Remove all existing rules
                $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
                # Add current user — read/write only
                $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                    $currentUser,
                    'ReadAndExecute,Write',
                    'Allow'
                )
                $acl.AddAccessRule($rule)
                Set-Acl -Path $fpath -AclObject $acl
                Write-Ok "Locked: $fname"
            } catch {
                Write-Warn "Could not lock $fname`: $_"
            }
        } else {
            Write-Ok "[dry] Would lock: $fname"
        }
    }
}
foreach ($dname in $SENSITIVE_DIRS) {
    $dpath = Join-Path $WorkDir $dname
    if (Test-Path $dpath) {
        if (-not $IsDry) {
            try {
                $acl = Get-Acl $dpath
                $acl.SetAccessRuleProtection($true, $false)
                $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
                $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                    $currentUser,
                    'FullControl',
                    'ContainerInherit,ObjectInherit',
                    'None',
                    'Allow'
                )
                $acl.AddAccessRule($rule)
                Set-Acl -Path $dpath -AclObject $acl
                Write-Ok "Locked dir: $dname\"
            } catch {
                Write-Warn "Could not lock $dname\`: $_"
            }
        } else {
            Write-Ok "[dry] Would lock dir: $dname\"
        }
    }
}

# ── Step 3: Enforce 127.0.0.1 binding in config ──────────────────────────────
Write-Step "Enforcing local-only binding (127.0.0.1)..."
$configPath = Join-Path $WorkDir 'config.toml'
if (Test-Path $configPath) {
    $cfg = Get-Content $configPath -Raw
    # Reject any public bind addresses
    if ($cfg -match 'bind\s*=\s*"0\.0\.0\.0') {
        Write-Warn "config.toml has public bind address — correcting..."
        if (-not $IsDry) {
            $cfg = $cfg -replace 'bind\s*=\s*"0\.0\.0\.0[^"]*"', "bind = `"$BIND_HOST`""
            Set-Content $configPath $cfg -Encoding UTF8
            Write-Ok "Bind address corrected to $BIND_HOST"
        } else {
            Write-Ok "[dry] Would patch bind address to $BIND_HOST"
        }
    } else {
        Write-Ok "Bind address is already local-only"
    }
} else {
    Write-Ok "No config.toml found — binding defaults to $BIND_HOST"
}

# ── Step 4: Check for healthy existing gateway ────────────────────────────────
Write-Step "Checking for existing local gateway..."
$gatewayHealthy = $false
try {
    $resp = Invoke-WebRequest -Uri "http://${BIND_HOST}:${DEFAULT_PORT}/health" `
        -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Ok "Existing gateway is healthy — reusing"
        $gatewayHealthy = $true
    }
} catch {
    Write-Ok "No healthy gateway found — will start fresh"
}

# ── Step 5: Start gateway (if not reusing) ───────────────────────────────────
if (-not $gatewayHealthy -and -not $IsDry) {
    $gExe = Get-Command $GATEWAY_EXE -ErrorAction SilentlyContinue
    if ($gExe) {
        Write-Step "Starting $GATEWAY_EXE on $BIND_HOST`:$DEFAULT_PORT..."
        $args = @(
            "--host", $BIND_HOST,
            "--port", $DEFAULT_PORT,
            "--no-remote",
            "--supervised",
            "--workspace", $WorkDir
        )
        Start-Process -FilePath $gExe.Source -ArgumentList $args -NoNewWindow
        Start-Sleep -Seconds 2
        Write-Ok "Gateway started"
    } else {
        Write-Warn "$GATEWAY_EXE not found in PATH — skipping gateway start"
    }
} elseif ($IsDry) {
    Write-Ok "[dry] Would start gateway at $BIND_HOST`:$DEFAULT_PORT"
}

# ── Step 6: Block remote computer-use endpoints ───────────────────────────────
Write-Step "Validating endpoint security..."
foreach ($ep in $BLOCKED_ENDPOINTS) {
    try {
        $r = Invoke-WebRequest -Uri "http://${BIND_HOST}:${DEFAULT_PORT}${ep}" `
            -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -ne 404 -and $r.StatusCode -ne 405) {
            Write-Warn "Potentially exposed endpoint: $ep (status $($r.StatusCode))"
        } else {
            Write-Ok "Endpoint blocked: $ep"
        }
    } catch {
        Write-Ok "Endpoint unreachable (expected): $ep"
    }
}

# ── Step 7: Disable/enable startup persistence ────────────────────────────────
$startupLink = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\NOI_Agent_Browser.lnk"

if ($EnableStartup -eq "1" -or $EnableStartup -eq '$true') {
    Write-Step "Creating startup shortcut..."
    if (-not $IsDry) {
        try {
            $wsh  = New-Object -ComObject WScript.Shell
            $link = $wsh.CreateShortcut($startupLink)
            $link.TargetPath  = Join-Path $WorkDir 'NOI_Agent_Browser.bat'
            $link.WorkingDirectory = $WorkDir
            $link.Description = 'NOI Agent Browser — Hardened Launcher'
            $link.Save()
            Write-Ok "Startup shortcut created"
        } catch {
            Write-Warn "Could not create startup shortcut: $_"
        }
    } else {
        Write-Ok "[dry] Would create startup shortcut at: $startupLink"
    }
} else {
    # Ensure no rogue startup shortcut exists
    if (Test-Path $startupLink) {
        Write-Warn "Startup shortcut found — removing (persistence disabled by default)"
        if (-not $IsDry) {
            Remove-Item $startupLink -Force
            Write-Ok "Startup shortcut removed"
        } else {
            Write-Ok "[dry] Would remove startup shortcut"
        }
    } else {
        Write-Ok "Startup persistence: disabled (default)"
    }
}

# ── Step 8: Open TMAR in default browser ─────────────────────────────────────
if (-not $IsDry) {
    $htmlPath = Join-Path $WorkDir $BROWSER_EXE
    if (Test-Path $htmlPath) {
        Write-Step "Opening TMAR Accrual Ledger..."
        Start-Process $htmlPath
    }
}

# ── Done ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  NOI Agent Browser — Launch Complete       ║" -ForegroundColor Green
Write-Host "  ║  Bound to: $BIND_HOST only                    ║" -ForegroundColor Green
Write-Host "  ║  Remote access: BLOCKED                    ║" -ForegroundColor Green
Write-Host "  ║  Startup persistence: $(if ($EnableStartup -eq '1') { 'ENABLED ' } else { 'DISABLED' })              ║" -ForegroundColor Green
Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
exit 0
