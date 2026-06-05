# Auto Cut Image

AI驱动的图像分割和背景处理库，支持本地模型和API调用。

## 功能特性

- **图像加载和保存** - 支持 PNG、JPEG、WebP、TIFF 格式
- **AI 图像分割** - 支持本地 ONNX 模型和 API 调用（OpenAI、Remove.bg）
- **背景去除** - 使用分割掩码去除图像背景
- **背景替换** - 替换背景为纯色或自定义颜色
- **透明 PNG 生成** - 生成带透明背景的 PNG 图像
- **图像裁剪** - 支持多种裁剪模式和预设
- **批量处理** - 支持并发控制的批量图像处理

## 安装

```bash
npm install auto-cut-image
```

## 快速开始

### 基本使用

```typescript
import {
  loadImage,
  removeBackground,
  createApiEngine
} from 'auto-cut-image';

// 加载图像
const image = await loadImage('input.jpg');

// 创建 API 分割引擎
const engine = createApiEngine({
  provider: 'removebg',
  apiKey: process.env.REMOVEBG_API_KEY!
});

// 获取分割掩码
const mask = await engine.segment(image.buffer);

// 去除背景
const result = await removeBackground(image.buffer, mask);

// 保存结果
import { saveImage } from 'auto-cut-image';
await saveImage(
  { buffer: result, metadata: image.metadata },
  'output.png'
);
```

### 使用本地 ONNX 模型

```typescript
import { createLocalEngine } from 'auto-cut-image';

const engine = createLocalEngine({
  modelPath: './models/sam.onnx',
  inputSize: 1024,
  threshold: 0.5
});

await engine.initialize();
const mask = await engine.segment(imageBuffer);
await engine.dispose();
```

### 图像裁剪

```typescript
import {
  cropImage,
  cropToSquare,
  cropWithPreset,
  getCropPresets
} from 'auto-cut-image';

// 自定义裁剪
const cropped = await cropImage(buffer, {
  x: 10,
  y: 10,
  width: 100,
  height: 100
});

// 裁剪为正方形
const square = await cropToSquare(buffer);

// 使用预设裁剪
const portrait = await cropWithPreset(buffer, 'portrait');

// 查看可用预设
const presets = getCropPresets();
console.log(presets);
// [
//   { name: 'square', ratio: 1, description: '1:1 Square' },
//   { name: 'portrait', ratio: 0.75, description: '3:4 Portrait' },
//   ...
// ]
```

### 批量处理

```typescript
import { batchProcess, getImageFiles } from 'auto-cut-image';

// 获取目录中的所有图像
const files = await getImageFiles('./input');

// 批量处理
const progress = await batchProcess(
  files,
  async (input) => {
    // 处理逻辑
    return input.buffer;
  },
  {
    concurrency: 3,
    outputDir: './output',
    format: 'png',
    quality: 90
  },
  (progress) => {
    console.log(`${progress.completed}/${progress.total}`);
  }
);

console.log(`完成: ${progress.completed}, 失败: ${progress.failed}`);
```

### 背景颜色替换

```typescript
import { replaceBackground } from 'auto-cut-image';

const result = await replaceBackground(imageBuffer, mask, {
  color: '#ff0000',  // 红色背景
  opacity: 0.8       // 80% 不透明度
});
```

## API 参考

### 图像 I/O

- `loadImage(filePath)` - 从文件加载图像
- `loadImageFromBuffer(buffer)` - 从 buffer 加载图像
- `saveImage(processed, outputPath, options?)` - 保存图像到文件
- `getImageMetadata(buffer)` - 获取图像元数据
- `resizeImage(buffer, maxWidth?, maxHeight?)` - 调整图像大小

### 分割引擎

- `createLocalEngine(config)` - 创建本地 ONNX 分割引擎
- `createApiEngine(config)` - 创建 API 分割引擎

### 背景处理

- `removeBackground(imageBuffer, mask)` - 去除背景
- `replaceBackground(imageBuffer, mask, options)` - 替换背景颜色
- `generateTransparentPng(imageBuffer, mask)` - 生成透明 PNG
- `createSimpleMask(imageBuffer, backgroundColor, tolerance?)` - 创建简单掩码

### 裁剪

- `cropImage(buffer, options)` - 自定义裁剪
- `cropToAspectRatio(buffer, ratio)` - 按比例裁剪
- `cropToSquare(buffer)` - 裁剪为正方形
- `cropWithPreset(buffer, presetName)` - 使用预设裁剪
- `smartCrop(buffer, padding?)` - 智能裁剪
- `getCropPresets()` - 获取所有预设

### 批量处理

- `batchProcess(inputPaths, processFn, options, onProgress?)` - 批量处理
- `getImageFiles(dirPath)` - 获取目录中的图像文件
- `createBatchProcessor(options)` - 创建批处理器

## 技术栈

- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图像处理
- [ONNX Runtime](https://onnxruntime.ai/) - 本地 AI 模型推理
- [Winston](https://github.com/winstonjs/winston) - 日志记录

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建
npm run build

# 清理
npm run clean
```

## License

MIT
