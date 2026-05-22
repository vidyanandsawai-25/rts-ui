# ============================================================
# NTIS-UI IIS Deployment Script
# Run from the project root: .\iis\deploy.ps1
# ============================================================
# In Next.js standalone mode the following MUST be copied
# after every build (they are NOT auto-included by Next.js):
#
#   .next\static\  -->  .next\standalone\.next\static\
#   public\        -->  .next\standalone\public\
#
# Without these copies every request to /_next/static/*.css
# and /_next/static/*.js hits Node.js which has no handler
# for them, returns 500 with text/plain  →  blank/unstyled page.
# ============================================================

param (
    [string]$Env      = "production",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

# Always work from the project root (one level up from iis/)
Set-Location "$PSScriptRoot\.."

Write-Host "=== NTIS-UI IIS Deployment ===" -ForegroundColor Cyan
Write-Host "Environment : $Env"              -ForegroundColor Yellow
Write-Host "Working dir : $(Get-Location)"   -ForegroundColor Yellow

# ------------------------------------------------------------------
# Step 1 – Build
# ------------------------------------------------------------------
if (-not $SkipBuild) {
    Write-Host "`n[1/3] Building Next.js standalone bundle..." -ForegroundColor Cyan
    $env:NODE_ENV = $Env
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed. Aborting."
        exit 1
    }
    Write-Host "      Build complete." -ForegroundColor Green
} else {
    Write-Host "`n[1/3] Skipping build (-SkipBuild)." -ForegroundColor Yellow
}

$standaloneDir = ".next\standalone"
if (-not (Test-Path $standaloneDir)) {
    Write-Error "Standalone dir '$standaloneDir' not found. Ensure output='standalone' in next.config.ts and NODE_ENV=production."
    exit 1
}

# ------------------------------------------------------------------
# Step 2 – Copy _next/static/ into standalone
# ------------------------------------------------------------------
Write-Host "`n[2/3] Copying _next\static\ into standalone..." -ForegroundColor Cyan
$staticSrc  = ".next\static"
$staticDest = "$standaloneDir\.next\static"

if (Test-Path $staticSrc) {
    if (Test-Path $staticDest) { Remove-Item $staticDest -Recurse -Force }
    Copy-Item $staticSrc $staticDest -Recurse -Force
    Write-Host "      Copied: $staticSrc  -->  $staticDest" -ForegroundColor Green
} else {
    Write-Warning "Source '$staticSrc' not found -- static assets will be missing."
}

# ------------------------------------------------------------------
# Step 3 – Copy public/ into standalone
# ------------------------------------------------------------------
Write-Host "`n[3/3] Copying public\ into standalone..." -ForegroundColor Cyan
$publicSrc  = "public"
$publicDest = "$standaloneDir\public"

if (Test-Path $publicSrc) {
    if (Test-Path $publicDest) { Remove-Item $publicDest -Recurse -Force }
    Copy-Item $publicSrc $publicDest -Recurse -Force
    Write-Host "      Copied: $publicSrc  -->  $publicDest" -ForegroundColor Green
} else {
    Write-Warning "Source '$publicSrc' not found -- public assets will be missing."
}

# ------------------------------------------------------------------
# Done
# ------------------------------------------------------------------
Write-Host "`n=== Deployment package ready ===" -ForegroundColor Green
Write-Host "Standalone server : $standaloneDir\server.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps on the IIS server:" -ForegroundColor Cyan
Write-Host "  1. Copy the '$standaloneDir' folder to the server" -ForegroundColor White
Write-Host "  2. Place iis\reverse-proxy-web.config as web.config in the IIS site root" -ForegroundColor White
Write-Host "  3. Ensure .env (PORT=5000, NODE_ENV=production, NEXT_PUBLIC_API_BASE_URL=...) is set" -ForegroundColor White
Write-Host "  4. Start Node: node server.js  (via pm2 / nssm / Windows Service)" -ForegroundColor White
Write-Host "  5. Confirm IIS ARR proxy target is http://127.0.0.1:5000" -ForegroundColor White
