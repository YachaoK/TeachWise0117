@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 修复提交信息乱码问题
echo ========================================
echo.

echo 正在检查当前提交...
git log --oneline -1
echo.

echo 正在修改最后一次提交信息为英文...
git commit --amend -m "Initial commit: TeachWise prototype project"

echo.
echo 修改完成！新的提交信息：
git log --oneline -1
echo.

echo 如果需要推送到GitHub，请运行：
echo git push -u origin main --force
echo.

pause
