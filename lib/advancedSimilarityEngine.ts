'use client';

import { InspirationItem } from '@/types/inspiration';

// Advanced Multi-Dimensional Similarity Engine
// Inspired by Pinterest's recommendation algorithm

interface SimilarityFactors {
  visual: number;
  color: number;
  content: number;
  style: number;
  semantic: number;
  contextual: number;
}

interface SimilarityMatch {
  item: InspirationItem;
  score: number;
  factors: SimilarityFactors;
  matchType: 'visual' | 'thematic' | 'color' | 'style' | 'semantic' | 'mixed';
}

export class AdvancedSimilarityEngine {
  private imageFeatureCache = new Map<string, ImageFeatures>();
  private colorCache = new Map<string, ColorPalette>();
  private semanticCache = new Map<string, SemanticFeatures>();

  // Pinterest-like similarity analysis
  async findSimilarItems(
    targetItem: InspirationItem, 
    candidateItems: InspirationItem[], 
    options: {
      limit?: number;
      emphasize?: keyof SimilarityFactors;
      minScore?: number;
      diversify?: boolean;
    } = {}
  ): Promise<SimilarityMatch[]> {
    const { limit = 12, emphasize, minScore = 0.3, diversify = true } = options;

    console.log('🎯 Advanced similarity analysis starting for:', targetItem.id);
    console.log('🔍 Analyzing', candidateItems.length, 'candidates');

    const matches: SimilarityMatch[] = [];

    // Extract features for target item
    const targetFeatures = await this.extractAllFeatures(targetItem);

    for (const candidate of candidateItems) {
      if (candidate.id === targetItem.id) continue;

      try {
        const candidateFeatures = await this.extractAllFeatures(candidate);
        const similarity = this.calculateMultiDimensionalSimilarity(
          targetFeatures, 
          candidateFeatures, 
          emphasize
        );

        if (similarity.score >= minScore) {
          matches.push({
            item: candidate,
            score: similarity.score,
            factors: similarity.factors,
            matchType: similarity.primaryMatchType
          });
        }
      } catch (error) {
        console.error('❌ Similarity calculation failed for:', candidate.id, error);
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    // Diversify results if requested (Pinterest-style variety)
    const finalMatches = diversify 
      ? this.diversifyResults(matches, limit)
      : matches.slice(0, limit);

    console.log('✅ Found', finalMatches.length, 'similar items');
    console.log('📊 Match types:', this.analyzeMatchTypes(finalMatches));

    return finalMatches;
  }

  private async extractAllFeatures(item: InspirationItem): Promise<AllFeatures> {
    const cacheKey = item.id;
    
    return {
      image: await this.extractImageFeatures(item.imageUrl, cacheKey),
      color: await this.extractColorFeatures(item.imageUrl, item.colors, cacheKey),
      semantic: this.extractSemanticFeatures(item),
      content: this.extractContentFeatures(item),
      style: this.extractStyleFeatures(item),
      contextual: this.extractContextualFeatures(item)
    };
  }

  private async extractImageFeatures(imageUrl: string, cacheKey: string): Promise<ImageFeatures> {
    if (this.imageFeatureCache.has(cacheKey)) {
      return this.imageFeatureCache.get(cacheKey)!;
    }

    try {
      const features = await this.analyzeImageVisualFeatures(imageUrl);
      this.imageFeatureCache.set(cacheKey, features);
      return features;
    } catch (error) {
      console.error('Image feature extraction failed:', error);
      return this.getDefaultImageFeatures();
    }
  }

  private async analyzeImageVisualFeatures(imageUrl: string): Promise<ImageFeatures> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Standard analysis size
        const size = 224;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        
        const imageData = ctx.getImageData(0, 0, size, size);
        
        resolve({
          brightness: this.calculateBrightness(imageData),
          contrast: this.calculateContrast(imageData),
          saturation: this.calculateSaturation(imageData),
          edgeDensity: this.calculateEdgeDensity(imageData),
          textureComplexity: this.calculateTextureComplexity(imageData),
          composition: this.analyzeComposition(imageData),
          dominantShapes: this.detectShapes(imageData),
          spatialDistribution: this.analyzeSpatialDistribution(imageData)
        });
      };
      
      img.onerror = () => resolve(this.getDefaultImageFeatures());
      img.src = imageUrl;
    });
  }

  private async extractColorFeatures(imageUrl: string, providedColors: string[], cacheKey: string): Promise<ColorPalette> {
    if (this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }

    try {
      const colorFeatures = await this.analyzeColorPalette(imageUrl, providedColors);
      this.colorCache.set(cacheKey, colorFeatures);
      return colorFeatures;
    } catch (error) {
      console.error('Color feature extraction failed:', error);
      return this.getDefaultColorFeatures(providedColors);
    }
  }

  private async analyzeColorPalette(imageUrl: string, providedColors: string[]): Promise<ColorPalette> {
    // Use provided colors as base, enhance with analysis
    const palette = {
      dominantColors: providedColors.slice(0, 5),
      colorHarmony: this.analyzeColorHarmony(providedColors),
      temperature: this.calculateColorTemperature(providedColors),
      vibrancy: this.calculateVibrancy(providedColors),
      colorDistribution: this.analyzeColorDistribution(providedColors),
      contrastLevel: this.calculatePaletteContrast(providedColors)
    };

    return palette;
  }

  private extractSemanticFeatures(item: InspirationItem): SemanticFeatures {
    const cacheKey = item.id;
    
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey)!;
    }

    const features = {
      tags: item.tags.map(tag => tag.toLowerCase()),
      category: item.category,
      concepts: this.extractConcepts(item),
      themes: this.extractThemes(item),
      keywords: this.extractKeywords(item),
      intentAnalysis: this.analyzeIntent(item)
    };

    this.semanticCache.set(cacheKey, features);
    return features;
  }

  private extractContentFeatures(item: InspirationItem): ContentFeatures {
    return {
      titleSentiment: this.analyzeSentiment(item.title),
      descriptionLength: item.description?.length || 0,
      tagDensity: item.tags.length,
      authorStyle: this.analyzeAuthorStyle(item.author),
      contentType: this.classifyContentType(item),
      complexity: this.assessComplexity(item)
    };
  }

  private extractStyleFeatures(item: InspirationItem): StyleFeatures {
    const style = item.visualStyle;
    
    return {
      composition: style.composition,
      colorTone: style.colorTone,
      shapes: style.shapes,
      mood: style.mood,
      designApproach: this.classifyDesignApproach(item),
      aestheticStyle: this.classifyAestheticStyle(item)
    };
  }

  private extractContextualFeatures(item: InspirationItem): ContextualFeatures {
    return {
      platform: this.detectPlatform(item.imageUrl),
      engagement: {
        likes: item.likes,
        saves: 0, // Could be extracted if available
        views: 0   // Could be extracted if available
      },
      temporal: {
        createdAt: new Date(item.createdAt),
        recency: this.calculateRecency(item.createdAt)
      },
      popularity: this.calculatePopularity(item)
    };
  }

  private calculateMultiDimensionalSimilarity(
    target: AllFeatures, 
    candidate: AllFeatures,
    emphasize?: keyof SimilarityFactors
  ): { score: number; factors: SimilarityFactors; primaryMatchType: SimilarityMatch['matchType'] } {
    
    const factors: SimilarityFactors = {
      visual: this.calculateVisualSimilarity(target.image, candidate.image),
      color: this.calculateColorSimilarity(target.color, candidate.color),
      content: this.calculateContentSimilarity(target.content, candidate.content),
      style: this.calculateStyleSimilarity(target.style, candidate.style),
      semantic: this.calculateSemanticSimilarity(target.semantic, candidate.semantic),
      contextual: this.calculateContextualSimilarity(target.contextual, candidate.contextual)
    };

    // Dynamic weighting based on emphasis or automatic best match
    let weights = {
      visual: 0.25,
      color: 0.20,
      semantic: 0.20,
      style: 0.15,
      content: 0.12,
      contextual: 0.08
    };

    if (emphasize) {
      // Boost emphasized factor
      weights[emphasize] = Math.min(0.4, weights[emphasize] + 0.15);
      
      // Redistribute remaining weight
      const remaining = 1.0 - weights[emphasize];
      const otherFactors = Object.keys(weights).filter(k => k !== emphasize) as (keyof SimilarityFactors)[];
      const redistributed = remaining / otherFactors.length;
      
      otherFactors.forEach(factor => {
        weights[factor] = redistributed;
      });
    }

    // Calculate weighted score
    const score = Object.entries(factors).reduce((total, [factor, value]) => {
      return total + (value * weights[factor as keyof SimilarityFactors]);
    }, 0);

    // Determine primary match type
    const sortedFactors = Object.entries(factors)
      .sort(([,a], [,b]) => b - a);
    
    const primaryMatchType = this.mapFactorToMatchType(sortedFactors[0][0] as keyof SimilarityFactors);

    return { score, factors, primaryMatchType };
  }

  private diversifyResults(matches: SimilarityMatch[], limit: number): SimilarityMatch[] {
    const diversified: SimilarityMatch[] = [];
    const typeGroups = new Map<string, SimilarityMatch[]>();

    // Group by match type
    matches.forEach(match => {
      if (!typeGroups.has(match.matchType)) {
        typeGroups.set(match.matchType, []);
      }
      typeGroups.get(match.matchType)!.push(match);
    });

    // Take best from each type, then fill remaining
    const types = Array.from(typeGroups.keys());
    let currentTypeIndex = 0;

    while (diversified.length < limit && matches.length > 0) {
      const currentType = types[currentTypeIndex % types.length];
      const group = typeGroups.get(currentType);
      
      if (group && group.length > 0) {
        const best = group.shift()!;
        diversified.push(best);
        
        // Remove from original matches
        const index = matches.findIndex(m => m.item.id === best.item.id);
        if (index > -1) matches.splice(index, 1);
      }
      
      currentTypeIndex++;
      
      // Safety check
      if (types.every(type => !typeGroups.get(type) || typeGroups.get(type)!.length === 0)) {
        break;
      }
    }

    return diversified;
  }

  // Helper calculation methods (simplified implementations)
  private calculateBrightness(imageData: ImageData): number {
    let total = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      total += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    return total / (imageData.data.length / 4) / 255;
  }

  private calculateContrast(imageData: ImageData): number {
    const pixels: number[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      pixels.push((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
    }
    
    const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
    const variance = pixels.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / pixels.length;
    
    return Math.sqrt(variance) / 255;
  }

  private calculateSaturation(imageData: ImageData): number {
    let totalSaturation = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i] / 255;
      const g = imageData.data[i + 1] / 255;
      const b = imageData.data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      totalSaturation += saturation;
    }
    return totalSaturation / (imageData.data.length / 4);
  }

  private calculateEdgeDensity(imageData: ImageData): number {
    // Simplified edge detection
    let edgeCount = 0;
    const width = imageData.width;
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = this.getPixelBrightness(imageData, x, y);
        const right = this.getPixelBrightness(imageData, x + 1, y);
        const down = this.getPixelBrightness(imageData, x, y + 1);
        
        const gradientMagnitude = Math.sqrt(
          Math.pow(right - center, 2) + Math.pow(down - center, 2)
        );
        
        if (gradientMagnitude > 0.1) edgeCount++;
      }
    }
    
    return edgeCount / ((imageData.width - 2) * (imageData.height - 2));
  }

  private calculateTextureComplexity(imageData: ImageData): number {
    // Local Binary Pattern inspired complexity measure
    let complexity = 0;
    const width = imageData.width;
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = this.getPixelBrightness(imageData, x, y);
        let pattern = 0;
        
        const neighbors = [
          [x-1, y-1], [x, y-1], [x+1, y-1],
          [x-1, y],             [x+1, y],
          [x-1, y+1], [x, y+1], [x+1, y+1]
        ];
        
        neighbors.forEach(([nx, ny], i) => {
          if (this.getPixelBrightness(imageData, nx, ny) >= center) {
            pattern |= (1 << i);
          }
        });
        
        complexity += this.countBits(pattern);
      }
    }
    
    return complexity / ((imageData.width - 2) * (imageData.height - 2) * 8);
  }

  private getPixelBrightness(imageData: ImageData, x: number, y: number): number {
    const index = (y * imageData.width + x) * 4;
    return (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / (3 * 255);
  }

  private countBits(n: number): number {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }

  // Placeholder implementations for complex methods
  private analyzeComposition(imageData: ImageData): string {
    // Simplified composition analysis
    const centerWeight = this.calculateCenterWeight(imageData);
    return centerWeight > 0.6 ? 'centered' : centerWeight < 0.4 ? 'rule-of-thirds' : 'balanced';
  }

  private calculateCenterWeight(imageData: ImageData): number {
    // Calculate how much visual weight is in the center third
    const width = imageData.width;
    const height = imageData.height;
    let centerWeight = 0;
    let totalWeight = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const brightness = this.getPixelBrightness(imageData, x, y);
        totalWeight += brightness;
        
        if (x >= width/3 && x <= 2*width/3 && y >= height/3 && y <= 2*height/3) {
          centerWeight += brightness;
        }
      }
    }
    
    return totalWeight > 0 ? centerWeight / totalWeight : 0;
  }

  private detectShapes(imageData: ImageData): string[] {
    // Simplified shape detection
    const edgeDensity = this.calculateEdgeDensity(imageData);
    const shapes: string[] = [];
    
    if (edgeDensity > 0.3) shapes.push('geometric');
    if (edgeDensity < 0.1) shapes.push('organic');
    if (edgeDensity > 0.2 && edgeDensity < 0.4) shapes.push('mixed');
    
    return shapes;
  }

  private analyzeSpatialDistribution(imageData: ImageData): { balance: number; focus: string } {
    // Analyze how visual elements are distributed
    const quadrants = this.analyzeQuadrants(imageData);
    const balance = this.calculateBalance(quadrants);
    const focus = this.determineFocus(quadrants);
    
    return { balance, focus };
  }

  private analyzeQuadrants(imageData: ImageData): number[] {
    const width = imageData.width;
    const height = imageData.height;
    const quadrants = [0, 0, 0, 0]; // TL, TR, BL, BR
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const brightness = this.getPixelBrightness(imageData, x, y);
        
        if (x < width/2 && y < height/2) quadrants[0] += brightness; // TL
        else if (x >= width/2 && y < height/2) quadrants[1] += brightness; // TR
        else if (x < width/2 && y >= height/2) quadrants[2] += brightness; // BL
        else quadrants[3] += brightness; // BR
      }
    }
    
    return quadrants;
  }

  private calculateBalance(quadrants: number[]): number {
    const total = quadrants.reduce((a, b) => a + b, 0);
    if (total === 0) return 1;
    
    const normalized = quadrants.map(q => q / total);
    const ideal = 0.25; // Perfect balance
    const deviation = normalized.reduce((acc, val) => acc + Math.abs(val - ideal), 0);
    
    return Math.max(0, 1 - deviation);
  }

  private determineFocus(quadrants: number[]): string {
    const maxIndex = quadrants.indexOf(Math.max(...quadrants));
    const focuses = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    return focuses[maxIndex];
  }

  // Color analysis methods
  private analyzeColorHarmony(colors: string[]): string {
    // Simplified color harmony analysis
    if (colors.length < 2) return 'monochromatic';
    
    const hues = colors.map(color => this.getHue(color)).filter(h => h !== null);
    if (hues.length < 2) return 'monochromatic';
    
    const hueSpread = Math.max(...hues) - Math.min(...hues);
    
    if (hueSpread < 30) return 'monochromatic';
    if (hueSpread < 60) return 'analogous';
    if (hueSpread > 150) return 'complementary';
    return 'triadic';
  }

  private getHue(hexColor: string): number | null {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return null;
    
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    if (delta === 0) return 0;
    
    let hue = 0;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    
    return (hue * 60 + 360) % 360;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private calculateColorTemperature(colors: string[]): number {
    let warmth = 0;
    for (const color of colors) {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        // Simplified temperature calculation
        warmth += (rgb.r + rgb.g * 0.5 - rgb.b * 0.5) / 255;
      }
    }
    return colors.length > 0 ? warmth / colors.length : 0;
  }

  private calculateVibrancy(colors: string[]): number {
    let totalVibrancy = 0;
    for (const color of colors) {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        const max = Math.max(rgb.r, rgb.g, rgb.b);
        const min = Math.min(rgb.r, rgb.g, rgb.b);
        const vibrancy = max === 0 ? 0 : (max - min) / max;
        totalVibrancy += vibrancy;
      }
    }
    return colors.length > 0 ? totalVibrancy / colors.length : 0;
  }

  private analyzeColorDistribution(colors: string[]): { spread: number; dominance: number } {
    // Simplified distribution analysis
    const hues = colors.map(color => this.getHue(color)).filter(h => h !== null);
    
    if (hues.length < 2) return { spread: 0, dominance: 1 };
    
    const spread = (Math.max(...hues) - Math.min(...hues)) / 360;
    const dominance = this.calculateHueDominance(hues);
    
    return { spread, dominance };
  }

  private calculateHueDominance(hues: number[]): number {
    // Check if one hue family dominates
    const buckets = new Array(12).fill(0); // 12 hue buckets (30° each)
    
    hues.forEach(hue => {
      const bucket = Math.floor(hue / 30);
      buckets[bucket]++;
    });
    
    const maxCount = Math.max(...buckets);
    return maxCount / hues.length;
  }

  private calculatePaletteContrast(colors: string[]): number {
    if (colors.length < 2) return 0;
    
    let totalContrast = 0;
    let comparisons = 0;
    
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrast = this.calculateColorContrast(colors[i], colors[j]);
        totalContrast += contrast;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalContrast / comparisons : 0;
  }

  private calculateColorContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Semantic analysis methods
  private extractConcepts(item: InspirationItem): string[] {
    const concepts: string[] = [];
    const text = `${item.title} ${item.description || ''} ${item.tags.join(' ')}`.toLowerCase();
    
    // Design concept mapping
    const conceptMap = {
      'minimalism': ['minimal', 'clean', 'simple', 'less'],
      'maximalism': ['bold', 'complex', 'rich', 'detailed'],
      'modernism': ['modern', 'contemporary', 'current'],
      'retro': ['vintage', 'retro', 'classic', 'old'],
      'organic': ['natural', 'organic', 'flowing', 'curved'],
      'geometric': ['geometric', 'angular', 'sharp', 'structured']
    };
    
    Object.entries(conceptMap).forEach(([concept, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        concepts.push(concept);
      }
    });
    
    return concepts;
  }

  private extractThemes(item: InspirationItem): string[] {
    const themes: string[] = [];
    const category = item.category;
    const tags = item.tags.map(t => t.toLowerCase());
    
    // Theme detection based on category and tags
    if (category === 'branding' || tags.some(t => ['brand', 'logo', 'identity'].includes(t))) {
      themes.push('corporate-identity');
    }
    
    if (category === 'ui-design' || tags.some(t => ['app', 'interface', 'ux'].includes(t))) {
      themes.push('digital-interface');
    }
    
    if (tags.some(t => ['eco', 'green', 'sustainable', 'nature'].includes(t))) {
      themes.push('sustainability');
    }
    
    if (tags.some(t => ['tech', 'digital', 'cyber', 'future'].includes(t))) {
      themes.push('technology');
    }
    
    return themes;
  }

  private extractKeywords(item: InspirationItem): string[] {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 3);
    
    // Remove common words
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    
    return words.filter(word => !stopWords.includes(word));
  }

  private analyzeIntent(item: InspirationItem): string {
    const tags = item.tags.map(t => t.toLowerCase());
    const title = item.title.toLowerCase();
    
    if (tags.some(t => ['inspiration', 'reference', 'example'].includes(t))) return 'inspiration';
    if (tags.some(t => ['tutorial', 'guide', 'how-to'].includes(t))) return 'educational';
    if (tags.some(t => ['showcase', 'portfolio', 'work'].includes(t))) return 'showcase';
    if (title.includes('concept') || tags.includes('concept')) return 'conceptual';
    
    return 'general';
  }

  // Content analysis methods
  private analyzeSentiment(text: string): number {
    const positiveWords = ['beautiful', 'amazing', 'great', 'awesome', 'wonderful', 'excellent', 'perfect', 'love', 'best', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'ugly', 'poor', 'disappointing'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / Math.max(1, words.length)));
  }

  private analyzeAuthorStyle(author: string): string {
    // Simplified author style classification
    if (author.toLowerCase().includes('studio')) return 'agency';
    if (author.toLowerCase().includes('design')) return 'designer';
    if (author.toLowerCase().includes('art')) return 'artist';
    return 'individual';
  }

  private classifyContentType(item: InspirationItem): string {
    const tags = item.tags.map(t => t.toLowerCase());
    
    if (tags.some(t => ['photo', 'photography', 'image'].includes(t))) return 'photography';
    if (tags.some(t => ['illustration', 'art', 'drawing'].includes(t))) return 'illustration';
    if (tags.some(t => ['ui', 'interface', 'app', 'website'].includes(t))) return 'digital-design';
    if (tags.some(t => ['logo', 'brand', 'identity'].includes(t))) return 'branding';
    
    return 'general-design';
  }

  private assessComplexity(item: InspirationItem): number {
    let complexity = 0;
    
    // Tag complexity
    complexity += Math.min(1, item.tags.length / 10);
    
    // Color complexity
    complexity += Math.min(1, item.colors.length / 8);
    
    // Text complexity
    const textLength = (item.title + (item.description || '')).length;
    complexity += Math.min(1, textLength / 200);
    
    return complexity / 3;
  }

  // Style analysis methods
  private classifyDesignApproach(item: InspirationItem): string {
    const tags = item.tags.map(t => t.toLowerCase());
    
    if (tags.some(t => ['minimal', 'clean', 'simple'].includes(t))) return 'minimalist';
    if (tags.some(t => ['bold', 'experimental', 'creative'].includes(t))) return 'experimental';
    if (tags.some(t => ['corporate', 'business', 'professional'].includes(t))) return 'corporate';
    if (tags.some(t => ['artistic', 'creative', 'expressive'].includes(t))) return 'artistic';
    
    return 'balanced';
  }

  private classifyAestheticStyle(item: InspirationItem): string {
    const tags = item.tags.map(t => t.toLowerCase());
    const style = item.visualStyle;
    
    // Check mood and color tone compatibility
    if ((['elegant', 'serious'] as any[]).includes(style.mood) && (['monochrome', 'muted'] as any[]).includes(style.colorTone)) return 'serene';
    if ((['bold', 'playful'] as any[]).includes(style.mood) && (['vibrant', 'high-contrast'] as any[]).includes(style.colorTone)) return 'vibrant';
    if (style.shapes === 'geometric' && tags.includes('minimal')) return 'geometric-minimal';
    if (style.shapes === 'organic' && (['elegant', 'serious'] as any[]).includes(style.mood)) return 'organic-natural';
    
    return 'contemporary';
  }

  // Contextual analysis methods
  private detectPlatform(imageUrl: string): string {
    if (imageUrl.includes('pinterest')) return 'pinterest';
    if (imageUrl.includes('are.na')) return 'arena';
    if (imageUrl.includes('behance')) return 'behance';
    return 'external';
  }

  private calculateRecency(createdAt: string): number {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    
    // Recency score: 1.0 for today, decreasing over time
    return Math.max(0, 1 - daysDiff / 365);
  }

  private calculatePopularity(item: InspirationItem): number {
    // Simplified popularity based on likes
    return Math.min(1, Math.log(item.likes + 1) / Math.log(1000));
  }

  // Similarity calculation methods
  private calculateVisualSimilarity(target: ImageFeatures, candidate: ImageFeatures): number {
    let score = 0;
    
    // Brightness similarity
    score += 1 - Math.abs(target.brightness - candidate.brightness);
    
    // Contrast similarity
    score += 1 - Math.abs(target.contrast - candidate.contrast);
    
    // Saturation similarity
    score += 1 - Math.abs(target.saturation - candidate.saturation);
    
    // Edge density similarity
    score += 1 - Math.abs(target.edgeDensity - candidate.edgeDensity);
    
    // Texture complexity similarity
    score += 1 - Math.abs(target.textureComplexity - candidate.textureComplexity);
    
    // Composition similarity
    score += target.composition === candidate.composition ? 1 : 0;
    
    // Shape similarity
    const shapeOverlap = target.dominantShapes.filter(shape => 
      candidate.dominantShapes.includes(shape)
    ).length;
    score += shapeOverlap / Math.max(target.dominantShapes.length, candidate.dominantShapes.length, 1);
    
    return score / 7;
  }

  private calculateColorSimilarity(target: ColorPalette, candidate: ColorPalette): number {
    let score = 0;
    
    // Color harmony similarity
    score += target.colorHarmony === candidate.colorHarmony ? 1 : 0.5;
    
    // Temperature similarity
    score += 1 - Math.abs(target.temperature - candidate.temperature);
    
    // Vibrancy similarity
    score += 1 - Math.abs(target.vibrancy - candidate.vibrancy);
    
    // Contrast similarity
    score += 1 - Math.abs(target.contrastLevel - candidate.contrastLevel) / 20; // Normalize contrast ratio
    
    return score / 4;
  }

  private calculateSemanticSimilarity(target: SemanticFeatures, candidate: SemanticFeatures): number {
    let score = 0;
    
    // Category match
    score += target.category === candidate.category ? 1 : 0;
    
    // Tag overlap
    const tagOverlap = target.tags.filter(tag => candidate.tags.includes(tag)).length;
    const maxTags = Math.max(target.tags.length, candidate.tags.length, 1);
    score += tagOverlap / maxTags;
    
    // Concept overlap
    const conceptOverlap = target.concepts.filter(concept => candidate.concepts.includes(concept)).length;
    const maxConcepts = Math.max(target.concepts.length, candidate.concepts.length, 1);
    score += conceptOverlap / maxConcepts;
    
    // Theme overlap
    const themeOverlap = target.themes.filter(theme => candidate.themes.includes(theme)).length;
    const maxThemes = Math.max(target.themes.length, candidate.themes.length, 1);
    score += themeOverlap / maxThemes;
    
    // Intent similarity
    score += target.intentAnalysis === candidate.intentAnalysis ? 1 : 0;
    
    return score / 5;
  }

  private calculateStyleSimilarity(target: StyleFeatures, candidate: StyleFeatures): number {
    let score = 0;
    
    score += target.composition === candidate.composition ? 1 : 0;
    score += target.colorTone === candidate.colorTone ? 1 : 0;
    score += target.shapes === candidate.shapes ? 1 : 0;
    score += target.mood === candidate.mood ? 1 : 0;
    score += target.designApproach === candidate.designApproach ? 1 : 0;
    score += target.aestheticStyle === candidate.aestheticStyle ? 1 : 0;
    
    return score / 6;
  }

  private calculateContentSimilarity(target: ContentFeatures, candidate: ContentFeatures): number {
    let score = 0;
    
    // Sentiment similarity
    score += 1 - Math.abs(target.titleSentiment - candidate.titleSentiment);
    
    // Complexity similarity
    score += 1 - Math.abs(target.complexity - candidate.complexity);
    
    // Content type similarity
    score += target.contentType === candidate.contentType ? 1 : 0.5;
    
    // Author style similarity
    score += target.authorStyle === candidate.authorStyle ? 1 : 0.5;
    
    return score / 4;
  }

  private calculateContextualSimilarity(target: ContextualFeatures, candidate: ContextualFeatures): number {
    let score = 0;
    
    // Platform similarity
    score += target.platform === candidate.platform ? 1 : 0.5;
    
    // Popularity similarity
    score += 1 - Math.abs(target.popularity - candidate.popularity);
    
    // Recency similarity
    score += 1 - Math.abs(target.temporal.recency - candidate.temporal.recency);
    
    return score / 3;
  }

  // Utility methods
  private mapFactorToMatchType(factor: keyof SimilarityFactors): SimilarityMatch['matchType'] {
    const mapping = {
      visual: 'visual' as const,
      color: 'color' as const,
      semantic: 'semantic' as const,
      style: 'style' as const,
      content: 'thematic' as const,
      contextual: 'mixed' as const
    };
    
    return mapping[factor];
  }

  private analyzeMatchTypes(matches: SimilarityMatch[]): Record<string, number> {
    const types = matches.reduce((acc, match) => {
      acc[match.matchType] = (acc[match.matchType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return types;
  }

  // Default feature generators
  private getDefaultImageFeatures(): ImageFeatures {
    return {
      brightness: 0.5,
      contrast: 0.5,
      saturation: 0.5,
      edgeDensity: 0.3,
      textureComplexity: 0.4,
      composition: 'balanced',
      dominantShapes: ['mixed'],
      spatialDistribution: { balance: 0.5, focus: 'center' }
    };
  }

  private getDefaultColorFeatures(colors: string[]): ColorPalette {
    return {
      dominantColors: colors.slice(0, 5),
      colorHarmony: 'monochromatic',
      temperature: 0.5,
      vibrancy: 0.5,
      colorDistribution: { spread: 0.3, dominance: 0.7 },
      contrastLevel: 3
    };
  }
}

// Type definitions
interface ImageFeatures {
  brightness: number;
  contrast: number;
  saturation: number;
  edgeDensity: number;
  textureComplexity: number;
  composition: string;
  dominantShapes: string[];
  spatialDistribution: { balance: number; focus: string };
}

interface ColorPalette {
  dominantColors: string[];
  colorHarmony: string;
  temperature: number;
  vibrancy: number;
  colorDistribution: { spread: number; dominance: number };
  contrastLevel: number;
}

interface SemanticFeatures {
  tags: string[];
  category: string;
  concepts: string[];
  themes: string[];
  keywords: string[];
  intentAnalysis: string;
}

interface ContentFeatures {
  titleSentiment: number;
  descriptionLength: number;
  tagDensity: number;
  authorStyle: string;
  contentType: string;
  complexity: number;
}

interface StyleFeatures {
  composition: string;
  colorTone: string;
  shapes: string;
  mood: string;
  designApproach: string;
  aestheticStyle: string;
}

interface ContextualFeatures {
  platform: string;
  engagement: {
    likes: number;
    saves: number;
    views: number;
  };
  temporal: {
    createdAt: Date;
    recency: number;
  };
  popularity: number;
}

interface AllFeatures {
  image: ImageFeatures;
  color: ColorPalette;
  semantic: SemanticFeatures;
  content: ContentFeatures;
  style: StyleFeatures;
  contextual: ContextualFeatures;
}

// Export singleton instance
export const advancedSimilarityEngine = new AdvancedSimilarityEngine();