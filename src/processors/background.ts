import * as sharp from 'sharp';
import { SegmentationResult, BackgroundOptions, ProcessedImage } from '../engines/types';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('background');

/**
 * Remove background from image using segmentation mask
 */
export async function removeBackground(
  imageBuffer: Buffer,
  mask: SegmentationResult
): Promise<Buffer> {
  logger.info('Removing background');

  // Ensure mask matches image dimensions
  const imageMetadata = await sharp.default(imageBuffer).metadata();

  if (mask.width !== imageMetadata.width || mask.height !== imageMetadata.height) {
    // Resize mask to match image
    mask.mask = await sharp.default(mask.mask)
      .resize(imageMetadata.width, imageMetadata.height)
      .toBuffer();
  }

  // Apply mask to create transparent background
  const result = await sharp.default(imageBuffer)
    .ensureAlpha()
    .composite([{
      input: mask.mask,
      blend: 'dest-in' as const
    }])
    .png()
    .toBuffer();

  logger.info('Background removed');
  return result;
}

/**
 * Replace background with solid color
 */
export async function replaceBackground(
  imageBuffer: Buffer,
  mask: SegmentationResult,
  options: BackgroundOptions
): Promise<Buffer> {
  logger.info('Replacing background', { color: options.color });

  const imageMetadata = await sharp.default(imageBuffer).metadata();
  const width = imageMetadata.width!;
  const height = imageMetadata.height!;

  // Ensure mask matches image dimensions
  if (mask.width !== width || mask.height !== height) {
    mask.mask = await sharp.default(mask.mask)
      .resize(width, height)
      .toBuffer();
  }

  // Parse color
  const { r, g, b } = parseHexColor(options.color);
  const alpha = options.opacity !== undefined ? Math.round(options.opacity * 255) : 255;

  // Create background image with solid color
  const background = Buffer.alloc(width * height * 4);
  for (let i = 0; i < background.length; i += 4) {
    background[i] = r;
    background[i + 1] = g;
    background[i + 2] = b;
    background[i + 3] = alpha;
  }

  const backgroundBuffer = await sharp.default(background, {
    raw: { width, height, channels: 4 }
  }).png().toBuffer();

  // Invert mask for background (we want the background area)
  const invertedMask = await sharp.default(mask.mask)
    .negate()
    .toBuffer();

  // Composite: background first, then foreground on top
  const result = await sharp.default(backgroundBuffer)
    .composite([{
      input: imageBuffer,
      blend: 'dest-in' as const
    }, {
      input: backgroundBuffer,
      blend: 'over' as const
    }])
    .png()
    .toBuffer();

  logger.info('Background replaced');
  return result;
}

/**
 * Generate transparent PNG from image and mask
 */
export async function generateTransparentPng(
  imageBuffer: Buffer,
  mask: SegmentationResult
): Promise<Buffer> {
  logger.info('Generating transparent PNG');

  const imageMetadata = await sharp.default(imageBuffer).metadata();

  // Ensure mask matches image dimensions
  if (mask.width !== imageMetadata.width || mask.height !== imageMetadata.height) {
    mask.mask = await sharp.default(mask.mask)
      .resize(imageMetadata.width, imageMetadata.height)
      .toBuffer();
  }

  // Apply mask to create transparent background
  const result = await sharp.default(imageBuffer)
    .ensureAlpha()
    .composite([{
      input: mask.mask,
      blend: 'dest-in' as const
    }])
    .png({ compressionLevel: 6 })
    .toBuffer();

  logger.info('Transparent PNG generated');
  return result;
}

/**
 * Parse hex color to RGB values
 */
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  // Remove # prefix if present
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    // Short format: #rgb
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16)
    };
  }

  if (cleanHex.length === 6) {
    // Full format: #rrggbb
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16)
    };
  }

  throw new Error(`Invalid hex color: ${hex}`);
}

/**
 * Create a mask from a simple threshold
 */
export function createSimpleMask(
  imageBuffer: Buffer,
  backgroundColor: string,
  tolerance: number = 30
): Promise<Buffer> {
  logger.info('Creating simple mask', { backgroundColor, tolerance });

  // This is a simplified version - real implementation would use color distance
  const { r: bgR, g: bgG, b: bgB } = parseHexColor(backgroundColor);

  return sharp.default(imageBuffer)
    .raw()
    .toBuffer()
    .then(async (data) => {
      const metadata = await sharp.default(imageBuffer).metadata();
      const width = metadata.width!;
      const height = metadata.height!;
      const channels = metadata.channels || 3;

      const maskData = new Uint8Array(width * height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Calculate color distance
          const distance = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          // If distance is greater than tolerance, it's foreground
          maskData[y * width + x] = distance > tolerance ? 255 : 0;
        }
      }

      return sharp.default(maskData, {
        raw: { width, height, channels: 1 }
      }).png().toBuffer();
    });
}
