@echo off
setlocal
title Dragonswood Brian Narration Generator
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\narration\run-azure-brian.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Brian generation stopped with an error. Nothing incomplete was added to the site manifest.
if "%RESULT%"=="0" echo Brian narration finished successfully.
pause
exit /b %RESULT%
