import * as path from 'path';
import * as fs from 'fs/promises';
import { loadImage, loadImageFromBuffer, saveImage, getImageMetadata, createProcessedImage, resizeImage, SUPPORTED_FORMATS } from '../utils/image-io';
import { createTestImage, saveFixture, createTestFixtures } from './fixtures';

describe('Image IO', () => {
  const fixturesDir = path.join(__dirname, '..', '__fixtures__');

  beforeAll(async () => {
    await createTestFixtures();
  });

  afterAll(async () => {
    await fs.rm(fixturesDir, { recursive: true, force: true });
  });

  describe('loadImage', () => {
    it('should load a PNG image', async () => {
      const filePath = path.join(fixturesDir, 'red.png');
      const image = await loadImage(filePath);

      expect(image).toBeDefined();
      expect(image.buffer).toBeInstanceOf(Buffer);
      expect(image.metadata.width).toBe(100);
      expect(image.metadata.height).toBe(100);
    });

    it('should throw error for unsupported format', async () => {
      const filePath = path.join(fixturesDir, 'test.bmp');
      await expect(loadImage(filePath)).rejects.toThrow('Unsupported format');
    });
  });

  describe('loadImageFromBuffer', () => {
    it('should load image from buffer', async () => {
      const buffer = await createTestImage(50, 50);
      const image = await loadImageFromBuffer(buffer);

      expect(image).toBeDefined();
      expect(image.buffer).toBeInstanceOf(Buffer);
      expect(image.metadata.width).toBe(50);
      expect(image.metadata.height).toBe(50);
    });
  });

  describe('saveImage', () => {
    it('should save image to file', async () => {
      const buffer = await createTestImage(50, 50);
      const image = await createProcessedImage(buffer);
      const outputPath = path.join(fixturesDir, 'output.png');

      await saveImage(image, outputPath);

      const exists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Verify saved image
      const saved = await loadImage(outputPath);
      expect(saved.metadata.width).toBe(50);
      expect(saved.metadata.height).toBe(50);
    });

    it('should save JPEG with quality option', async () => {
      const buffer = await createTestImage(50, 50);
      const image = await createProcessedImage(buffer);
      const outputPath = path.join(fixturesDir, 'output.jpg');

      await saveImage(image, outputPath, { quality: 80 });

      const saved = await loadImage(outputPath);
      expect(saved.metadata.format).toBe('jpeg');
    });
  });

  describe('getImageMetadata', () => {
    it('should return correct metadata', async () => {
      const buffer = await createTestImage(100, 150);
      const metadata = await getImageMetadata(buffer);

      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(150);
      expect(metadata.format).toBe('png');
    });
  });

  describe('resizeImage', () => {
    it('should resize image to fit max width', async () => {
      const buffer = await createTestImage(200, 100);
      const resized = await resizeImage(buffer, 100);

      const metadata = await getImageMetadata(resized);
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(50);
    });

    it('should resize image to fit max height', async () => {
      const buffer = await createTestImage(100, 200);
      const resized = await resizeImage(buffer, undefined, 50);

      const metadata = await getImageMetadata(resized);
      expect(metadata.width).toBe(25);
      expect(metadata.height).toBe(50);
    });

    it('should not resize if already smaller', async () => {
      const buffer = await createTestImage(50, 50);
      const resized = await resizeImage(buffer, 100);

      const metadata = await getImageMetadata(resized);
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(50);
    });
  });

  describe('SUPPORTED_FORMATS', () => {
    it('should contain common formats', () => {
      expect(SUPPORTED_FORMATS).toContain('png');
      expect(SUPPORTED_FORMATS).toContain('jpeg');
      expect(SUPPORTED_FORMATS).toContain('jpg');
      expect(SUPPORTED_FORMATS).toContain('webp');
    });
  });
});
