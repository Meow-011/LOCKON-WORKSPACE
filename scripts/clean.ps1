<#
.SYNOPSIS
LOCKON Workspace - Deep Clean Script (Windows)

.DESCRIPTION
Stops all containers and permanently deletes all data and configuration inside the volumes/ directory.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
Set-Location $ProjectDir

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  LOCKON Workspace - Deep Clean" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "WARNING: This will destroy ALL database data and configurations permanently!" -ForegroundColor Red
Write-Host "Type 'YES' (all caps) to confirm: " -NoNewline
$confirmation = Read-Host

if ($confirmation -cne "YES") {
    Write-Host "Aborted. No data was deleted." -ForegroundColor Green
    exit
}

Write-Host "`n[1/3] Stopping and removing containers..." -ForegroundColor Yellow
docker compose down -v

Write-Host "`n[2/3] Deleting local data volumes..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .\volumes\app -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\volumes\db -ErrorAction SilentlyContinue
Write-Host "Volumes deleted."

Write-Host "`n[3/3] Recreating required directory structure..." -ForegroundColor Yellow
$Directories = @(
    ".\volumes\app\mattermost\config",
    ".\volumes\app\mattermost\data",
    ".\volumes\app\mattermost\logs",
    ".\volumes\app\mattermost\plugins",
    ".\volumes\app\mattermost\client\plugins",
    ".\volumes\app\mattermost\bleve-indexes"
)

foreach ($dir in $Directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "Directories recreated."

Write-Host "`n✅ Done! The workspace has been completely reset to a fresh state." -ForegroundColor Green
Write-Host "Run 'docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d' to start again."
