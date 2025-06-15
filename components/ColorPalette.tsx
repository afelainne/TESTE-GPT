"use client";

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FastAverageColor } from 'fast-average-color';

interface ColorPaletteProps {
  imageUrl: string;
  fallbackColors?: string[];
  className?: string;
}

export function ColorPalette({ imageUrl, fallbackColors = [], className }: ColorPaletteProps) {
  const [colors, setColors] = useState<string[]>(fallbackColors);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [source, setSource] = useState<string>('fallback');
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const extractColors = async () => {
    if (!imageUrl) return;
    
    setIsLoading(true);
    try {
      console.log('🎨 Extracting colors via API from:', imageUrl);
      
      // First try our color-palette API
      const response = await fetch('/api/color-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.colors && data.colors.length > 0) {
          setColors(data.colors);
          setSource('api-extracted');
          console.log('✅ Colors extracted via API:', data.colors);
          return;
        }
      }
      
      // Fallback to fast-average-color
      try {
        const fac = new FastAverageColor();
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const dominantColor = await fac.getColorAsync(img);
        console.log('🎨 Dominant color:', dominantColor.hex);
        
        const palette = generatePaletteFromDominant(dominantColor.hex);
        setColors(palette);
        setSource('fast-average-color');
        console.log('✅ Colors extracted with FastAverageColor:', palette);
        
      } catch (facError) {
        console.error('❌ FastAverageColor failed:', facError);
        // Final fallback
        const generatedColors = generateFallbackPalette(imageUrl);
        setColors(generatedColors);
        setSource('generated');
      }
      
    } catch (error) {
      console.error('❌ All color extraction methods failed:', error);
      const generatedColors = generateFallbackPalette(imageUrl);
      setColors(generatedColors);
      setSource('generated');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePaletteFromDominant = (dominantHex: string): string[] => {
    const palette = [dominantHex];
    
    // Convert hex to HSL for manipulation
    const hsl = hexToHsl(dominantHex);
    
    if (hsl) {
      const [h, s, l] = hsl;
      
      // Generate variations
      palette.push(hslToHex(h, Math.max(10, s - 20), Math.min(90, l + 20))); // Lighter
      palette.push(hslToHex(h, Math.min(100, s + 10), Math.max(10, l - 30))); // Darker
      palette.push(hslToHex((h + 120) % 360, s, l)); // Complementary
      palette.push(hslToHex((h + 180) % 360, Math.max(20, s - 10), l)); // Opposite
    }
    
    return palette.slice(0, 5);
  };

  const generateFallbackPalette = (imageUrl: string): string[] => {
    // Generate based on URL hash for consistency
    const hash = simpleHash(imageUrl);
    const palettes = [
      ['#2D3748', '#4A5568', '#718096', '#A0AEC0', '#E2E8F0'],
      ['#1A202C', '#2D3748', '#4A5568', '#718096', '#A0AEC0'],
      ['#E53E3E', '#FC8181', '#FED7D7', '#FFF5F5', '#FFFAFA'],
      ['#3182CE', '#63B3ED', '#BEE3F8', '#EBF8FF', '#F7FAFC'],
      ['#38A169', '#68D391', '#C6F6D5', '#F0FFF4', '#F7FAFC'],
      ['#D69E2E', '#F6E05E', '#FAF089', '#FFFFF0', '#FFFEF7'],
      ['#805AD5', '#B794F6', '#E9D8FD', '#FAF5FF', '#FEFCFF'],
      ['#E53E3E', '#38A169', '#3182CE', '#D69E2E', '#805AD5'],
    ];
    
    return palettes[hash % palettes.length];
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
      
      toast({
        title: "Color copied",
        description: `${color} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      extractColors();
    }
  }, [imageUrl]);

  if (colors.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs swiss-mono text-swiss-gray-500 tracking-wider">
          COLOR PALETTE
        </div>
        <button
          onClick={extractColors}
          disabled={isLoading}
          className={cn(
            "w-6 h-6 border border-swiss-gray-300 flex items-center justify-center hover:border-swiss-black transition-all",
            isLoading && "animate-spin"
          )}
          title="Refresh color palette"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex gap-1">
        {colors.slice(0, 5).map((color, index) => (
          <div key={index} className="relative group">
            <button
              className="w-8 h-8 border border-swiss-black cursor-pointer swiss-hover relative overflow-hidden"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color)}
              title={`${color} - Click to copy`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {copiedColor === color ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Copy className="w-3 h-3 text-white" />
                )}
              </div>
            </button>
            
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-swiss-black text-white text-xs swiss-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {color}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs swiss-mono text-swiss-gray-400">
        {source === 'fast-average-color' && '🎨 AI Extracted'}
        {source === 'generated' && '🎭 Generated'}
        {source === 'fallback' && '🎨 Default'}
      </div>
    </div>
  );
}

// Helper functions
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function hexToHsl(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}