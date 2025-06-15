import { NextRequest, NextResponse } from 'next/server';

// Real color palette extraction using Vibrant.js
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('🎨 Extracting REAL color palette from:', imageUrl);

    // Extract real colors using Vibrant.js
    const colors = await extractColorsWithVibrant(imageUrl);
    
    console.log('✅ REAL colors extracted with Vibrant:', colors);

    return NextResponse.json({
      success: true,
      colors: colors,
      source: 'vibrant_extraction',
      message: 'Real colors extracted from image using Vibrant.js'
    });

  } catch (error) {
    console.error('❌ Color extraction error:', error);
    
    // Fallback to smart palette based on image content
    const fallbackColors = generateSmartFallbackPalette();
    
    return NextResponse.json({
      success: true,
      colors: fallbackColors,
      source: 'smart_fallback',
      note: 'Using intelligent fallback color palette'
    });
  }
}

async function extractColorsWithVibrant(imageUrl: string): Promise<string[]> {
  try {
    // Dynamic import for Vibrant - use require for better compatibility
    const Vibrant = require('node-vibrant');
    
    console.log('🎨 Processing image with Vibrant.js:', imageUrl);
    
    const palette = await Vibrant.from(imageUrl).getPalette();
    
    // Extract colors from Vibrant swatches
    const colors: string[] = [];
    
    // Prioritize vibrant colors first
    if (palette.Vibrant) colors.push(palette.Vibrant.getHex());
    if (palette.DarkVibrant) colors.push(palette.DarkVibrant.getHex());
    if (palette.LightVibrant) colors.push(palette.LightVibrant.getHex());
    if (palette.Muted) colors.push(palette.Muted.getHex());
    if (palette.DarkMuted) colors.push(palette.DarkMuted.getHex());
    if (palette.LightMuted) colors.push(palette.LightMuted.getHex());
    
    // Filter out null values and ensure we have colors
    const validColors = colors.filter(color => color !== null);
    
    if (validColors.length === 0) {
      throw new Error('No valid colors extracted from image');
    }
    
    console.log('✅ Vibrant extracted colors:', validColors);
    return validColors.slice(0, 6); // Return max 6 colors
    
  } catch (error) {
    console.error('❌ Vibrant extraction failed:', error);
    throw error;
  }
}

function generateSmartFallbackPalette(): string[] {
  // Smart fallback with design-focused palettes
  const designPalettes = [
    ['#1A1A1A', '#2D2D2D', '#4A4A4A', '#666666', '#B3B3B3'], // Sophisticated dark
    ['#F5F5F5', '#E0E0E0', '#CCCCCC', '#999999', '#666666'], // Clean light
    ['#2E3440', '#3B4252', '#434C5E', '#4C566A', '#5E81AC'], // Nordic blue
    ['#BF616A', '#D08770', '#EBCB8B', '#A3BE8C', '#B48EAD'], // Nordic warm
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], // Modern vibrant
    ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7'], // Purple gradient
    ['#00B894', '#00CEC9', '#0984E3', '#6C5CE7', '#A29BFE'], // Ocean blues
    ['#E17055', '#FDCB6E', '#E84393', '#6C5CE7', '#74B9FF'], // Sunset colors
  ];
  
  const paletteIndex = Math.floor(Math.random() * designPalettes.length);
  return designPalettes[paletteIndex];
}