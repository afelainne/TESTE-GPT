"use client";

// AI-powered color extraction using ColorThief and color analysis
export interface ColorPalette {
  dominant: string;
  palette: string[];
  mood: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';
  contrast: 'high' | 'medium' | 'low';
}

class ColorAI {
  private static instance: ColorAI;
  
  static getInstance(): ColorAI {
    if (!ColorAI.instance) {
      ColorAI.instance = new ColorAI();
    }
    return ColorAI.instance;
  }

  async extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(this.getFallbackPalette());
            return;
          }

          // Resize for performance
          const maxSize = 300;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Extract colors using sampling
          const colors = this.extractDominantColors(data, canvas.width, canvas.height);
          const palette = this.generateHarmonousPalette(colors);
          
          resolve({
            dominant: palette[0],
            palette: palette,
            mood: this.analyzeMood(palette),
            contrast: this.analyzeContrast(palette)
          });
          
        } catch (error) {
          console.warn('Color extraction failed:', error);
          resolve(this.getFallbackPalette());
        }
      };
      
      img.onerror = () => {
        resolve(this.getFallbackPalette());
      };
      
      // Add timestamp to avoid cache issues
      img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    });
  }

  private extractDominantColors(data: Uint8ClampedArray, width: number, height: number): number[][] {
    const colors: { [key: string]: number } = {};
    const step = 4; // Sample every 4th pixel for performance
    
    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent or very dark/light pixels
      if (a < 128 || (r + g + b < 30) || (r + g + b > 720)) continue;
      
      // Quantize colors to reduce noise
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      
      const key = `${qr},${qg},${qb}`;
      colors[key] = (colors[key] || 0) + 1;
    }
    
    // Sort by frequency and get top colors
    return Object.entries(colors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([color]) => color.split(',').map(Number));
  }

  private generateHarmonousPalette(dominantColors: number[][]): string[] {
    if (dominantColors.length === 0) {
      return this.getFallbackPalette().palette;
    }

    const palette: string[] = [];
    
    // 1. Primary color (most dominant)
    palette.push(this.rgbToHex(dominantColors[0]));
    
    // 2. Secondary color (second most dominant or complementary)
    if (dominantColors.length > 1) {
      palette.push(this.rgbToHex(dominantColors[1]));
    } else {
      palette.push(this.getComplementary(dominantColors[0]));
    }
    
    // 3. Accent color (triadic or analogous)
    palette.push(this.getTriadic(dominantColors[0]));
    
    // 4. Light variation
    palette.push(this.getLighterVariation(dominantColors[0]));
    
    // 5. Dark variation  
    palette.push(this.getDarkerVariation(dominantColors[0]));
    
    // 6. Neutral (desaturated version)
    palette.push(this.getDesaturated(dominantColors[0]));
    
    return palette;
  }

  private rgbToHex([r, g, b]: number[]): string {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private getComplementary([r, g, b]: number[]): string {
    return this.rgbToHex([255 - r, 255 - g, 255 - b]);
  }

  private getTriadic([r, g, b]: number[]): string {
    // Convert to HSL, shift hue by 120 degrees, convert back
    const [h, s, l] = this.rgbToHsl(r, g, b);
    const newHue = (h + 120) % 360;
    const [nr, ng, nb] = this.hslToRgb(newHue, s, l);
    return this.rgbToHex([nr, ng, nb]);
  }

  private getLighterVariation([r, g, b]: number[]): string {
    const factor = 0.3;
    return this.rgbToHex([
      Math.min(255, r + (255 - r) * factor),
      Math.min(255, g + (255 - g) * factor),
      Math.min(255, b + (255 - b) * factor)
    ]);
  }

  private getDarkerVariation([r, g, b]: number[]): string {
    const factor = 0.6;
    return this.rgbToHex([r * factor, g * factor, b * factor]);
  }

  private getDesaturated([r, g, b]: number[]): string {
    const gray = (r + g + b) / 3;
    const factor = 0.3;
    return this.rgbToHex([
      r * factor + gray * (1 - factor),
      g * factor + gray * (1 - factor),
      b * factor + gray * (1 - factor)
    ]);
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private analyzeMood(palette: string[]): 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' {
    // Analyze color temperature and saturation
    let warmScore = 0;
    let saturationSum = 0;
    
    palette.forEach(hex => {
      const [r, g, b] = this.hexToRgb(hex);
      const [h, s] = this.rgbToHsl(r, g, b);
      
      // Warm colors: red, orange, yellow (0-60, 300-360)
      if (h <= 60 || h >= 300) warmScore++;
      saturationSum += s;
    });
    
    const avgSaturation = saturationSum / palette.length;
    const warmRatio = warmScore / palette.length;
    
    if (avgSaturation > 0.7) return 'vibrant';
    if (avgSaturation < 0.3) return 'muted';
    if (warmRatio > 0.6) return 'warm';
    if (warmRatio < 0.3) return 'cool';
    return 'neutral';
  }

  private analyzeContrast(palette: string[]): 'high' | 'medium' | 'low' {
    let maxContrast = 0;
    
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        const contrast = this.getContrast(palette[i], palette[j]);
        maxContrast = Math.max(maxContrast, contrast);
      }
    }
    
    if (maxContrast > 7) return 'high';
    if (maxContrast > 3) return 'medium';
    return 'low';
  }

  private getContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance([r, g, b]: number[]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  private getFallbackPalette(): ColorPalette {
    return {
      dominant: '#2563EB',
      palette: ['#2563EB', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#6B7280'],
      mood: 'neutral',
      contrast: 'medium'
    };
  }
}

export const colorAI = ColorAI.getInstance();