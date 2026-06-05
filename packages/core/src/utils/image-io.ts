import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ImageMetadata,
  ProcessedImage,
  SupportedFormat,
} from '../engines/types';
import { createChildLogger } from './logger';

const logger = createChildLogger('image-io');

const SUPPORTED_FORMATS: SupportedFormat[] = [
  'png',
  'jpeg',
  'jpg',
  'webp',
  'tiff',
];

/**
 * Load an image from file path
 */
export async function loadImage(filePath: string): Promise<ProcessedImage> {
  const ext = path.extname(filePath).toLowerCase().slice(1) as SupportedFormat;

  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(
      `Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(', ')}`,
    );
  }

  logger.info('Loading image', { path: filePath });

  const buffer = await fs.readFile(filePath);
  const metadata = await getImageMetadata(buffer);

  return { buffer, metadata };
}

/**
 * Load an image from buffer
 */
export async function loadImageFromBuffer(
  buffer: Buffer,
): Promise<ProcessedImage> {
  const metadata = await getImageMetadata(buffer);
  return { buffer, metadata };
}

/**
 * Save image to file
 */
export async function saveImage(
  processed: ProcessedImage,
  outputPath: string,
  options?: { quality?: number },
): Promise<void> {
  const format = path.extname(outputPath).toLowerCase().slice(1);

  if (!SUPPORTED_FORMATS.includes(format as SupportedFormat)) {
    throw new Error(`Unsupported output format: ${format}`);
  }

  logger.info('Saving image', { path: outputPath, format });

  let pipeline = sharp.default(processed.buffer);

  if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality: options?.quality ?? 90 });
  } else if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 6 });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality: options?.quality ?? 90 });
  } else if (format === 'tiff') {
    pipeline = pipeline.tiff({ quality: options?.quality ?? 90 });
  }

  await pipeline.toFile(outputPath);
  logger.info('Image saved', { path: outputPath });
}

/**
 * Get image metadata from buffer
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const meta = await sharp.default(buffer).metadata();

  return {
    width: meta.width!,
    height: meta.height!,
    format: (meta.format as ImageMetadata['format']) || 'png',
    channels: meta.channels || 4,
    hasAlpha: meta.hasAlpha ?? false,
    density: meta.density,
  };
}

/**
 * Create a ProcessedImage from buffer with metadata
 */
export async function createProcessedImage(
  buffer: Buffer,
): Promise<ProcessedImage> {
  const metadata = await getImageMetadata(buffer);
  return { buffer, metadata };
}

/**
 * Resize image while maintaining aspect ratio
 */
export async function resizeImage(
  buffer: Buffer,
  maxWidth?: number,
  maxHeight?: number,
): Promise<Buffer> {
  const metadata = await getImageMetadata(buffer);

  let width = metadata.width;
  let height = metadata.height;

  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  if (width !== metadata.width || height !== metadata.height) {
    return sharp.default(buffer).resize(width, height).toBuffer();
  }

  return buffer;
}

export { SUPPORTED_FORMATS };
