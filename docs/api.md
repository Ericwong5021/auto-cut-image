# API Documentation

Core library API reference for `@auto-cut/core`.

## Installation

```bash
bun add @auto-cut/core
```

## Functions

### `segment(inputPath, options)`

Segment an image into individual assets.

**Parameters:**

- `inputPath: string` - Path to input image
- `options: SegmentOptions` - Segmentation options

**Options:**

```typescript
interface SegmentOptions {
  outputDir: string;        // Output directory path
  format?: 'png' | 'jpg';  // Output format (default: 'png')
  quality?: number;         // Output quality 1-100 (default: 95)
}
```

**Returns:** `Promise<ProcessingResult>`

**Example:**

```typescript
import { segment } from '@auto-cut/core';

const result = await segment('photo.jpg', {
  outputDir: './output',
  format: 'png',
  quality: 95,
});

console.log(result.outputPaths); // ['./output/segmented.png']
```

---

### `removeBackground(inputPath, outputPath)`

Remove background from an image.

**Parameters:**

- `inputPath: string` - Path to input image
- `outputPath: string` - Path to output image

**Returns:** `Promise<ProcessingResult>`

**Example:**

```typescript
import { removeBackground } from '@auto-cut/core';

const result = await removeBackground('photo.jpg', 'transparent.png');
console.log(result.success); // true
```

---

### `replaceBackground(inputPath, outputPath, color)`

Replace background with a color.

**Parameters:**

- `inputPath: string` - Path to input image
- `outputPath: string` - Path to output image
- `color: string` - Background color (hex or named color)

**Returns:** `Promise<ProcessingResult>`

**Example:**

```typescript
import { replaceBackground } from '@auto-cut/core';

const result = await replaceBackground(
  'photo.jpg',
  'result.png',
  '#FF5733',
);
```

---

### `crop(inputPath, outputPath, options)`

Crop image to specified dimensions.

**Parameters:**

- `inputPath: string` - Path to input image
- `outputPath: string` - Path to output image
- `options: CropOptions` - Crop options

**Options:**

```typescript
interface CropOptions {
  width: number;     // Target width
  height: number;    // Target height
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}
```

**Returns:** `Promise<ProcessingResult>`

**Example:**

```typescript
import { crop } from '@auto-cut/core';

const result = await crop('photo.jpg', 'cropped.png', {
  width: 800,
  height: 600,
  position: 'center',
});
```

---

### `batchProcess(inputDir, options)`

Batch process multiple images.

**Parameters:**

- `inputDir: string` - Directory containing input images
- `options: SegmentOptions` - Processing options

**Returns:** `Promise<ProcessingResult[]>`

**Example:**

```typescript
import { batchProcess } from '@auto-cut/core';

const results = await batchProcess('./photos', {
  outputDir: './output',
  format: 'png',
});

console.log(`Processed ${results.length} images`);
```

## Types

### `ProcessingResult`

```typescript
interface ProcessingResult {
  success: boolean;        // Whether operation succeeded
  outputPaths: string[];   // Output file paths
  processingTime: number;  // Processing time in ms
  error?: string;          // Error message if failed
}
```

### `SegmentOptions`

```typescript
interface SegmentOptions {
  outputDir: string;
  format?: 'png' | 'jpg';
  quality?: number;
}
```

### `CropOptions`

```typescript
interface CropOptions {
  width: number;
  height: number;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}
```
