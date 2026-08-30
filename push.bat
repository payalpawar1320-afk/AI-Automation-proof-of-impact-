@echo off
setlocal

set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"

if not exist "%GIT_PATH%" (
    set "GIT_PATH=git"
)

echo ========================================================
echo     Proof of Impact - Uploading to GitHub
echo ========================================================
echo.

set /p MSG="Enter commit message (or press Enter to push): "
if "%MSG%"=="" set "MSG=Update Proof of Impact platform"

"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "%MSG%" 2>nul

echo.
echo Uploading files to GitHub...
"%GIT_PATH%" push -u origin main --force

echo.
echo ========================================================
echo     Upload Complete! Check your GitHub repository.
echo ========================================================
echo.
pause
