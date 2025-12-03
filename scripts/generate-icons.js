#!/usr/bin/env node

/**
 * Generate PWA Icons Script
 * 
 * This script generates all required PWA icons from the source logo
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.jpeg');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Icon sizes needed for PWA
const ICON_SIZES = [
  32,
  72,
  96,
  128,
  144,
  152,
  192,
  384,
  512,
];

// Apple touch icon size
const APPLE_ICON_SIZE = 180;

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  try {
    // Check if source logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`❌ Logo not found at: ${LOGO_PATH}`);
      console.log('Please ensure logo.jpeg exists in the public folder');
      process.exit(1);
    }

    // Load the source image
    const sourceImage = sharp(LOGO_PATH);
    const metadata = await sourceImage.metadata();
    console.log(`📸 Source image: ${metadata.width}x${metadata.height}\n`);

    // Generate standard icons
    for (const size of ICON_SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      
      await sourceImage
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate Apple touch icon
    const appleTouchPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
    await sourceImage
      .clone()
      .resize(APPLE_ICON_SIZE, APPLE_ICON_SIZE, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log(`✅ Generated: apple-touch-icon.png`);

    // Generate 32x32 favicon
    const faviconPath = path.join(ICONS_DIR, 'icon-32x32.png');
    // Already generated in the loop, but copy it as favicon.ico equivalent
    
    console.log('\n✨ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${ICONS_DIR}`);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateIcons();
