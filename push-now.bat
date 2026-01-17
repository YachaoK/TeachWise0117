@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 正在修复提交信息并推送到 GitHub...
echo ========================================
echo.

echo [1/5] 检查当前提交信息...
git log --oneline -1
echo.

echo [2/5] 检查是否有未提交的更改...
git status --short
echo.

echo [3/5] 修改最后一次提交信息为英文...
git commit --amend -m "Initial commit: TeachWise prototype project"
if errorlevel 1 (
    echo 错误：无法修改提交，检查是否有提交...
    git log --oneline -1
    if errorlevel 1 (
        echo 没有找到提交，创建新提交...
        git add .
        git commit -m "Initial commit: TeachWise prototype project"
    )
)
echo.

echo [4/5] 验证提交信息已修改...
git log --oneline -1
echo.

echo [5/5] 配置远程仓库并推送...
git remote remove origin 2>nul
git remote add origin https://github.com/YachaoK/TeachWise0117.git
git branch -M main 2>nul
git push -u origin main --force
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo 推送成功！
    echo ========================================
    echo.
    echo 可以在以下地址查看：
    echo https://github.com/YachaoK/TeachWise0117
) else (
    echo ========================================
    echo 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要输入 GitHub 用户名和密码
    echo 3. 需要配置 SSH 密钥
    echo.
    echo 请检查网络连接后重试
)

echo.
pause
