// Removed colormind dependency - using direct palette API

// Convert RGB array to hex string
function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
}

// Extract colors using palette API for better results
export async function extractColorsFromImage(imageUrl: string, colorCount: number = 6): Promise<string[]> {
  console.log('🎨 Extracting colors using palette API for:', imageUrl);
  
  try {
    // First try to get base colors from the image using canvas
    const baseColors = await extractBaseColorsFromCanvas(imageUrl, 3);
    
    // Use the new REAL color extraction API
    const response = await fetch(`/api/color-palette?imageUrl=${encodeURIComponent(imageUrl)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.palette && Array.isArray(data.palette)) {
        console.log('✅ REAL colors extracted via API:', data.palette);
        return data.palette.slice(0, colorCount);
      }
    }
    
    // Fallback to base colors
    console.log('✅ Using base extracted colors:', baseColors);
    return baseColors.slice(0, colorCount);
    
  } catch (error) {
    console.warn('⚠️ Palette API failed, using canvas extraction:', error);
    // Fallback to canvas-based extraction
    return extractBaseColorsFromCanvas(imageUrl, colorCount);
  }
}

// Helper function to extract base colors from canvas
async function extractBaseColorsFromCanvas(imageUrl: string, colorCount: number = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to process image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size (smaller for performance)
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract colors using simple color quantization
        const colorMap = new Map<string, number>();
        
        // Sample every pixel for better accuracy on smaller canvas
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 32) * 32; // Quantize to reduce variations
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const alpha = data[i + 3];
          
          // Skip transparent pixels
          if (alpha < 128) continue;
          
          const color = `${r},${g},${b}`;
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
        
        // Sort colors by frequency and get top colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount)
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return rgbToHex([r, g, b]);
          });
        
        console.log('✅ Canvas extracted colors:', sortedColors);
        resolve(sortedColors);
        
      } catch (error) {
        console.error('Error processing image:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      // Return fallback colors
      resolve(['#2C2B2C', '#5A5352', '#A09A92', '#D7CCC8', '#FFFFFF', '#8B7D77']);
    };
    
    img.src = imageUrl;
  });
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

// Hook to extract colors and update inspiration item
export function useColorExtraction() {
  const extractAndUpdateColors = async (imageUrl: string) => {
    try {
      const colors = await extractColorsFromImage(imageUrl, 6);
      return colors;
    } catch (error) {
      console.error('Color extraction failed:', error);
      return ['#2C2B2C', '#5A5352', '#A09A92']; // Fallback colors
    }
  };
  
  return { extractAndUpdateColors };
}