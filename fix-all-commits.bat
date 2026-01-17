@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 修复所有提交信息为英文
echo ========================================
echo.

echo 查看所有提交历史：
git log --oneline --all
echo.

echo 正在修改所有提交信息...
echo.

REM 获取提交总数
for /f %%i in ('git rev-list --count HEAD') do set commit_count=%%i

echo 找到 %commit_count% 个提交
echo.

REM 使用交互式 rebase 修改所有提交
echo 正在使用 rebase 修改提交信息...
echo 注意：这可能需要一些时间
echo.

REM 创建一个临时脚本来修改提交信息
echo @echo off > temp_rebase.bat
echo git commit --amend -m "Initial commit: TeachWise prototype project" >> temp_rebase.bat

REM 使用 GIT_SEQUENCE_EDITOR 自动修改所有提交
set GIT_SEQUENCE_EDITOR=sed -i "s/^pick/reword/g"
git rebase -i --root

REM 如果 rebase 失败，尝试另一种方法
if errorlevel 1 (
    echo.
    echo Rebase 失败，尝试直接修改最后一次提交...
    git commit --amend -m "Initial commit: TeachWise prototype project"
    
    echo.
    echo 如果还有其他提交，请手动运行：
    echo git rebase -i HEAD~%commit_count%
    echo.
    echo 然后将所有 "pick" 改为 "reword"，保存后为每个提交输入英文信息
)

echo.
echo 修改后的提交历史：
git log --oneline --all
echo.

echo ========================================
echo 修复完成
echo ========================================
echo.
echo 如果需要推送到 GitHub，请运行：
echo git push -u origin main --force
echo.

del temp_rebase.bat 2>nul
pause
