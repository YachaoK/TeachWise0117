@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 修复所有提交信息为英文（简单方法）
echo ========================================
echo.

echo 查看所有提交：
git log --oneline --all
echo.

echo 方法：重置并重新提交所有文件
echo 警告：这将重写提交历史
echo.
set /p confirm="确认继续？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo 正在备份当前分支...
git branch backup-before-fix 2>nul

echo.
echo 正在重置到初始状态并重新提交...
REM 获取第一个提交的父（即空提交）
git reset --soft $(git hash-object -t tree /dev/null 2>nul || echo 4b825dc642cb6eb9a060e54bf8d69288fbee4904)

REM 如果上面的命令失败，尝试另一种方法
if errorlevel 1 (
    echo 尝试另一种重置方法...
    git update-ref -d HEAD
)

echo.
echo 重新提交所有文件（使用英文信息）...
git add .
git commit -m "Initial commit: TeachWise prototype project"

echo.
echo 查看新的提交历史：
git log --oneline --all
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 如果需要推送到 GitHub，请运行：
echo git push -u origin main --force
echo.
echo 注意：这会覆盖远程仓库的历史
echo.

pause
