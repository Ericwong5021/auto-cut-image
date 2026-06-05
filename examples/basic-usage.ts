/**
 * Basic Usage Examples for Auto Cut Image
 *
 * This file demonstrates how to use the core library functions.
 */

import {
  segment,
  removeBackground,
  replaceBackground,
  crop,
  batchProcess,
} from '@auto-cut/core';

async function main() {
  console.log('=== Auto Cut Image - Basic Usage Examples ===\n');

  // Example 1: Segment an image
  console.log('1. Segmenting image...');
  const segmentResult = await segment('input/photo.jpg', {
    outputDir: './output/segmented',
    format: 'png',
    quality: 95,
  });
  console.log('Segment result:', segmentResult.success ? 'Success' : 'Failed');
  console.log('Output paths:', segmentResult.outputPaths);

  // Example 2: Remove background
  console.log('\n2. Removing background...');
  const bgRemoveResult = await removeBackground(
    'input/photo.jpg',
    'output/transparent.png',
  );
  console.log(
    'BG Remove result:',
    bgRemoveResult.success ? 'Success' : 'Failed',
  );

  // Example 3: Replace background color
  console.log('\n3. Replacing background...');
  const bgReplaceResult = await replaceBackground(
    'input/photo.jpg',
    'output/bg_replaced.png',
    '#FF5733',
  );
  console.log(
    'BG Replace result:',
    bgReplaceResult.success ? 'Success' : 'Failed',
  );

  // Example 4: Crop image
  console.log('\n4. Cropping image...');
  const cropResult = await crop('input/photo.jpg', 'output/cropped.png', {
    width: 800,
    height: 600,
    position: 'center',
  });
  console.log('Crop result:', cropResult.success ? 'Success' : 'Failed');

  // Example 5: Batch process
  console.log('\n5. Batch processing...');
  const batchResults = await batchProcess('./input/photos', {
    outputDir: './output/batch',
    format: 'png',
  });
  console.log(`Batch processed: ${batchResults.length} images`);

  console.log('\n=== All examples completed ===');
}

main().catch(console.error);
