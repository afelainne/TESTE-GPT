// Temporary local cache for when Supabase write operations fail
export interface CachedVector {
  id: string;
  image_url: string;
  source_url: string;
  title: string;
  author_name?: string;
  embedding: number[] | null;
  processing_status?: string;
  metadata: any;
  created_at: string;
}

class LocalVectorCache {
  private static instance: LocalVectorCache;
  private vectors: CachedVector[] = [];

  public static getInstance(): LocalVectorCache {
    if (!LocalVectorCache.instance) {
      LocalVectorCache.instance = new LocalVectorCache();
    }
    return LocalVectorCache.instance;
  }

  private constructor() {
    // Private constructor to ensure singleton
    this.loadFromStorage();
  }

  add(vector: Omit<CachedVector, 'id' | 'created_at'>): CachedVector {
    const newVector: CachedVector = {
      ...vector,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    
    this.vectors.push(newVector);
    this.saveToStorage();
    console.log(`📦 Added to local cache: ${newVector.title} (Total: ${this.vectors.length})`);
    return newVector;
  }

  getAll(): CachedVector[] {
    return [...this.vectors];
  }

  getPending(): CachedVector[] {
    return this.vectors.filter(v => !v.embedding);
  }

  getProcessed(): CachedVector[] {
    return this.vectors.filter(v => v.embedding);
  }

  updateEmbedding(id: string, embedding: number[]): CachedVector | null {
    const vector = this.vectors.find(v => v.id === id);
    if (vector) {
      vector.embedding = embedding;
      console.log(`🔄 Updated embedding for: ${vector.title}`);
      return vector;
    }
    return null;
  }

  getById(id: string): CachedVector | null {
    return this.vectors.find(v => v.id === id) || null;
  }

  clear(): void {
    this.vectors = [];
    console.log('🗑️ Local cache cleared');
  }

  count(): { total: number; processed: number; pending: number } {
    return {
      total: this.vectors.length,
      processed: this.getProcessed().length,
      pending: this.getPending().length
    };
  }

  private generateId(): string {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('local_vector_cache', JSON.stringify(this.vectors));
        console.log(`💾 Saved ${this.vectors.length} vectors to localStorage`);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('local_vector_cache');
        if (cached) {
          this.vectors = JSON.parse(cached);
          console.log(`📁 Loaded ${this.vectors.length} vectors from localStorage`);
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        this.vectors = [];
      }
    }
  }
}

export const localVectorCache = LocalVectorCache.getInstance();