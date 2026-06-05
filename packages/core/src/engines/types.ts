/**
 * Core type definitions for the auto-cut-image library
 */

export interface ImageMetadata {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'jpg';
  channels: number;
  hasAlpha: boolean;
  density?: number;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
}

export interface SegmentationResult {
  /** Binary mask (0-255) where 255 = foreground */
  mask: Buffer;
  width: number;
  height: number;
  confidence?: number;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropPreset {
  name: string;
  ratio: number; // width / height
  description: string;
}

export interface BackgroundOptions {
  /** Background color in hex format (e.g., '#ffffff') or 'transparent' */
  color: string;
  /** Opacity for semi-transparent backgrounds (0-1) */
  opacity?: number;
}

export interface BatchProcessOptions {
  /** Maximum concurrent processing tasks */
  concurrency: number;
  /** Output directory for processed images */
  outputDir: string;
  /** Output format */
  format?: 'png' | 'jpeg';
  /** JPEG quality (1-100) */
  quality?: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}

export interface SegmentationEngine {
  name: string;
  segment(input: Buffer): Promise<SegmentationResult>;
}

export type ApiProvider = 'openai' | 'removebg';

export interface ApiSegmentationConfig {
  provider: ApiProvider;
  apiKey: string;
  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

export type SupportedFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'tiff';
