@echo off
echo ========================================================
echo Pushing Apex Health Clinic to GitHub (kavi930/CarePlus-Clinic)
echo ========================================================
cd /d "C:\Users\HP\.gemini\antigravity-ide\scratch\careplus-clinic"
"%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Pushed all files to GitHub!
    echo Vercel will now automatically trigger a live deployment.
) else (
    echo [NOTICE] If prompted for credentials, please sign in or use a GitHub Personal Access Token.
)
pause
