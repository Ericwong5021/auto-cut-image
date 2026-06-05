import * as sharp from 'sharp';
import { CropOptions, CropPreset } from '../engines/types';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('crop');

/**
 * Common crop presets
 */
export const CROP_PRESETS: CropPreset[] = [
  { name: 'square', ratio: 1, description: '1:1 Square' },
  { name: 'portrait', ratio: 0.75, description: '3:4 Portrait' },
  { name: 'landscape', ratio: 1.333, description: '4:3 Landscape' },
  { name: 'wide', ratio: 1.778, description: '16:9 Wide' },
  { name: 'ultrawide', ratio: 2.37, description: '21:9 Ultrawide' },
  { name: 'instagram', ratio: 1, description: 'Instagram Square' },
  {
    name: 'instagram-story',
    ratio: 0.5625,
    description: 'Instagram Story (9:16)',
  },
  {
    name: 'facebook-cover',
    ratio: 2.631,
    description: 'Facebook Cover (820x312)',
  },
  {
    name: 'twitter-header',
    ratio: 3,
    description: 'Twitter Header (1500x500)',
  },
];

/**
 * Crop image to specified dimensions
 */
export async function cropImage(
  imageBuffer: Buffer,
  options: CropOptions,
): Promise<Buffer> {
  logger.info('Cropping image', {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  });

  // Validate crop options
  const metadata = await sharp.default(imageBuffer).metadata();

  if (options.x < 0 || options.y < 0) {
    throw new Error('Crop coordinates must be non-negative');
  }

  if (options.x + options.width > metadata.width!) {
    throw new Error('Crop width exceeds image width');
  }

  if (options.y + options.height > metadata.height!) {
    throw new Error('Crop height exceeds image height');
  }

  if (options.width <= 0 || options.height <= 0) {
    throw new Error('Crop dimensions must be positive');
  }

  return sharp
    .default(imageBuffer)
    .extract({
      left: options.x,
      top: options.y,
      width: options.width,
      height: options.height,
    })
    .toBuffer();
}

/**
 * Crop image to aspect ratio
 */
export async function cropToAspectRatio(
  imageBuffer: Buffer,
  targetRatio: number,
): Promise<Buffer> {
  logger.info('Cropping to aspect ratio', { ratio: targetRatio });

  const metadata = await sharp.default(imageBuffer).metadata();
  const currentRatio = metadata.width! / metadata.height!;

  let newWidth: number;
  let newHeight: number;

  if (currentRatio > targetRatio) {
    // Image is wider than target, crop width
    newHeight = metadata.height!;
    newWidth = Math.round(newHeight * targetRatio);
  } else {
    // Image is taller than target, crop height
    newWidth = metadata.width!;
    newHeight = Math.round(newWidth / targetRatio);
  }

  // Center crop
  const left = Math.round((metadata.width! - newWidth) / 2);
  const top = Math.round((metadata.height! - newHeight) / 2);

  return cropImage(imageBuffer, {
    x: left,
    y: top,
    width: newWidth,
    height: newHeight,
  });
}

/**
 * Crop to center square
 */
export async function cropToSquare(imageBuffer: Buffer): Promise<Buffer> {
  logger.info('Cropping to square');

  const metadata = await sharp.default(imageBuffer).metadata();
  const size = Math.min(metadata.width!, metadata.height!);

  const left = Math.round((metadata.width! - size) / 2);
  const top = Math.round((metadata.height! - size) / 2);

  return cropImage(imageBuffer, {
    x: left,
    y: top,
    width: size,
    height: size,
  });
}

/**
 * Crop using a preset
 */
export async function cropWithPreset(
  imageBuffer: Buffer,
  presetName: string,
): Promise<Buffer> {
  const preset = CROP_PRESETS.find((p) => p.name === presetName);

  if (!preset) {
    throw new Error(
      `Unknown preset: ${presetName}. Available: ${CROP_PRESETS.map((p) => p.name).join(', ')}`,
    );
  }

  logger.info('Cropping with preset', {
    preset: presetName,
    ratio: preset.ratio,
  });
  return cropToAspectRatio(imageBuffer, preset.ratio);
}

/**
 * Smart crop - crop to content area with padding
 */
export async function smartCrop(
  imageBuffer: Buffer,
  padding: number = 0,
): Promise<Buffer> {
  logger.info('Smart cropping', { padding });

  // Get image statistics to find content bounds
  const stats = await sharp.default(imageBuffer).stats();

  // Find non-transparent bounds (simplified - uses min/max channels)
  const metadata = await sharp.default(imageBuffer).metadata();

  // For transparent images, use alpha channel
  if (metadata.hasAlpha) {
    const { data, info } = await sharp
      .default(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let minX = info.width;
    let minY = info.height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alphaIdx = (y * info.width + x) * 4 + 3;
        if (data[alphaIdx] > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // Add padding
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(info.width - 1, maxX + padding);
    maxY = Math.min(info.height - 1, maxY + padding);

    return cropImage(imageBuffer, {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    });
  }

  // For non-transparent images, return original with center crop
  return cropToSquare(imageBuffer);
}

/**
 * Get available crop presets
 */
export function getCropPresets(): CropPreset[] {
  return [...CROP_PRESETS];
}

/**
 * Find preset by name
 */
export function getCropPreset(name: string): CropPreset | undefined {
  return CROP_PRESETS.find((p) => p.name === name);
}
