import { NextRequest, NextResponse } from 'next/server';

// Real color palette extraction using Vibrant.js
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('imageUrl');
    
    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('🎨 Extracting REAL color palette from:', url);

    // Extract real colors using Vibrant.js
    const colors = await extractColorsWithVibrant(url);
    
    console.log('✅ REAL colors extracted with Vibrant:', colors);

    return NextResponse.json({
      palette: colors
    });

  } catch (error) {
    console.error('❌ Color extraction error:', error);
    
    // Fallback to smart palette based on image content
    const fallbackColors = generateSmartFallbackPalette();
    
    return NextResponse.json({
      palette: fallbackColors
    });
  }
}

async function extractColorsWithVibrant(imageUrl: string): Promise<string[]> {
  try {
    // Use import for node-vibrant in serverless environment
    const Vibrant = (await import('node-vibrant')).default;
    
    console.log('🎨 ColorPalette → URL:', imageUrl);
    console.log('🎨 Processing image with Vibrant.js:', imageUrl);
    
    const palette = await Vibrant.from(imageUrl).getPalette();
    console.log('🎨 Palette raw:', palette);
    
    // Extract colors from Vibrant swatches - filter null values properly
    const colors: string[] = [];
    
    // Check each swatch and add hex if it exists
    for (const [key, swatch] of Object.entries(palette)) {
      if (swatch && typeof swatch.getHex === 'function') {
        colors.push(swatch.getHex());
      }
    }
    
    if (colors.length === 0) {
      throw new Error('No valid colors extracted from image');
    }
    
    console.log('✅ Vibrant extracted colors:', colors);
    return colors.slice(0, 6); // Return max 6 colors
    
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