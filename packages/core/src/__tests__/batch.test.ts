import * as path from 'path';
import * as fs from 'fs/promises';
import { batchProcess, getImageFiles, createBatchProcessor } from '../batch';
import { createTestImage, saveFixture, createTestFixtures } from './fixtures';
import { ProcessedImage } from '../engines/types';

describe('Batch Processing', () => {
  const fixturesDir = path.join(__dirname, '..', '__fixtures__');
  const outputDir = path.join(fixturesDir, 'output');

  beforeAll(async () => {
    await createTestFixtures();
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up output directory after each test
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(outputDir, { recursive: true });
  });

  describe('getImageFiles', () => {
    it('should get all image files from directory', async () => {
      const files = await getImageFiles(fixturesDir);

      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBeGreaterThan(0);

      // Should include PNG files
      const pngFiles = files.filter((f) => f.endsWith('.png'));
      expect(pngFiles.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty directory', async () => {
      const emptyDir = path.join(fixturesDir, 'empty');
      await fs.mkdir(emptyDir, { recursive: true });

      const files = await getImageFiles(emptyDir);
      expect(files).toEqual([]);

      await fs.rm(emptyDir, { recursive: true, force: true });
    });

    it('should not include non-image files', async () => {
      // Create a text file
      const textFile = path.join(fixturesDir, 'test.txt');
      await fs.writeFile(textFile, 'test');

      const files = await getImageFiles(fixturesDir);
      const textFiles = files.filter((f) => f.endsWith('.txt'));
      expect(textFiles.length).toBe(0);

      await fs.rm(textFile);
    });
  });

  describe('batchProcess', () => {
    it('should process multiple images', async () => {
      const inputPaths = [
        path.join(fixturesDir, 'red.png'),
        path.join(fixturesDir, 'blue.png'),
      ];

      const processFn = async (input: ProcessedImage) => {
        // Simple pass-through
        return input.buffer;
      };

      const progress = await batchProcess(inputPaths, processFn, {
        concurrency: 2,
        outputDir,
      });

      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(2);
      expect(progress.failed).toBe(0);
    });

    it('should handle processing errors gracefully', async () => {
      const inputPaths = [
        path.join(fixturesDir, 'red.png'),
        path.join(fixturesDir, 'nonexistent.png'),
        path.join(fixturesDir, 'blue.png'),
      ];

      const processFn = async (input: ProcessedImage) => {
        return input.buffer;
      };

      const progress = await batchProcess(inputPaths, processFn, {
        concurrency: 1,
        outputDir,
      });

      expect(progress.total).toBe(3);
      expect(progress.completed).toBe(2);
      expect(progress.failed).toBe(1);
    });

    it('should call onProgress callback', async () => {
      const inputPaths = [path.join(fixturesDir, 'red.png')];
      const progressUpdates: any[] = [];

      const processFn = async (input: ProcessedImage) => {
        return input.buffer;
      };

      await batchProcess(
        inputPaths,
        processFn,
        {
          concurrency: 1,
          outputDir,
        },
        (progress) => {
          progressUpdates.push({ ...progress });
        },
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('should create output directory if it does not exist', async () => {
      const newOutputDir = path.join(fixturesDir, 'new-output');
      const inputPaths = [path.join(fixturesDir, 'red.png')];

      const processFn = async (input: ProcessedImage) => {
        return input.buffer;
      };

      await batchProcess(inputPaths, processFn, {
        concurrency: 1,
        outputDir: newOutputDir,
      });

      const exists = await fs
        .access(newOutputDir)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      await fs.rm(newOutputDir, { recursive: true, force: true });
    });
  });

  describe('createBatchProcessor', () => {
    it('should create batch processor with default options', () => {
      const processor = createBatchProcessor({
        outputDir,
      });

      expect(processor).toBeDefined();
      expect(processor.process).toBeInstanceOf(Function);
    });

    it('should process images using processor', async () => {
      const processor = createBatchProcessor({
        concurrency: 2,
        outputDir,
      });

      const inputPaths = [path.join(fixturesDir, 'red.png')];

      const progress = await processor.process(inputPaths, async (input) => {
        return input.buffer;
      });

      expect(progress.completed).toBe(1);
    });
  });
});
