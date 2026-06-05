#!/usr/bin/env bun

/**
 * Auto Cut Image - CLI
 *
 * Command line interface for image segmentation and processing.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import {
  segment,
  removeBackground,
  replaceBackground,
  crop,
  batchProcess,
} from '@auto-cut/core';

const program = new Command();

program
  .name('auto-cut')
  .description('AI-powered image asset segmentation and background processing')
  .version('0.1.0');

program
  .command('segment')
  .description('Segment image into individual assets')
  .argument('<input>', 'Input image path')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-f, --format <format>', 'Output format (png|jpg)', 'png')
  .option('-q, --quality <number>', 'Output quality 1-100', '95')
  .action(async (input: string, options: { output: string; format: string; quality: string }) => {
    const spinner = ora('Segmenting image...').start();

    try {
      const result = await segment(input, {
        outputDir: options.output,
        format: options.format as 'png' | 'jpg',
        quality: parseInt(options.quality, 10),
      });

      if (result.success) {
        spinner.succeed(chalk.green('Image segmented successfully!'));
        console.log(chalk.cyan('Output:'), result.outputPaths.join(', '));
        console.log(chalk.gray(`Processing time: ${result.processingTime}ms`));
      } else {
        spinner.fail(chalk.red('Segmentation failed'));
        console.error(chalk.red(result.error || 'Unknown error'));
        process.exit(1);
      }
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
  .action(async (input: string, options: { output?: string }) => {
    const spinner = ora('Removing background...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_transparent$1');

    try {
      const result = await removeBackground(input, output);

      if (result.success) {
        spinner.succeed(chalk.green('Background removed successfully!'));
        console.log(chalk.cyan('Output:'), result.outputPaths[0]);
        console.log(chalk.gray(`Processing time: ${result.processingTime}ms`));
      } else {
        spinner.fail(chalk.red('Background removal failed'));
        console.error(chalk.red(result.error || 'Unknown error'));
        process.exit(1);
      }
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
  .action(async (input: string, options: { color: string; output?: string }) => {
    const spinner = ora('Replacing background...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_bg_replaced$1');

    try {
      const result = await replaceBackground(input, output, options.color);

      if (result.success) {
        spinner.succeed(chalk.green('Background replaced successfully!'));
        console.log(chalk.cyan('Output:'), result.outputPaths[0]);
        console.log(chalk.gray(`Processing time: ${result.processingTime}ms`));
      } else {
        spinner.fail(chalk.red('Background replacement failed'));
        console.error(chalk.red(result.error || 'Unknown error'));
        process.exit(1);
      }
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
  .requiredOption('-W, --width <number>', 'Target width')
  .requiredOption('-H, --height <number>', 'Target height')
  .option('-p, --position <position>', 'Crop position (center|top|bottom|left|right)', 'center')
  .option('-o, --output <file>', 'Output file path')
  .action(async (input: string, options: { width: string; height: string; position: string; output?: string }) => {
    const spinner = ora('Cropping image...').start();
    const output = options.output || input.replace(/(\.[^.]+)$/, '_cropped$1');

    try {
      const result = await crop(input, output, {
        width: parseInt(options.width, 10),
        height: parseInt(options.height, 10),
        position: options.position as 'center' | 'top' | 'bottom' | 'left' | 'right',
      });

      if (result.success) {
        spinner.succeed(chalk.green('Image cropped successfully!'));
        console.log(chalk.cyan('Output:'), result.outputPaths[0]);
        console.log(chalk.gray(`Processing time: ${result.processingTime}ms`));
      } else {
        spinner.fail(chalk.red('Cropping failed'));
        console.error(chalk.red(result.error || 'Unknown error'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('Cropping failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Batch process multiple images')
  .argument('<dir>', 'Input directory')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-f, --format <format>', 'Output format (png|jpg)', 'png')
  .action(async (dir: string, options: { output: string; format: string }) => {
    const spinner = ora('Batch processing images...').start();

    try {
      const results = await batchProcess(dir, {
        outputDir: options.output,
        format: options.format as 'png' | 'jpg',
      });

      const successCount = results.filter((r) => r.success).length;
      spinner.succeed(chalk.green(`Processed ${successCount}/${results.length} images`));

      if (successCount < results.length) {
        console.log(chalk.yellow(`Warning: ${results.length - successCount} images failed`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Batch processing failed'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program.parse();
