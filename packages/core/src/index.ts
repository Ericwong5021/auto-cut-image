/**
 * Auto Cut Image - Core Library
 *
 * Core image processing functions for segmentation,
 * background removal, and image manipulation.
 *
 * @example
 * ```typescript
 * import {
 *   loadImage,
 *   removeBackground,
 *   createApiEngine
 * } from '@auto-cut/core';
 *
 * // Simple background removal
 * const image = await loadImage('input.jpg');
 * const engine = createApiEngine({
 *   provider: 'removebg',
 *   apiKey: process.env.REMOVEBG_API_KEY!
 * });
 * const mask = await engine.segment(image.buffer);
 * const result = await removeBackground(image.buffer, mask);
 * ```
 *
 * @packageDocumentation
 */

// Types and interfaces
export * from './engines/types';

// Image I/O
export {
  loadImage,
  loadImageFromBuffer,
  saveImage,
  getImageMetadata,
  createProcessedImage,
  resizeImage,
  SUPPORTED_FORMATS,
} from './utils/image-io';

// Segmentation engines
export {
  LocalSegmentationEngine,
  createLocalEngine,
} from './engines/local-segmentation';
export {
  ApiSegmentationEngine,
  createApiEngine,
} from './engines/api-segmentation';

// Background processing
export {
  removeBackground,
  replaceBackground,
  generateTransparentPng,
  createSimpleMask,
} from './processors/background';

// Crop functions
export {
  cropImage,
  cropToAspectRatio,
  cropToSquare,
  cropWithPreset,
  smartCrop,
  getCropPresets,
  getCropPreset,
  CROP_PRESETS,
} from './processors/crop';

// Batch processing
export { batchProcess, getImageFiles, createBatchProcessor } from './batch';

// Logger
export { logger, createChildLogger } from './utils/logger';
