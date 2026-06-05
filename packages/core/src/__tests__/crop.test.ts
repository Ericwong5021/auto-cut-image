import * as sharp from 'sharp';
import {
  cropImage,
  cropToAspectRatio,
  cropToSquare,
  cropWithPreset,
  smartCrop,
  getCropPresets,
  getCropPreset,
  CROP_PRESETS
} from '../processors/crop';
import { createTestImage } from './fixtures';

describe('Crop', () => {
  describe('cropImage', () => {
    it('should crop image to specified dimensions', async () => {
      const buffer = await createTestImage(200, 100);
      const cropped = await cropImage(buffer, {
        x: 10,
        y: 10,
        width: 50,
        height: 50
      });

      const metadata = await sharp.default(cropped).metadata();
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(50);
    });

    it('should throw error for negative coordinates', async () => {
      const buffer = await createTestImage(100, 100);

      await expect(
        cropImage(buffer, { x: -10, y: 0, width: 50, height: 50 })
      ).rejects.toThrow('non-negative');
    });

    it('should throw error when crop exceeds image bounds', async () => {
      const buffer = await createTestImage(100, 100);

      await expect(
        cropImage(buffer, { x: 50, y: 50, width: 100, height: 100 })
      ).rejects.toThrow('exceeds');
    });

    it('should throw error for zero or negative dimensions', async () => {
      const buffer = await createTestImage(100, 100);

      await expect(
        cropImage(buffer, { x: 0, y: 0, width: 0, height: 50 })
      ).rejects.toThrow('positive');

      await expect(
        cropImage(buffer, { x: 0, y: 0, width: 50, height: -10 })
      ).rejects.toThrow('positive');
    });
  });

  describe('cropToAspectRatio', () => {
    it('should crop wide image to portrait ratio', async () => {
      const buffer = await createTestImage(200, 100);
      const cropped = await cropToAspectRatio(buffer, 0.75); // 3:4

      const metadata = await sharp.default(cropped).metadata();
      const ratio = metadata.width! / metadata.height!;
      expect(Math.abs(ratio - 0.75)).toBeLessThan(0.01);
    });

    it('should crop tall image to landscape ratio', async () => {
      const buffer = await createTestImage(100, 200);
      const cropped = await cropToAspectRatio(buffer, 1.333); // 4:3

      const metadata = await sharp.default(cropped).metadata();
      const ratio = metadata.width! / metadata.height!;
      expect(Math.abs(ratio - 1.333)).toBeLessThan(0.01);
    });
  });

  describe('cropToSquare', () => {
    it('should crop to center square', async () => {
      const buffer = await createTestImage(200, 100);
      const cropped = await cropToSquare(buffer);

      const metadata = await sharp.default(cropped).metadata();
      expect(metadata.width).toBe(metadata.height);
      expect(metadata.width).toBe(100);
    });

    it('should return original if already square', async () => {
      const buffer = await createTestImage(100, 100);
      const cropped = await cropToSquare(buffer);

      const metadata = await sharp.default(cropped).metadata();
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
    });
  });

  describe('cropWithPreset', () => {
    it('should crop with named preset', async () => {
      const buffer = await createTestImage(400, 300);
      const cropped = await cropWithPreset(buffer, 'square');

      const metadata = await sharp.default(cropped).metadata();
      expect(metadata.width).toBe(metadata.height);
    });

    it('should throw error for unknown preset', async () => {
      const buffer = await createTestImage(100, 100);

      await expect(cropWithPreset(buffer, 'unknown')).rejects.toThrow('Unknown preset');
    });
  });

  describe('smartCrop', () => {
    it('should crop to content area', async () => {
      // Create image with transparent border
      const buffer = await createTestImage(100, 100);
      const cropped = await smartCrop(buffer);

      expect(cropped).toBeInstanceOf(Buffer);
    });

    it('should add padding when specified', async () => {
      const buffer = await createTestImage(100, 100);
      const cropped = await smartCrop(buffer, 10);

      expect(cropped).toBeInstanceOf(Buffer);
    });
  });

  describe('getCropPresets', () => {
    it('should return all presets', () => {
      const presets = getCropPresets();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets).toEqual(CROP_PRESETS);
    });

    it('should have required fields', () => {
      const presets = getCropPresets();
      for (const preset of presets) {
        expect(preset.name).toBeDefined();
        expect(preset.ratio).toBeGreaterThan(0);
        expect(preset.description).toBeDefined();
      }
    });
  });

  describe('getCropPreset', () => {
    it('should find preset by name', () => {
      const preset = getCropPreset('square');
      expect(preset).toBeDefined();
      expect(preset?.name).toBe('square');
      expect(preset?.ratio).toBe(1);
    });

    it('should return undefined for unknown preset', () => {
      const preset = getCropPreset('nonexistent');
      expect(preset).toBeUndefined();
    });
  });

  describe('CROP_PRESETS', () => {
    it('should include common presets', () => {
      const names = CROP_PRESETS.map(p => p.name);
      expect(names).toContain('square');
      expect(names).toContain('portrait');
      expect(names).toContain('landscape');
      expect(names).toContain('wide');
    });
  });
});
