@echo off
echo ========================================
echo  Soft Calculator - APK Build Script
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building Android APK...
cd android
call .\gradlew.bat assembleRelease -x lint -x test

echo.
echo ========================================
if exist app\build\outputs\apk\release\app-release.apk (
    echo BUILD SUCCESSFUL!
    echo APK Location: android\app\build\outputs\apk\release\app-release.apk
    echo.
    copy app\build\outputs\apk\release\app-release.apk ..\soft-calculator.apk
    echo Copied to: soft-calculator.apk
) else (
    echo Build may have failed. Check for errors above.
)
echo ========================================
pause
