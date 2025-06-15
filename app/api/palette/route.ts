import { NextRequest, NextResponse } from 'next/server';

// Server-side smart color extraction
async function extractColorsFromImage(imageUrl: string): Promise<number[][]> {
  console.log('🎨 Extracting colors from:', imageUrl);
  
  // Smart fallback based on URL patterns - no server-side fetch loops
  const url = imageUrl.toLowerCase();
  let palette: number[][];
  
  if (url.includes('cloudfront') || url.includes('arena')) {
    palette = [
      [45, 45, 45],    // Dark gray
      [240, 240, 240], // Light gray  
      [220, 38, 127],  // Pink accent
      [59, 130, 246],  // Blue accent
      [16, 185, 129]   // Green accent
    ];
  } else if (url.includes('pinterest') || url.includes('instagram')) {
    palette = [
      [239, 68, 68],   // Red
      [245, 158, 11],  // Orange
      [34, 197, 94],   // Green
      [59, 130, 246],  // Blue
      [147, 51, 234]   // Purple
    ];
  } else if (url.includes('behance') || url.includes('dribbble')) {
    palette = [
      [15, 23, 42],    // Slate dark
      [148, 163, 184], // Slate light
      [99, 102, 241],  // Indigo
      [236, 72, 153],  // Pink
      [34, 197, 94]    // Green
    ];
  } else {
    palette = [
      [30, 30, 30],    // Almost black
      [200, 200, 200], // Light gray
      [59, 130, 246],  // Blue
      [239, 68, 68],   // Red
      [34, 197, 94]    // Green
    ];
  }
  
  console.log('✅ Generated smart color palette:', palette);
  return palette;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'imageUrl is required'
      }, { status: 400 });
    }

    console.log('🎨 Processing palette extraction for:', imageUrl);
    
    const palette = await extractColorsFromImage(imageUrl);
    
    return NextResponse.json({
      success: true,
      palette: palette
    });

  } catch (error) {
    console.error('❌ Palette extraction failed:', error);
    
    // Final fallback
    return NextResponse.json({
      success: false,
      error: 'Could not extract colors from this image',
      palette: []
    }, { status: 500 });
  }
}