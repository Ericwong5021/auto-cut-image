import * as sharp from 'sharp';
import { SegmentationEngine, SegmentationResult, ApiSegmentationConfig, ApiProvider } from './types';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('api-segmentation');

/**
 * API-based segmentation engine
 * Supports OpenAI DALL-E and Remove.bg APIs
 */
export class ApiSegmentationEngine implements SegmentationEngine {
  name: string;
  private config: ApiSegmentationConfig;

  constructor(config: ApiSegmentationConfig) {
    this.config = config;
    this.name = `api-${config.provider}`;
  }

  /**
   * Segment using OpenAI API
   */
  private async segmentWithOpenAI(input: Buffer): Promise<SegmentationResult> {
    logger.info('Starting OpenAI segmentation');

    // Convert to base64
    const base64 = input.toString('base64');
    const metadata = await sharp.default(input).metadata();

    // OpenAI doesn't have a direct segmentation endpoint,
    // but we can use the image edit API with a mask
    // For now, we'll use a placeholder that would need actual API integration
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: this.createFormData(base64)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json() as { data: Array<{ url: string }> };

    // Download the result image and extract mask
    const imageUrl = result.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image returned from OpenAI');
    }

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Create a simple mask from the image (simplified - real implementation would be more sophisticated)
    return {
      mask: imageBuffer,
      width: metadata.width!,
      height: metadata.height!,
      confidence: 0.8
    };
  }

  /**
   * Create form data for OpenAI API
   */
  private createFormData(base64Image: string): FormData {
    const formData = new FormData();
    const binaryData = Buffer.from(base64Image, 'base64');

    formData.append('image', new Blob([binaryData], { type: 'image/png' }), 'image.png');
    formData.append('prompt', 'Remove the background, keep only the main subject');
    formData.append('n', '1');
    formData.append('size', '1024x1024');

    return formData;
  }

  /**
   * Segment using Remove.bg API
   */
  private async segmentWithRemoveBg(input: Buffer): Promise<SegmentationResult> {
    logger.info('Starting Remove.bg segmentation');

    const metadata = await sharp.default(input).metadata();

    const formData = new FormData();
    const blob = new Blob([input], { type: 'image/png' });
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': this.config.apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Remove.bg API error: ${response.status}: ${error}`);
    }

    // Remove.bg returns the image with transparent background
    const resultBuffer = Buffer.from(await response.arrayBuffer());

    // Extract alpha channel as mask
    const { data: alphaData, info } = await sharp.default(resultBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create binary mask from alpha channel
    const maskData = new Uint8Array(info.width * info.height);
    for (let i = 0; i < maskData.length; i++) {
      // Alpha channel is every 4th byte (RGBA)
      maskData[i] = alphaData[i * 4 + 3] > 128 ? 255 : 0;
    }

    const maskBuffer = await sharp.default(maskData, {
      raw: { width: info.width, height: info.height, channels: 1 }
    }).png().toBuffer();

    return {
      mask: maskBuffer,
      width: info.width,
      height: info.height,
      confidence: 0.9
    };
  }

  /**
   * Segment image using configured API provider
   */
  async segment(input: Buffer): Promise<SegmentationResult> {
    switch (this.config.provider) {
      case 'openai':
        return this.segmentWithOpenAI(input);
      case 'removebg':
        return this.segmentWithRemoveBg(input);
      default:
        throw new Error(`Unsupported API provider: ${this.config.provider}`);
    }
  }
}

/**
 * Create an API segmentation engine
 */
export function createApiEngine(config: ApiSegmentationConfig): ApiSegmentationEngine {
  return new ApiSegmentationEngine(config);
}
