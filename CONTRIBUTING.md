# Contributing to Auto Cut Image

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with the **Bug Report** template
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment info (OS, Bun version, Node version)

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with the **Feature Request** template
3. Explain the use case and expected behavior

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run tests: `bun run test`
5. Run linting: `bun run lint`
6. Commit with clear message: `git commit -m "feat: add new feature"`
7. Push and create PR

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/auto-cut-image.git
cd auto-cut-image

# Install dependencies
bun install

# Start development
bun run dev
```

## Project Structure

```
auto-cut-image/
├── packages/
│   ├── core/          # Core image processing library
│   ├── cli/           # Command line interface
│   └── gui/           # Tauri GUI application
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable/function names
- Add JSDoc comments for public APIs

## Testing

```bash
# Run all tests
bun run test

# Run tests for specific package
bun run test --filter @auto-cut/core
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for notable changes

## Questions?

Feel free to open an issue for any questions!

---

# 贡献指南

感谢您对贡献代码的兴趣！本文档提供贡献的指南和说明。

## 行为准则

请在所有互动中保持尊重和建设性。

## 如何贡献

### 报告 Bug

1. 检查现有 issue 避免重复
2. 使用 **Bug Report** 模板创建新 issue
3. 包含：
   - 清晰的 bug 描述
   - 重现步骤
   - 期望与实际行为
   - 环境信息（操作系统、Bun 版本、Node 版本）

### 建议功能

1. 检查现有 issue 和讨论
2. 使用 **Feature Request** 模板创建新 issue
3. 说明使用场景和期望行为

### Pull Request

1. Fork 仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 进行修改
4. 运行测试：`bun run test`
5. 运行 lint：`bun run lint`
6. 提交清晰的 commit 信息：`git commit -m "feat: add new feature"`
7. 推送并创建 PR

## 开发环境

```bash
# 克隆你的 fork
git clone https://github.com/your-username/auto-cut-image.git
cd auto-cut-image

# 安装依赖
bun install

# 启动开发
bun run dev
```

## 项目结构

```
auto-cut-image/
├── packages/
│   ├── core/          # 核心图像处理库
│   ├── cli/           # 命令行界面
│   └── gui/           # Tauri GUI 应用程序
```

## Commit 规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档变更
- `style:` - 代码风格变更
- `refactor:` - 代码重构
- `test:` - 添加测试
- `chore:` - 维护任务

## 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 使用有意义的变量/函数名
- 为公共 API 添加 JSDoc 注释

## 测试

```bash
# 运行所有测试
bun run test

# 运行特定包的测试
bun run test --filter @auto-cut/core
```

## 文档

- 为新功能更新 README.md
- 为公共 API 添加 JSDoc 注释
- 为重要变更更新 CHANGELOG.md

## 有问题？

欢迎开启 issue 提问！
