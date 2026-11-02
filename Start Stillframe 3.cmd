@echo off
rem Stillframe 3 (by Claude): double-click to build the studio and open it at http://localhost:5174
rem Keep this window open while you work; close it to stop Stillframe 3.
title Stillframe 3 - localhost 5174
cd /d "%~dp0"
call npm run stillframe3 -- --open
pause
