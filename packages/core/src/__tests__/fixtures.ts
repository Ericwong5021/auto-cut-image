import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__');

/**
 * Create a simple test image
 */
export async function createTestImage(
  width: number = 100,
  height: number = 100,
  color: { r: number; g: number; b: number } = { r: 255, g: 0, b: 0 },
): Promise<Buffer> {
  const channels = 3;
  const data = Buffer.alloc(width * height * channels);

  for (let i = 0; i < data.length; i += channels) {
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }

  return sharp
    .default(data, {
      raw: { width, height, channels },
    })
    .png()
    .toBuffer();
}

/**
 * Create a test image with alpha channel
 */
export async function createTestImageWithAlpha(
  width: number = 100,
  height: number = 100,
  color: { r: number; g: number; b: number; a: number } = {
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  },
): Promise<Buffer> {
  const channels = 4;
  const data = Buffer.alloc(width * height * channels);

  for (let i = 0; i < data.length; i += channels) {
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
    data[i + 3] = color.a;
  }

  return sharp
    .default(data, {
      raw: { width, height, channels },
    })
    .png()
    .toBuffer();
}

/**
 * Create a test image with background and foreground
 */
export async function createTestImageWithForeground(
  width: number = 200,
  height: number = 200,
  bgColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 },
  fgColor: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
  fgSize: number = 100,
): Promise<Buffer> {
  const channels = 3;
  const data = Buffer.alloc(width * height * channels);

  const fgLeft = Math.floor((width - fgSize) / 2);
  const fgTop = Math.floor((height - fgSize) / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;

      if (
        x >= fgLeft &&
        x < fgLeft + fgSize &&
        y >= fgTop &&
        y < fgTop + fgSize
      ) {
        data[idx] = fgColor.r;
        data[idx + 1] = fgColor.g;
        data[idx + 2] = fgColor.b;
      } else {
        data[idx] = bgColor.r;
        data[idx + 1] = bgColor.g;
        data[idx + 2] = bgColor.b;
      }
    }
  }

  return sharp
    .default(data, {
      raw: { width, height, channels },
    })
    .png()
    .toBuffer();
}

/**
 * Create a simple mask
 */
export async function createTestMask(
  width: number = 100,
  height: number = 100,
  fillPercent: number = 0.5,
): Promise<Buffer> {
  const data = Buffer.alloc(width * height);

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * fillPercent * 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2),
      );
      data[y * width + x] = dist < radius ? 255 : 0;
    }
  }

  return sharp
    .default(data, {
      raw: { width, height, channels: 1 },
    })
    .png()
    .toBuffer();
}

/**
 * Save test fixture to file
 */
export async function saveFixture(
  name: string,
  buffer: Buffer,
): Promise<string> {
  await fs.mkdir(FIXTURES_DIR, { recursive: true });
  const filePath = path.join(FIXTURES_DIR, name);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Create and save test fixtures
 */
export async function createTestFixtures(): Promise<void> {
  // Create test images
  const redImage = await createTestImage(100, 100, { r: 255, g: 0, b: 0 });
  await saveFixture('red.png', redImage);

  const blueImage = await createTestImage(100, 100, { r: 0, g: 0, b: 255 });
  await saveFixture('blue.png', blueImage);

  const gradientImage = await createTestImage(200, 150, {
    r: 128,
    g: 128,
    b: 128,
  });
  await saveFixture('gradient.png', gradientImage);

  const imageWithAlpha = await createTestImageWithAlpha(100, 100, {
    r: 255,
    g: 0,
    b: 0,
    a: 128,
  });
  await saveFixture('alpha.png', imageWithAlpha);

  const imageWithFg = await createTestImageWithForeground(200, 200);
  await saveFixture('foreground.png', imageWithFg);

  const mask = await createTestMask(100, 100, 0.5);
  await saveFixture('mask.png', mask);
}
