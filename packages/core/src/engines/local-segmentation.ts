import * as sharp from 'sharp';
import * as ort from 'onnxruntime-node';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SegmentationEngine, SegmentationResult } from './types';
import { createChildLogger } from '../utils/logger';

const logger = createChildLogger('local-segmentation');

export interface LocalSegmentationConfig {
  /** Path to the ONNX model file */
  modelPath: string;
  /** Model input size (default: 1024) */
  inputSize?: number;
  /** Confidence threshold (0-1, default: 0.5) */
  threshold?: number;
}

/**
 * Local segmentation engine using ONNX Runtime
 * Supports SAM (Segment Anything Model) and similar models
 */
export class LocalSegmentationEngine implements SegmentationEngine {
  name = 'local-onnx';
  private session: ort.InferenceSession | null = null;
  private inputSize: number;
  private threshold: number;
  private modelPath: string;

  constructor(config: LocalSegmentationConfig) {
    this.modelPath = config.modelPath;
    this.inputSize = config.inputSize ?? 1024;
    this.threshold = config.threshold ?? 0.5;
  }

  /**
   * Initialize the ONNX session
   */
  async initialize(): Promise<void> {
    logger.info('Initializing ONNX session', { model: this.modelPath });

    try {
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all',
      });

      logger.info('ONNX session initialized', {
        inputs: this.session.inputNames,
        outputs: this.session.outputNames,
      });
    } catch (error) {
      logger.error('Failed to initialize ONNX session', { error });
      throw new Error(`Failed to load model: ${this.modelPath}`);
    }
  }

  /**
   * Preprocess image for model input
   */
  private async preprocessImage(buffer: Buffer): Promise<ort.Tensor> {
    const resized = await sharp
      .default(buffer)
      .resize(this.inputSize, this.inputSize, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer();

    // Normalize to [0, 1] and convert to NCHW format
    const floatData = new Float32Array(this.inputSize * this.inputSize * 3);

    for (let i = 0; i < resized.length; i += 3) {
      const pixel = i / 3;
      floatData[pixel] = resized[i] / 255.0; // R
      floatData[this.inputSize * this.inputSize + pixel] =
        resized[i + 1] / 255.0; // G
      floatData[this.inputSize * this.inputSize * 2 + pixel] =
        resized[i + 2] / 255.0; // B
    }

    return new ort.Tensor('float32', floatData, [
      1,
      3,
      this.inputSize,
      this.inputSize,
    ]);
  }

  /**
   * Post-process model output to binary mask
   */
  private async postprocessOutput(
    output: ort.Tensor,
    originalWidth: number,
    originalHeight: number,
  ): Promise<Buffer> {
    const outputData = output.data as Float32Array;
    const outputSize = output.dims[output.dims.length - 1];

    // Create binary mask
    const maskData = new Uint8Array(originalWidth * originalHeight);

    for (let y = 0; y < originalHeight; y++) {
      for (let x = 0; x < originalWidth; x++) {
        // Map coordinates back to model output space
        const modelX = Math.floor((x / originalWidth) * outputSize);
        const modelY = Math.floor((y / originalHeight) * outputSize);
        const idx = modelY * outputSize + modelX;

        if (idx < outputData.length && outputData[idx] > this.threshold) {
          maskData[y * originalWidth + x] = 255;
        }
      }
    }

    // Create mask image buffer
    return sharp
      .default(maskData, {
        raw: { width: originalWidth, height: originalHeight, channels: 1 },
      })
      .png()
      .toBuffer();
  }

  /**
   * Segment image and return binary mask
   */
  async segment(input: Buffer): Promise<SegmentationResult> {
    if (!this.session) {
      await this.initialize();
    }

    const metadata = await sharp.default(input).metadata();
    const originalWidth = metadata.width!;
    const originalHeight = metadata.height!;

    logger.info('Starting segmentation', {
      width: originalWidth,
      height: originalHeight,
    });

    // Preprocess
    const inputTensor = await this.preprocessImage(input);

    // Run inference
    const inputName = this.session!.inputNames[0];
    const results = await this.session!.run({ [inputName]: inputTensor });

    // Get output
    const outputName = this.session!.outputNames[0];
    const output = results[outputName];

    // Postprocess
    const maskBuffer = await this.postprocessOutput(
      output,
      originalWidth,
      originalHeight,
    );

    logger.info('Segmentation complete', {
      maskSize: maskBuffer.length,
    });

    return {
      mask: maskBuffer,
      width: originalWidth,
      height: originalHeight,
      confidence: this.threshold,
    };
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.session) {
      this.session.release();
      this.session = null;
      logger.info('ONNX session released');
    }
  }
}

/**
 * Create a local segmentation engine
 */
export function createLocalEngine(
  config: LocalSegmentationConfig,
): LocalSegmentationEngine {
  return new LocalSegmentationEngine(config);
}
