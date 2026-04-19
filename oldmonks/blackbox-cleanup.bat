@echo off
REM Git cleanup batch - run as admin if needed
echo Installing Git if missing...

winget install --id Git.Git -e --source winget --silent

REM Refresh PATH
set PATH=%PATH%;C:\Program Files\Git\bin;C:\Program Files\Git\cmd

git --version

git add .gitignore TODO.md
git rm --cached -r "AppData/Local/CapCut/" 2>nul
git commit -m "blackboxai/cleanup: remove CapCut cache, add .gitignore"
git push origin main

echo Cleanup done! Check git status.
pause

