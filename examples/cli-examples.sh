#!/bin/bash

# Auto Cut Image - CLI Examples
#
# This script demonstrates various CLI commands.

echo "=== Auto Cut Image - CLI Examples ==="
echo ""

# Example 1: Segment an image
echo "1. Segmenting image..."
auto-cut segment input/photo.jpg --output ./output/segmented --format png

# Example 2: Remove background
echo ""
echo "2. Removing background..."
auto-cut bg-remove input/photo.jpg --output transparent.png

# Example 3: Replace background color
echo ""
echo "3. Replacing background color..."
auto-cut bg-replace input/photo.jpg --color "#FF5733" --output result.png

# Example 4: Crop image
echo ""
echo "4. Cropping image..."
auto-cut crop input/photo.jpg --width 800 --height 600 --position center --output cropped.png

# Example 5: Batch process directory
echo ""
echo "5. Batch processing directory..."
auto-cut batch ./input/photos --output ./output/batch --format png

echo ""
echo "=== All examples completed ==="
