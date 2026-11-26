@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set PYTHONUTF8=1
where py >nul 2>nul
if errorlevel 1 (set "PY=python") else (set "PY=py -3")
%PY% -c "import playwright, bs4"
if errorlevel 1 (
 echo Missing dependencies. Install with: %PY% -m pip install playwright beautifulsoup4
 pause
 exit /b 1
)
%PY% assets\qa\run-windows-211.py --memory
set RESULT=%ERRORLEVEL%
echo Exit code: %RESULT% . Return the QA_RESULTS_211_MEMORY_*.zip shown above.
pause
exit /b %RESULT%
