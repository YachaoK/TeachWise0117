@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 修复提交信息为英文
echo ========================================
echo.

echo 当前提交信息：
git log --oneline -1
echo.

echo 正在修改提交信息...
git commit --amend -m "Initial commit: TeachWise prototype project"

echo.
echo 修改后的提交信息：
git log --oneline -1
echo.

echo ========================================
echo 提交信息已修改为英文
echo ========================================
echo.
echo 如果需要推送到 GitHub，请运行：push-now.bat
echo 或者运行：git push -u origin main --force
echo.

pause
