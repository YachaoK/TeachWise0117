@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在初始化 Git 仓库...
git init

echo 正在配置 Git 用户信息和编码...
git config user.name "Yachao.Kang"
git config user.email "yachao.kang@example.com"
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

echo 正在添加文件...
git add .

echo 正在提交...
git commit -m "Initial commit: TeachWise prototype project"

echo 正在配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/YachaoK/TeachWise0117.git

echo 正在设置主分支...
git branch -M main

echo 正在推送到 GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 推送成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo 推送失败，请检查网络连接或稍后重试
    echo ========================================
)

pause
