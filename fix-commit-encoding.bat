@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在配置 Git 编码设置...
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.autocrlf false

echo 正在检查当前提交...
git log --oneline -1

echo.
echo 如果需要修改最后一次提交信息，请运行：
echo git commit --amend -m "Initial commit: 良师小助原型项目"
echo.
echo 然后推送：
echo git push -u origin main --force
echo.

pause
