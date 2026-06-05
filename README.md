# Auto Cut Image

> AI 驱动的图片素材分割与背景处理 CLI/GUI 应用 | AI-powered image asset segmentation and background processing CLI/GUI application

[English](#english) | [中文](#中文)

---

## English

### Overview

Auto Cut Image is an open-source tool that uses AI to automatically segment images into individual transparent background assets. It supports both CLI and GUI interfaces, built with Bun + TypeScript + Tauri.

### Features

- 🎯 **AI-Powered Segmentation** - Automatically detect and separate image elements
- 🖼️ **Background Removal** - Remove backgrounds with AI precision
- 🎨 **Background Replacement** - Change background colors or images
- ✂️ **Smart Cropping** - Standard size cropping with aspect ratio preservation
- 📦 **Multi-Format Export** - Export as PNG, JPG with transparency support
- 💻 **CLI Tool** - Full-featured command line interface
- 🖥️ **GUI Application** - Cross-platform desktop app (Windows & macOS)
- 🔧 **Bun Runtime** - Fast, modern JavaScript runtime

### Installation

```bash
# Install globally
bun install -g auto-cut-image

# Or use directly
bunx auto-cut-image
```

### Quick Start

```bash
# Segment an image
auto-cut segment input.png --output ./output

# Remove background
auto-cut bg-remove photo.jpg --output transparent.png

# Change background color
auto-cut bg-replace image.png --color "#FF5733" --output result.png

# Crop to standard size
auto-cut crop image.png --width 800 --height 600 --output cropped.png
```

### CLI Commands

| Command | Description |
|:--------|:------------|
| `auto-cut segment <input>` | Segment image into individual assets |
| `auto-cut bg-remove <input>` | Remove image background |
| `auto-cut bg-replace <input>` | Replace background with color/image |
| `auto-cut crop <input>` | Crop image to specified dimensions |
| `auto-cut batch <dir>` | Process multiple images in batch |

### CLI Options

```
auto-cut [command] [options]

Options:
  --output, -o     Output file or directory (default: ./output)
  --format, -f     Output format: png, jpg (default: png)
  --quality, -q    Output quality 1-100 (default: 95)
  --verbose, -v    Enable verbose logging
  --help           Show help information
  --version        Show version number
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/auto-cut-image.git
cd auto-cut-image

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Start development
bun run dev
```

### Project Structure

```
auto-cut-image/
├── packages/
│   ├── core/          # Core image processing library
│   ├── cli/           # Command line interface
│   └── gui/           # Tauri GUI application
├── docs/              # Documentation
├── examples/          # Example images and scripts
├── package.json       # Root workspace config
├── tsconfig.json      # TypeScript config
├── CONTRIBUTING.md    # Contribution guidelines
├── CHANGELOG.md       # Version history
└── LICENSE            # MIT License
```

### Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

### License

MIT License - see [LICENSE](LICENSE) for details.

---

## 中文

### 概述

Auto Cut Image 是一个使用 AI 自动将图片分割为独立透明背景素材的开源工具。支持 CLI 和 GUI 两种界面，基于 Bun + TypeScript + Tauri 构建。

### 功能特性

- 🎯 **AI 智能分割** - 自动识别并分离图片中的各个元素
- 🖼️ **背景去除** - 精准去除图片背景
- 🎨 **背景替换** - 更换背景颜色或图片
- ✂️ **智能裁剪** - 支持标准尺寸裁剪并保持宽高比
- 📦 **多格式导出** - 支持 PNG、JPG 格式，支持透明通道
- 💻 **命令行工具** - 功能完整的 CLI 界面
- 🖥️ **桌面应用** - 跨平台 GUI 应用（Windows & macOS）
- 🔧 **Bun 运行时** - 快速、现代的 JavaScript 运行时

### 安装

```bash
# 全局安装
bun install -g auto-cut-image

# 或直接使用
bunx auto-cut-image
```

### 快速开始

```bash
# 分割图片
auto-cut segment input.png --output ./output

# 去除背景
auto-cut bg-remove photo.jpg --output transparent.png

# 替换背景颜色
auto-cut bg-replace image.png --color "#FF5733" --output result.png

# 裁剪为标准尺寸
auto-cut crop image.png --width 800 --height 600 --output cropped.png
```

### CLI 命令

| 命令 | 说明 |
|:-----|:-----|
| `auto-cut segment <input>` | 将图片分割为独立素材 |
| `auto-cut bg-remove <input>` | 去除图片背景 |
| `auto-cut bg-replace <input>` | 替换背景颜色/图片 |
| `auto-cut crop <input>` | 裁剪图片到指定尺寸 |
| `auto-cut batch <dir>` | 批量处理多张图片 |

### CLI 选项

```
auto-cut [command] [options]

Options:
  --output, -o     输出文件或目录（默认：./output）
  --format, -f     输出格式：png, jpg（默认：png）
  --quality, -q    输出质量 1-100（默认：95）
  --verbose, -v    启用详细日志
  --help           显示帮助信息
  --version        显示版本号
```

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/your-username/auto-cut-image.git
cd auto-cut-image

# 安装依赖
bun install

# 构建所有包
bun run build

# 运行测试
bun run test

# 启动开发
bun run dev
```

### 项目结构

```
auto-cut-image/
├── packages/
│   ├── core/          # 核心图像处理库
│   ├── cli/           # 命令行界面
│   └── gui/           # Tauri GUI 应用程序
├── docs/              # 文档
├── examples/          # 示例图片和脚本
├── package.json       # 根工作区配置
├── tsconfig.json      # TypeScript 配置
├ CONTRIBUTING.md    # 贡献指南
├── CHANGELOG.md       # 版本历史
└── LICENSE            # MIT 许可证
```

### 贡献

欢迎贡献代码！请先阅读[贡献指南](CONTRIBUTING.md)。

### 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。
