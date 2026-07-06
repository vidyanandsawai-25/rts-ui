# Change to RTS directory
cd E:\RTS

# 1. Clean old folder if it exists
if (Test-Path RTS-Database-Manager) {
    Write-Host "Cleaning existing RTS-Database-Manager folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force RTS-Database-Manager
}

# 2. Clone the team repository
Write-Host "Cloning SthapatyaConsultants/ntis-database-manager..." -ForegroundColor Green
git clone https://github.com/SthapatyaConsultants/ntis-database-manager.git RTS-Database-Manager

# 3. Enter the repository
cd RTS-Database-Manager

# 4. Configure git remotes (upstream and origin)
Write-Host "Configuring remotes..." -ForegroundColor Green
git remote rename origin upstream
git remote add origin https://github.com/vidyanandsawai-25/rts-database-manager.git

# 5. Remove workflows to bypass PAT token scope
Write-Host "Removing workflows..." -ForegroundColor Green
Remove-Item -Recurse -Force .github
git add .
git commit -m "chore: remove github workflows to bypass token scope"

# 6. Push to personal origin
Write-Host "Pushing code to your personal GitHub repository..." -ForegroundColor Green
git push -u origin main

Write-Host "Setup completed successfully!" -ForegroundColor Green
