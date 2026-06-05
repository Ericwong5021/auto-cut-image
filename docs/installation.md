# Installation Guide

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- Node.js >= 18.0.0 (for compatibility)
- Windows & macOS supported

## Install via Bun

```bash
# Install globally
bun install -g auto-cut-image

# Verify installation
auto-cut --version
```

## Install via npm

```bash
# Install globally
npm install -g auto-cut-image

# Verify installation
auto-cut --version
```

## Install from source

```bash
# Clone the repository
git clone https://github.com/Ericwong5021/auto-cut-image.git
cd auto-cut-image

# Install dependencies
bun install

# Build all packages
bun run build

# Link CLI globally
bun link --cwd packages/cli
```

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Ericwong5021/auto-cut-image.git
cd auto-cut-image

# Install dependencies
bun install

# Start development mode
bun run dev
```

## Verify Installation

```bash
# Check CLI is working
auto-cut --help

# Run a test command
auto-cut segment --help
```

## Troubleshooting

### Permission Errors (macOS/Linux)

If you get permission errors:

```bash
sudo bun install -g auto-cut-image
```

Or fix npm permissions:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Bun Not Found

Install Bun first:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Build Fails

Ensure you have the required dependencies:

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential
```
