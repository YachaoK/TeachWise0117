# Git 提交和推送指南

## 修复提交信息乱码

如果提交信息在 GitHub 上显示乱码，请按以下步骤操作：

### 方法一：修改最后一次提交信息（推荐）

1. 打开命令提示符（CMD），进入项目目录：
   ```cmd
   cd /d "E:\嘟嘟学习\TeachWise\TeachWise2"
   ```

2. 运行修复脚本：
   ```cmd
   fix-commit-message.bat
   ```

3. 强制推送到 GitHub：
   ```cmd
   git push -u origin main --force
   ```

### 方法二：手动修改

1. 进入项目目录：
   ```cmd
   cd /d "E:\嘟嘟学习\TeachWise\TeachWise2"
   ```

2. 修改最后一次提交信息：
   ```cmd
   git commit --amend -m "Initial commit: TeachWise prototype project"
   ```

3. 推送到 GitHub：
   ```cmd
   git push -u origin main --force
   ```

### 方法三：使用英文提交信息（最简单）

以后所有提交都使用英文，避免编码问题：

```cmd
git commit -m "Add new feature"
git commit -m "Fix bug in canvas component"
git commit -m "Update README"
```

## 注意事项

- 使用 `--force` 会覆盖远程仓库的历史，只有在仓库是空的或只有你一个人使用时才安全
- 如果已经有多人协作，不要使用 `--force`，而是创建新的提交来修复
