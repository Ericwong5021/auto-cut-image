import { describe, it, expect } from 'vitest';
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
} from './index';

describe('Core Image Processing - Exports', () => {
  describe('Module exports', () => {
    it('should export loadImage function', () => {
      expect(typeof loadImage).toBe('function');
    });

    it('should export saveImage function', () => {
      expect(typeof saveImage).toBe('function');
    });

    it('should export removeBackground function', () => {
      expect(typeof removeBackground).toBe('function');
    });

    it('should export replaceBackground function', () => {
      expect(typeof replaceBackground).toBe('function');
    });

    it('should export generateTransparentPng function', () => {
      expect(typeof generateTransparentPng).toBe('function');
    });

    it('should export createSimpleMask function', () => {
      expect(typeof createSimpleMask).toBe('function');
    });

    it('should export cropImage function', () => {
      expect(typeof cropImage).toBe('function');
    });

    it('should export cropToSquare function', () => {
      expect(typeof cropToSquare).toBe('function');
    });

    it('should export cropToAspectRatio function', () => {
      expect(typeof cropToAspectRatio).toBe('function');
    });

    it('should export cropWithPreset function', () => {
      expect(typeof cropWithPreset).toBe('function');
    });

    it('should export smartCrop function', () => {
      expect(typeof smartCrop).toBe('function');
    });

    it('should export getCropPresets function', () => {
      expect(typeof getCropPresets).toBe('function');
    });

    it('should export batchProcess function', () => {
      expect(typeof batchProcess).toBe('function');
    });

    it('should export getImageFiles function', () => {
      expect(typeof getImageFiles).toBe('function');
    });

    it('should export createApiEngine function', () => {
      expect(typeof createApiEngine).toBe('function');
    });

    it('should export createLocalEngine function', () => {
      expect(typeof createLocalEngine).toBe('function');
    });
  });

  describe('getCropPresets', () => {
    it('should return array of presets', () => {
      const presets = getCropPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should include common presets', () => {
      const presets = getCropPresets();
      const names = presets.map(p => p.name);
      expect(names).toContain('square');
      expect(names).toContain('portrait');
      expect(names).toContain('landscape');
    });
  });
});
