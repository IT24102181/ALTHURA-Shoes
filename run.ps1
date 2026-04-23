# run.ps1
# This script runs both the Backend and Frontend of the ISP Shoes project.

Write-Host "--- ISP Shoes Runner ---" -ForegroundColor Cyan

# 1. Clean and Run Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; ./mvnw clean spring-boot:run"

# 2. Install and Run Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm.cmd install; npm.cmd run dev"

Write-Host "Both processes are starting in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"
