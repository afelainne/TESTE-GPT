'use client';

// Lightweight image analysis without TensorFlow for better performance

interface ImageFeatures {
  id: string;
  features: Float32Array;
  imageUrl: string;
}

class LightweightImageAnalyzer {
  private featuresCache = new Map<string, Float32Array>();

  async extractFeatures(imageUrl: string, imageId: string): Promise<Float32Array> {
    console.log('🔍 Extracting lightweight features for:', imageId);

    // Check cache first
    if (this.featuresCache.has(imageId)) {
      console.log('⚡ Using cached features for:', imageId);
      return this.featuresCache.get(imageId)!;
    }

    try {
      const img = await this.loadImage(imageUrl);
      const features = this.extractAdvancedFeatures(img);
      
      // Cache the features
      this.featuresCache.set(imageId, features);
      
      console.log('✅ Features extracted for:', imageId, 'Feature vector size:', features.length);
      return features;
      
    } catch (error) {
      console.error('❌ Feature extraction failed for:', imageId, error);
      
      // Return default feature vector
      return new Float32Array(256).fill(0);
    }
  }

  private async loadImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  private extractAdvancedFeatures(img: HTMLImageElement): Float32Array {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Standard size for consistent feature extraction
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    const features: number[] = [];
    
    // 1. Color histogram (48 features)
    features.push(...this.extractColorHistogram(data));
    
    // 2. Texture analysis (64 features)  
    features.push(...this.extractTextureFeatures(data, size));
    
    // 3. Edge detection (32 features)
    features.push(...this.extractEdgeFeatures(data, size));
    
    // 4. Spatial distribution (32 features)
    features.push(...this.extractSpatialFeatures(data, size));
    
    // 5. Color moments (24 features)
    features.push(...this.extractColorMoments(data));
    
    // 6. Gradient orientation (48 features)
    features.push(...this.extractGradientHistogram(data, size));
    
    // 7. Local statistics (8 features)
    features.push(...this.extractGlobalStatistics(data));
    
    return new Float32Array(features.slice(0, 256)); // Ensure consistent size
  }

  private extractColorHistogram(data: Uint8ClampedArray): number[] {
    const rHist: number[] = new Array(16).fill(0);
    const gHist: number[] = new Array(16).fill(0);
    const bHist: number[] = new Array(16).fill(0);
    
    for (let i = 0; i < data.length; i += 4) {
      rHist[Math.floor(data[i] / 16)]++;
      gHist[Math.floor(data[i + 1] / 16)]++;
      bHist[Math.floor(data[i + 2] / 16)]++;
    }
    
    const totalPixels = data.length / 4;
    return [...rHist, ...gHist, ...bHist].map(count => count / totalPixels);
  }

  private extractTextureFeatures(data: Uint8ClampedArray, size: number): number[] {
    const features: number[] = [];
    
    // Local Binary Pattern inspired features
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const centerIdx = (y * size + x) * 4;
        const center = data[centerIdx];
        
        let pattern = 0;
        const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let i = 0; i < neighbors.length; i++) {
          const [dy, dx] = neighbors[i];
          const nIdx = ((y + dy) * size + (x + dx)) * 4;
          if (data[nIdx] >= center) {
            pattern |= (1 << i);
          }
        }
        
