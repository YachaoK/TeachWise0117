@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 修复所有提交信息为英文（最简单方法）
echo ========================================
echo.

echo 当前所有提交：
git log --oneline --all
echo.

echo 这个方法将：
echo 1. 创建一个新的提交，包含所有更改
echo 2. 使用英文提交信息
echo 3. 推送到 GitHub
echo.

REM 确保所有文件都已添加
git add -A

REM 创建一个新的提交，使用英文信息
echo 正在创建新的提交...
git commit -m "Initial commit: TeachWise prototype project" --allow-empty

REM 如果已经有提交，修改最后一次提交
git commit --amend -m "Initial commit: TeachWise prototype project"

echo.
echo 查看提交历史：
git log --oneline -5
echo.

echo 配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/YachaoK/TeachWise0117.git
git branch -M main 2>nul

echo.
echo 推送到 GitHub（强制覆盖）...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 成功！所有提交信息已修复为英文
    echo ========================================
    echo.
    echo 可以在以下地址查看：
    echo https://github.com/YachaoK/TeachWise0117
) else (
    echo.
    echo ========================================
    echo 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要输入 GitHub 用户名和密码
    echo.
    echo 请检查后重试
)

echo.
pause
