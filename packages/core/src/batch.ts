import * as fs from 'fs/promises';
import * as path from 'path';
import {
  BatchProcessOptions,
  BatchProgress,
  ProcessedImage,
} from './engines/types';
import { loadImage, saveImage } from './utils/image-io';
import { createChildLogger } from './utils/logger';

const logger = createChildLogger('batch');

export type ProcessFunction = (input: ProcessedImage) => Promise<Buffer>;

/**
 * Process multiple images with concurrency control
 */
export async function batchProcess(
  inputPaths: string[],
  processFn: ProcessFunction,
  options: BatchProcessOptions,
  onProgress?: (progress: BatchProgress) => void,
): Promise<BatchProgress> {
  logger.info('Starting batch processing', {
    total: inputPaths.length,
    concurrency: options.concurrency,
    outputDir: options.outputDir,
  });

  // Ensure output directory exists
  await fs.mkdir(options.outputDir, { recursive: true });

  const progress: BatchProgress = {
    total: inputPaths.length,
    completed: 0,
    failed: 0,
  };

  // Process with concurrency control
  const processChunk = async (chunk: string[]) => {
    for (const inputPath of chunk) {
      progress.current = path.basename(inputPath);

      try {
        logger.info('Processing image', { path: inputPath });
        onProgress?.(progress);

        // Load image
        const processed = await loadImage(inputPath);

        // Process
        const resultBuffer = await processFn(processed);

        // Save result
        const ext = options.format || processed.metadata.format;
        const outputPath = path.join(
          options.outputDir,
          `${path.parse(inputPath).name}.${ext}`,
        );

        await saveImage(
          { buffer: resultBuffer, metadata: processed.metadata },
          outputPath,
          { quality: options.quality },
        );

        progress.completed++;
        logger.info('Image processed', {
          input: inputPath,
          output: outputPath,
        });
      } catch (error) {
        progress.failed++;
        logger.error('Failed to process image', {
          path: inputPath,
          error: error instanceof Error ? error.message : error,
        });
      }

      onProgress?.(progress);
    }
  };

  // Split into chunks based on concurrency
  const chunks: string[][] = [];
  for (let i = 0; i < inputPaths.length; i += options.concurrency) {
    chunks.push(inputPaths.slice(i, i + options.concurrency));
  }

  // Process chunks sequentially
  for (const chunk of chunks) {
    await processChunk(chunk);
  }

  logger.info('Batch processing complete', {
    completed: progress.completed,
    failed: progress.failed,
  });

  return progress;
}

/**
 * Get all image files in a directory
 */
export async function getImageFiles(dirPath: string): Promise<string[]> {
  const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.tiff'];
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          files.push(path.join(dirPath, entry.name));
        }
      }
    }
  } catch (error) {
    logger.error('Failed to read directory', { path: dirPath, error });
  }

  return files.sort();
}

/**
 * Create a batch processor with preset options
 */
export function createBatchProcessor(options: Partial<BatchProcessOptions>): {
  process: (
    inputPaths: string[],
    processFn: ProcessFunction,
  ) => Promise<BatchProgress>;
} {
  const fullOptions: BatchProcessOptions = {
    concurrency: options.concurrency ?? 3,
    outputDir: options.outputDir ?? './output',
    format: options.format,
    quality: options.quality,
  };

  return {
    process: (inputPaths: string[], processFn: ProcessFunction) =>
      batchProcess(inputPaths, processFn, fullOptions),
  };
}