        features.push(pattern / 255);
        if (features.length >= 64) break;
      }
      if (features.length >= 64) break;
    }
    
    return features.slice(0, 64);
  }

  private extractEdgeFeatures(data: Uint8ClampedArray, size: number): number[] {
    const features: number[] = [];
    
    // Sobel edge detection
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        let gx = 0, gy = 0;
        
        // Sobel X kernel
        gx += data[((y-1) * size + (x-1)) * 4] * -1;
        gx += data[((y-1) * size + (x+1)) * 4] * 1;
        gx += data[(y * size + (x-1)) * 4] * -2;
        gx += data[(y * size + (x+1)) * 4] * 2;
        gx += data[((y+1) * size + (x-1)) * 4] * -1;
        gx += data[((y+1) * size + (x+1)) * 4] * 1;
        
        // Sobel Y kernel  
        gy += data[((y-1) * size + (x-1)) * 4] * -1;
        gy += data[((y-1) * size + x) * 4] * -2;
        gy += data[((y-1) * size + (x+1)) * 4] * -1;
        gy += data[((y+1) * size + (x-1)) * 4] * 1;
        gy += data[((y+1) * size + x) * 4] * 2;
        gy += data[((y+1) * size + (x+1)) * 4] * 1;
        
        const magnitude = Math.sqrt(gx * gx + gy * gy) / 255;
        features.push(magnitude);
        
        if (features.length >= 32) break;
      }
      if (features.length >= 32) break;
    }
    
    return features.slice(0, 32);
  }

  private extractSpatialFeatures(data: Uint8ClampedArray, size: number): number[] {
    const features: number[] = [];
    const gridSize = 4; // 4x4 grid
    const cellSize = size / gridSize;
    
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        
        for (let y = gy * cellSize; y < (gy + 1) * cellSize; y++) {
          for (let x = gx * cellSize; x < (gx + 1) * cellSize; x++) {
            const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
            if (idx < data.length) {
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }
        }
        
        if (count > 0) {
          features.push(rSum / count / 255);
          features.push(gSum / count / 255);
        }
      }
    }
    
    return features.slice(0, 32);
  }

  private extractColorMoments(data: Uint8ClampedArray): number[] {
    const features: number[] = [];
    const channels = [[], [], []] as number[][];
    
    // Collect channel values
    for (let i = 0; i < data.length; i += 4) {
      channels[0].push(data[i] / 255);
      channels[1].push(data[i + 1] / 255);
      channels[2].push(data[i + 2] / 255);
    }
    
    // Calculate moments for each channel
    for (const channel of channels) {
      const mean = channel.reduce((a, b) => a + b) / channel.length;
      const variance = channel.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / channel.length;
      const skewness = channel.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / channel.length;
      const kurtosis = channel.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / channel.length;
      
      features.push(mean, Math.sqrt(variance), skewness, kurtosis);
    }
    
    return features.slice(0, 24);
  }

  private extractGradientHistogram(data: Uint8ClampedArray, size: number): number[] {
    const histogram: number[] = new Array(8).fill(0); // 8 orientation bins
    
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = (y * size + x) * 4;
        const rightIdx = (y * size + (x + 1)) * 4;
        const downIdx = ((y + 1) * size + x) * 4;
        
        const gx = data[rightIdx] - data[idx];
        const gy = data[downIdx] - data[idx];
        
        const angle = Math.atan2(gy, gx);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        // Convert angle to bin index (0-7)
        const binIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 8) % 8;
        histogram[binIndex] += magnitude;
      }
    }
    
    const total = histogram.reduce((a, b) => a + b, 0);
    const normalized = total > 0 ? histogram.map(h => h / total) : histogram;
    
    // Replicate to create 48 features
    return [...normalized, ...normalized, ...normalized, ...normalized, ...normalized, ...normalized];
  }

  private extractGlobalStatistics(data: Uint8ClampedArray): number[] {
    const values: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }
    
    values.sort((a, b) => a - b);
    
    const min = values[0] / 255;
    const max = values[values.length - 1] / 255;
    const q1 = values[Math.floor(values.length * 0.25)] / 255;
    const median = values[Math.floor(values.length * 0.5)] / 255;
    const q3 = values[Math.floor(values.length * 0.75)] / 255;
    const mean = values.reduce((a, b) => a + b, 0) / values.length / 255;
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean * 255, 2), 0) / values.length) / 255;
    const range = (max - min);
    
    return [min, max, q1, median, q3, mean, std, range];
  }

  calculateCosineSimilarity(features1: Float32Array, features2: Float32Array): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < Math.min(features1.length, features2.length); i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity));
  }

  async findVisualSimilarities(
    targetImageUrl: string,
    targetImageId: string,
    candidateImages: Array<{id: string, imageUrl: string}>,
    limit: number = 6
  ): Promise<Array<{id: string, similarity: number}>> {
    console.log('🎯 Starting lightweight visual similarity analysis...');
    
    // Extract features for target
    const targetFeatures = await this.extractFeatures(targetImageUrl, targetImageId);
    
    // Calculate similarities with all candidates
    const similarities: Array<{id: string, similarity: number}> = [];
    
    for (const candidate of candidateImages) {
      if (candidate.id === targetImageId) continue;
      
      try {
        const candidateFeatures = await this.extractFeatures(candidate.imageUrl, candidate.id);
        const similarity = this.calculateCosineSimilarity(targetFeatures, candidateFeatures);
        
        similarities.push({ id: candidate.id, similarity });
        console.log(`🔍 Similarity ${targetImageId} ↔ ${candidate.id}: ${(similarity * 100).toFixed(1)}%`);
      } catch (error) {
        console.error('❌ Similarity calculation failed:', candidate.id, error);
      }
    }
    
    // Sort by similarity and return top matches
    const topSimilar = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    console.log('✅ Top visual similarities found:', topSimilar.map(s => `${s.id}: ${(s.similarity * 100).toFixed(1)}%`));
    
    return topSimilar;
  }
}

// Export singleton instance
export const lightweightImageAnalyzer = new LightweightImageAnalyzer();

// Hook for component usage
export function useImageSimilarity() {
  const findSimilar = async (
    targetImageUrl: string,
    targetImageId: string,
    allImages: Array<{id: string, imageUrl: string}>,
    limit?: number
  ) => {
    return lightweightImageAnalyzer.findVisualSimilarities(
      targetImageUrl,
      targetImageId,
      allImages,
      limit
    );
  };

  return { findSimilar };
}