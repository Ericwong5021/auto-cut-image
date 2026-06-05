#!/usr/bin/env bun

/**
 * Auto Cut Image - CLI
 *
 * Command line interface for image segmentation and processing.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import {
  loadImage,
  saveImage,
  removeBackground,
  replaceBackground,
  generateTransparentPng,
  createSimpleMask,
  cropImage,
  cropToSquare,
  cropToAspectRatio,
  cropWithPreset,
  smartCrop,
  getCropPresets,
  batchProcess,
  getImageFiles,
  createApiEngine,
  createLocalEngine,
} from '@auto-cut/core';
import type { ProcessedImage, SegmentationResult } from '@auto-cut/core';

const program = new Command();

program
  .name('auto-cut')
  .description('AI-powered image asset segmentation and background processing')
  .version('0.1.0');

program
  .command('segment')
  .description('Segment image and save foreground as transparent PNG')
  .argument('<input>', 'Input image path')
  .option('-o, --output <file>', 'Output file path')
  .option('-e, --engine <engine>', 'Segmentation engine: api|local', 'api')
  .option('--provider <provider>', 'API provider: openai|removebg', 'removebg')
  .option('--api-key <key>', 'API key for remote segmentation')
  .option('--bg-color <color>', 'Background color for simple mask (hex)', '#FFFFFF')
  .option('--tolerance <number>', 'Color tolerance for simple mask', '30')
  .action(async (input: string, options: { output?: string; engine: string; provider: string; apiKey?: string; bgColor: string; tolerance: string }) => {
    const spinner = ora('Segmenting image...').start();

    try {
      const processed = await loadImage(input);
      const output = options.output || input.replace(/(\.[^.]+)$/, '_segmented$1');

      let mask: SegmentationResult;

      if (options.engine === 'local') {
        const engine = createLocalEngine({ modelPath: './models/sam.onnx' });
        mask = await engine.segment(processed.buffer);
      } else if (options.engine === 'api' && options.apiKey) {
        const engine = createApiEngine({
          provider: options.provider as 'openai' | 'removebg',
          apiKey: options.apiKey,
        });
        mask = await engine.segment(processed.buffer);
      } else {
        // Fallback: simple mask based on background color
        const maskBuffer = await createSimpleMask(
          processed.buffer,
          options.bgColor,
          parseInt(options.tolerance, 10),
        );
        mask = {
          mask: maskBuffer,
          width: processed.metadata.width,
          height: processed.metadata.height,
        };
      }

      const resultBuffer = await generateTransparentPng(processed.buffer, mask);
      await saveImage({ buffer: resultBuffer, metadata: processed.metadata }, output);

      spinner.succeed(chalk.green('Image segmented successfully!'));
      console.log(chalk.cyan('Output:'), output);
    } catch (error) {
      spinner.fail(chalk.red('Segmentation failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program
  .command('bg-remove')
  .description('Remove image background')
  .argument('<input>', 'Input image path')
  .option('-o, --output <file>', 'Output file path')
  .option('--bg-color <color>', 'Background color for mask (hex)', '#FFFFFF')
  .option('--tolerance <number>', 'Color tolerance', '30')
  .action(async (input: string, options: { output?: string; bgColor: string; tolerance: string }) => {
    const spinner = ora('Removing background...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_transparent$1');

    try {
      const processed = await loadImage(input);
      const maskBuffer = await createSimpleMask(
        processed.buffer,
        options.bgColor,
        parseInt(options.tolerance, 10),
      );
      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: processed.metadata.width,
        height: processed.metadata.height,
      };

      const resultBuffer = await removeBackground(processed.buffer, mask);
      await saveImage({ buffer: resultBuffer, metadata: processed.metadata }, output);

      spinner.succeed(chalk.green('Background removed successfully!'));
      console.log(chalk.cyan('Output:'), output);
    } catch (error) {
      spinner.fail(chalk.red('Background removal failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program
  .command('bg-replace')
  .description('Replace image background')
  .argument('<input>', 'Input image path')
  .option('-c, --color <color>', 'Background color (hex or named)', '#FFFFFF')
  .option('-o, --output <file>', 'Output file path')
  .option('--opacity <number>', 'Background opacity (0-1)', '1')
  .option('--bg-color <color>', 'Color to detect as background for mask (hex)', '#FFFFFF')
  .option('--tolerance <number>', 'Color tolerance for mask', '30')
  .action(async (input: string, options: { color: string; output?: string; opacity: string; bgColor: string; tolerance: string }) => {
    const spinner = ora('Replacing background...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_bg_replaced$1');

    try {
      const processed = await loadImage(input);
      const maskBuffer = await createSimpleMask(
        processed.buffer,
        options.bgColor,
        parseInt(options.tolerance, 10),
      );
      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: processed.metadata.width,
        height: processed.metadata.height,
      };

      const resultBuffer = await replaceBackground(processed.buffer, mask, {
        color: options.color,
        opacity: parseFloat(options.opacity),
      });
      await saveImage({ buffer: resultBuffer, metadata: processed.metadata }, output);

      spinner.succeed(chalk.green('Background replaced successfully!'));
      console.log(chalk.cyan('Output:'), output);
    } catch (error) {
      spinner.fail(chalk.red('Background replacement failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program
  .command('crop')
  .description('Crop image to specified dimensions')
  .argument('<input>', 'Input image path')
  .option('-W, --width <number>', 'Target width')
  .option('-H, --height <number>', 'Target height')
  .option('-x, --x <number>', 'Crop X offset', '0')
  .option('-y, --y <number>', 'Crop Y offset', '0')
  .option('--square', 'Crop to center square')
  .option('--ratio <number>', 'Crop to aspect ratio (width/height)')
  .option('--preset <name>', 'Use crop preset (square, portrait, landscape, wide, etc.)')
  .option('--smart', 'Smart crop to content area')
  .option('-o, --output <file>', 'Output file path')
  .action(async (input: string, options: { width?: string; height?: string; x: string; y: string; square?: boolean; ratio?: string; preset?: string; smart?: boolean; output?: string }) => {
    const spinner = ora('Cropping image...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_cropped$1');

    try {
      const processed = await loadImage(input);
      let resultBuffer: Buffer;

      if (options.smart) {
        resultBuffer = await smartCrop(processed.buffer);
      } else if (options.square) {
        resultBuffer = await cropToSquare(processed.buffer);
      } else if (options.preset) {
        resultBuffer = await cropWithPreset(processed.buffer, options.preset);
      } else if (options.ratio) {
        resultBuffer = await cropToAspectRatio(processed.buffer, parseFloat(options.ratio));
      } else if (options.width && options.height) {
        resultBuffer = await cropImage(processed.buffer, {
          x: parseInt(options.x, 10),
          y: parseInt(options.y, 10),
          width: parseInt(options.width, 10),
          height: parseInt(options.height, 10),
        });
      } else {
        spinner.fail(chalk.red('Please specify crop dimensions (--width/--height), --square, --ratio, --preset, or --smart'));
        process.exit(1);
      }

      await saveImage({ buffer: resultBuffer, metadata: processed.metadata }, output);

      spinner.succeed(chalk.green('Image cropped successfully!'));
      console.log(chalk.cyan('Output:'), output);
    } catch (error) {
      spinner.fail(chalk.red('Cropping failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program
  .command('presets')
  .description('List available crop presets')
  .action(() => {
    const presets = getCropPresets();
    console.log(chalk.cyan('Available crop presets:'));
    console.log('');
    for (const preset of presets) {
      console.log(`  ${chalk.green(preset.name.padEnd(20))} ${preset.description} (${preset.ratio}:1)`);
    }
  });

program
  .command('batch')
  .description('Batch process multiple images')
  .argument('<dir>', 'Input directory')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-f, --format <format>', 'Output format (png|jpg)', 'png')
  .option('-c, --concurrency <number>', 'Max concurrent tasks', '3')
  .option('--bg-color <color>', 'Background color for mask (hex)', '#FFFFFF')
  .option('--tolerance <number>', 'Color tolerance for mask', '30')
  .action(async (dir: string, options: { output: string; format: string; concurrency: string; bgColor: string; tolerance: string }) => {
    const spinner = ora('Batch processing images...').start();

    try {
      const files = await getImageFiles(dir);

      if (files.length === 0) {
        spinner.warn(chalk.yellow('No image files found in directory'));
        return;
      }

      console.log(chalk.cyan(`Found ${files.length} images to process`));

      const progress = await batchProcess(
        files,
        async (processed: ProcessedImage) => {
          const maskBuffer = await createSimpleMask(
            processed.buffer,
            options.bgColor,
            parseInt(options.tolerance, 10),
          );
          const mask: SegmentationResult = {
            mask: maskBuffer,
            width: processed.metadata.width,
            height: processed.metadata.height,
          };
          return removeBackground(processed.buffer, mask);
        },
        {
          concurrency: parseInt(options.concurrency, 10),
          outputDir: options.output,
          format: options.format as 'png' | 'jpeg',
        },
        (p) => {
          spinner.text = `Processing: ${p.current || ''} (${p.completed + p.failed}/${p.total})`;
        },
      );

      spinner.succeed(chalk.green(`Batch complete: ${progress.completed} succeeded, ${progress.failed} failed`));
    } catch (error) {
      spinner.fail(chalk.red('Batch processing failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program.parse();
