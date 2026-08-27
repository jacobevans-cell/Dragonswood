@echo off
node scripts\vendor-three.mjs
if errorlevel 1 exit /b %errorlevel%
