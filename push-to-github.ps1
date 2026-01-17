# PowerShell script to push to GitHub
$ErrorActionPreference = "Stop"

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] 检查 Git 状态..." -ForegroundColor Yellow
git status --short
Write-Host ""

Write-Host "[2/4] 修改提交信息为英文（避免乱码）..." -ForegroundColor Yellow
$amendResult = git commit --amend -m "Initial commit: TeachWise prototype project" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "注意：可能还没有提交，将创建新提交..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit: TeachWise prototype project"
}
Write-Host ""

Write-Host "[3/4] 配置远程仓库..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/YachaoK/TeachWise0117.git
git branch -M main 2>$null
Write-Host ""

Write-Host "[4/4] 推送到 GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "推送成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "可以在以下地址查看：" -ForegroundColor Cyan
    Write-Host "https://github.com/YachaoK/TeachWise0117" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "推送失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "1. 网络连接问题" -ForegroundColor Yellow
    Write-Host "2. 需要输入 GitHub 用户名和密码" -ForegroundColor Yellow
    Write-Host "3. 需要配置 SSH 密钥" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按 Enter 键退出"
