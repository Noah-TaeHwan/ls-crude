@echo off
cd /d "%~dp0"
where py >nul 2>&1 && (py -3 serve.py & goto :eof)
where python >nul 2>&1 && (python serve.py & goto :eof)
where python3 >nul 2>&1 && (python3 serve.py & goto :eof)
echo Python 3 is not installed. https://www.python.org/downloads/
pause
