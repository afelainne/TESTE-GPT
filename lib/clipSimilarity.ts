"use client";

// CLIP-based similarity search system
export interface SimilarityVector {
  id: string;
  imageUrl: string;
  title: string;
  embedding?: number[];
  features?: {
    colors: string[];
    composition: string;
    style: string;
    mood: string;
  };
}

class CLIPSimilarity {
  private static instance: CLIPSimilarity;
  private vectors: SimilarityVector[] = [];
  
  static getInstance(): CLIPSimilarity {
    if (!CLIPSimilarity.instance) {
      CLIPSimilarity.instance = new CLIPSimilarity();
    }
    return CLIPSimilarity.instance;
  }

  async addVector(vector: SimilarityVector): Promise<void> {
    // Try to get CLIP embedding if CLIP service is available
    try {
      if (process.env.NEXT_PUBLIC_CLIP_API_URL) {
        const embedding = await this.getClipEmbedding(vector.imageUrl);
        vector.embedding = embedding;
      }
    } catch (error) {
      console.warn('CLIP service unavailable, using feature-based similarity');
    }
    
    this.vectors.push(vector);
    console.log('Vector added to CLIP similarity index:', vector.id);
  }

  async findSimilar(
    queryVector: SimilarityVector, 
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SimilarityVector[]> {
    console.log('🔍 Finding similar items for:', queryVector.id);
    
    if (this.vectors.length === 0) {
      console.warn('No vectors in similarity index');
      return [];
    }

    // If we have embeddings, use cosine similarity
    if (queryVector.embedding) {
      return this.findSimilarByEmbedding(queryVector, limit, threshold);
    }
    
    // Fallback to feature-based similarity
    return this.findSimilarByFeatures(queryVector, limit, threshold);
  }

  private async findSimilarByEmbedding(
    queryVector: SimilarityVector,
    limit: number,
    threshold: number
  ): Promise<SimilarityVector[]> {
    const similarities = this.vectors
      .filter(v => v.id !== queryVector.id && v.embedding)
      .map(vector => ({
        vector,
        similarity: this.cosineSimilarity(queryVector.embedding!, vector.embedding!)
      }))
      .filter(({ similarity }) => similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(`Found ${similarities.length} similar items by embedding`);
    return similarities.map(s => s.vector);
  }

  private findSimilarByFeatures(
    queryVector: SimilarityVector,
    limit: number,
    threshold: number
  ): Promise<SimilarityVector[]> {
    const similarities = this.vectors
      .filter(v => v.id !== queryVector.id)
      .map(vector => ({
        vector,
        similarity: this.featureSimilarity(queryVector, vector)
      }))
      .filter(({ similarity }) => similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(`Found ${similarities.length} similar items by features`);
    return Promise.resolve(similarities.map(s => s.vector));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private featureSimilarity(a: SimilarityVector, b: SimilarityVector): number {
    let score = 0;
    let factors = 0;

    // Color similarity
    if (a.features?.colors && b.features?.colors) {
      const colorSim = this.colorSimilarity(a.features.colors, b.features.colors);
      score += colorSim * 0.4; // 40% weight
      factors += 0.4;
    }

    // Style similarity
    if (a.features?.style && b.features?.style) {
      const styleSim = a.features.style === b.features.style ? 1 : 0;
      score += styleSim * 0.3; // 30% weight
      factors += 0.3;
    }

    // Mood similarity
    if (a.features?.mood && b.features?.mood) {
      const moodSim = a.features.mood === b.features.mood ? 1 : 0;
      score += moodSim * 0.2; // 20% weight
      factors += 0.2;
    }

    // Composition similarity
    if (a.features?.composition && b.features?.composition) {
      const compSim = a.features.composition === b.features.composition ? 1 : 0;
      score += compSim * 0.1; // 10% weight
      factors += 0.1;
    }

    return factors > 0 ? score / factors : 0;
  }

  private colorSimilarity(colors1: string[], colors2: string[]): number {
    if (!colors1.length || !colors2.length) return 0;
    
    let maxSimilarity = 0;
    
    for (const color1 of colors1) {
      for (const color2 of colors2) {
        const sim = this.hexColorSimilarity(color1, color2);
        maxSimilarity = Math.max(maxSimilarity, sim);
      }
    }
    
    return maxSimilarity;
  }

  private hexColorSimilarity(hex1: string, hex2: string): number {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // Euclidean distance in RGB space, normalized
    const distance = Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
    
    // Convert to similarity (0-1)
    return 1 - (distance / (255 * Math.sqrt(3)));
  }

  private hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  private async getClipEmbedding(imageUrl: string): Promise<number[]> {
    console.log('🔄 Getting CLIP embedding for:', imageUrl);
    
    const clipApiUrl = process.env.NEXT_PUBLIC_CLIP_API_URL;
    if (!clipApiUrl) {
      throw new Error('CLIP API URL not configured');
    }
    
    const response = await fetch(clipApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [imageUrl]
      }),
    });

    if (!response.ok) {
      throw new Error(`CLIP API error (${response.status}): ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !result.data || !Array.isArray(result.data) || !result.data[0]) {
      throw new Error('Invalid CLIP API response');
    }
    
    const embedding = result.data[0];
    
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format');
    }
    
    console.log(`✅ Got CLIP embedding (${embedding.length} dimensions)`);
    return embedding;
  }

  // Initialize from existing items
  async initializeFromItems(items: any[]): Promise<void> {
    console.log('🔄 Initializing CLIP similarity index with', items.length, 'items');
    
    this.vectors = [];
    
    for (const item of items) {
      const vector: SimilarityVector = {
        id: item.id,
        imageUrl: item.imageUrl,
        title: item.title,
        features: {
          colors: item.colors || [],
          composition: item.visualStyle?.composition || 'unknown',
          style: item.visualStyle?.shapes || 'unknown',
          mood: item.visualStyle?.mood || 'unknown'
        }
      };
      
      await this.addVector(vector);
    }
    
    console.log('✅ CLIP similarity index initialized');
  }
}

export const clipSimilarity = CLIPSimilarity.getInstance();