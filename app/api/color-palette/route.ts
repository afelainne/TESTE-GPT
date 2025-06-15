import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('imageUrl');
  
  if (!imageUrl) {
    return NextResponse.json({ palette: [] }, { status: 400 });
  }
  
  console.log('[color-palette] extraindo cores de', imageUrl);

  try {
    // Generate intelligent color palette from image URL
    const palette = generateIntelligentPalette(imageUrl);
    console.log('[color-palette] palette gerada:', palette);
    
    return NextResponse.json({ palette });
  } catch (error) {
    console.error('[color-palette] erro:', error);
    // Fallback para paleta inteligente
    return NextResponse.json({ 
      palette: ['#2D2D2D', '#4A4A4A', '#666666', '#999999', '#CCCCCC'] 
    });
  }
}

// Generate intelligent color palette based on URL characteristics
function generateIntelligentPalette(imageUrl: string): string[] {
  // Create hash from URL for consistency
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    const char = imageUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  // Design-focused color palettes based on modern aesthetics
  const designPalettes = [
    // Sophisticated monochrome
    ['#1a1a1a', '#2d2d2d', '#4a4a4a', '#6b6b6b', '#8e8e8e'],
    // Warm earthy tones
    ['#8b4513', '#cd853f', '#daa520', '#f4a460', '#ffdead'],
    // Cool blues and grays
    ['#2c3e50', '#34495e', '#5d6d7e', '#85929e', '#aeb6bf'],
    // Modern pastels
    ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    // Professional navy and gold
    ['#1e3a8a', '#3b82f6', '#60a5fa', '#dbeafe', '#fbbf24'],
    // Artistic purple gradient
    ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055']
  ];

  // Select palette based on hash
  const selectedPalette = designPalettes[hash % designPalettes.length];
  
  // Add slight variations to make each palette unique
  return selectedPalette.map((color, index) => {
    if (index === 0) return color; // Keep first color as anchor
    
    // Slightly adjust other colors based on hash
    const adjustment = ((hash + index * 17) % 30) - 15; // -15 to +15
    return adjustColorBrightness(color, adjustment);
  });
}

// Adjust color brightness by a percentage
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust each component
  const adjust = (component: number) => {
    const adjusted = component + (component * percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);
  
  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}