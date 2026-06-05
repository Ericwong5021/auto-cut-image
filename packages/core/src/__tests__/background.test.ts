import * as sharp from 'sharp';
import { removeBackground, replaceBackground, generateTransparentPng, createSimpleMask } from '../processors/background';
import { createTestImage, createTestImageWithForeground, createTestMask } from './fixtures';
import { SegmentationResult } from '../engines/types';

describe('Background Processing', () => {
  describe('removeBackground', () => {
    it('should remove background from image', async () => {
      const imageBuffer = await createTestImageWithForeground(100, 100);
      const maskBuffer = await createTestMask(100, 100, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 100,
        height: 100
      };

      const result = await removeBackground(imageBuffer, mask);

      expect(result).toBeInstanceOf(Buffer);

      // Verify result has alpha channel
      const metadata = await sharp.default(result).metadata();
      expect(metadata.hasAlpha).toBe(true);
    });

    it('should resize mask if dimensions do not match', async () => {
      const imageBuffer = await createTestImage(200, 200);
      const maskBuffer = await createTestMask(100, 100, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 100,
        height: 100
      };

      const result = await removeBackground(imageBuffer, mask);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('replaceBackground', () => {
    it('should replace background with solid color', async () => {
      const imageBuffer = await createTestImageWithForeground(100, 100);
      const maskBuffer = await createTestMask(100, 100, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 100,
        height: 100
      };

      const result = await replaceBackground(imageBuffer, mask, {
        color: '#ff0000'
      });

      expect(result).toBeInstanceOf(Buffer);

      // Verify result has alpha channel
      const metadata = await sharp.default(result).metadata();
      expect(metadata.hasAlpha).toBe(true);
    });

    it('should handle hex colors with and without #', async () => {
      const imageBuffer = await createTestImage(50, 50);
      const maskBuffer = await createTestMask(50, 50, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 50,
        height: 50
      };

      // With #
      const result1 = await replaceBackground(imageBuffer, mask, {
        color: '#ffffff'
      });
      expect(result1).toBeInstanceOf(Buffer);

      // Without #
      const result2 = await replaceBackground(imageBuffer, mask, {
        color: '000000'
      });
      expect(result2).toBeInstanceOf(Buffer);
    });

    it('should handle 3-character hex colors', async () => {
      const imageBuffer = await createTestImage(50, 50);
      const maskBuffer = await createTestMask(50, 50, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 50,
        height: 50
      };

      const result = await replaceBackground(imageBuffer, mask, {
        color: '#fff'
      });

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw error for invalid hex color', async () => {
      const imageBuffer = await createTestImage(50, 50);
      const maskBuffer = await createTestMask(50, 50, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 50,
        height: 50
      };

      await expect(
        replaceBackground(imageBuffer, mask, { color: 'invalid' })
      ).rejects.toThrow('Invalid hex color');
    });
  });

  describe('generateTransparentPng', () => {
    it('should generate transparent PNG', async () => {
      const imageBuffer = await createTestImage(100, 100);
      const maskBuffer = await createTestMask(100, 100, 0.5);

      const mask: SegmentationResult = {
        mask: maskBuffer,
        width: 100,
        height: 100
      };

      const result = await generateTransparentPng(imageBuffer, mask);

      expect(result).toBeInstanceOf(Buffer);

      // Verify result is PNG with alpha
      const metadata = await sharp.default(result).metadata();
      expect(metadata.format).toBe('png');
      expect(metadata.hasAlpha).toBe(true);
    });
  });

  describe('createSimpleMask', () => {
    it('should create mask from background color', async () => {
      const imageBuffer = await createTestImageWithForeground(
        100, 100,
        { r: 255, g: 255, b: 255 }, // white background
        { r: 0, g: 0, b: 0 }        // black foreground
      );

      const mask = await createSimpleMask(imageBuffer, '#ffffff', 30);

      expect(mask).toBeInstanceOf(Buffer);

      // Verify mask properties
      const metadata = await sharp.default(mask).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    });

    it('should respect tolerance parameter', async () => {
      const imageBuffer = await createTestImage(50, 50, { r: 200, g: 200, b: 200 });

      // Low tolerance - should mark most as background
      const maskLow = await createSimpleMask(imageBuffer, '#ffffff', 10);
      expect(maskLow).toBeInstanceOf(Buffer);

      // High tolerance - should mark more as foreground
      const maskHigh = await createSimpleMask(imageBuffer, '#ffffff', 200);
      expect(maskHigh).toBeInstanceOf(Buffer);
    });
  });
});
