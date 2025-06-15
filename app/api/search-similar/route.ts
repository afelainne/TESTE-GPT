import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';
import { localVectorCache } from '@/lib/localCache';

async function getClipEmbedding(imageUrl: string): Promise<number[]> {
  console.log('🔄 Getting CLIP embedding for search image:', imageUrl);
  
  const clipApiUrl = process.env.CLIP_API_URL!;
  
  try {
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
      if (response.status === 404) {
        throw new Error(`CLIP API service unavailable. Please try again later.`);
      } else if (response.status === 500) {
        throw new Error(`CLIP API error processing image. The image may be invalid.`);
      } else {
        throw new Error(`CLIP API error (${response.status}): ${response.statusText}`);
      }
    }

    const result = await response.json();
    
    if (!result || !result.data || !Array.isArray(result.data) || !result.data[0]) {
      throw new Error('Invalid response from CLIP API');
    }
    
    const embedding = result.data[0];
    
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format from CLIP API');
    }
    
    console.log(`✅ Got CLIP embedding for search (${embedding.length} dimensions)`);
    
    return embedding;
  } catch (error) {
    console.error(`❌ CLIP API Error:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, limit = 10 } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate image URL format
    if (!imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting visual similarity search for: ${imageUrl}`);

    let queryEmbedding: number[];
    try {
      // Get CLIP embedding for the search image
      queryEmbedding = await getClipEmbedding(imageUrl);
    } catch (clipError) {
      console.warn('⚠️ CLIP API unavailable, returning recent images');
      
      // Fallback: return recent indexed images if CLIP fails
      let fallbackVectors: any[] = [];
      try {
        fallbackVectors = await clipVectorOperations.getAll(limit * 2);
        
        // Apply deduplication to fallback with better error handling
        try {
          const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
          if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
            fallbackVectors = similarityDedupeUtils.dedupeByUrl(fallbackVectors).slice(0, limit);
          } else {
            console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
            fallbackVectors = fallbackVectors.slice(0, limit);
          }
        } catch (dedupeError) {
          console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
          fallbackVectors = fallbackVectors.slice(0, limit);
        }
        
      } catch (dbError) {
        console.warn('⚠️ Database unavailable, using local cache for fallback');
        let localVectors = localVectorCache.getAll().slice(0, limit * 2);
        
        // Apply deduplication to local cache with error handling
        try {
          const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
          if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
            fallbackVectors = similarityDedupeUtils.dedupeByUrl(localVectors).slice(0, limit);
          } else {
            console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
            fallbackVectors = localVectors.slice(0, limit);
          }
        } catch (dedupeError) {
          console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
          fallbackVectors = localVectors.slice(0, limit);
        }
      }
      
      return NextResponse.json({
        query: {
          image_url: imageUrl,
          embedding_dimensions: 0,
          fallback_mode: true
        },
        results: fallbackVectors.map((vector: any) => ({
          id: vector.id,
          image_url: vector.image_url,
          source_url: vector.source_url,
          title: vector.title,
          similarity: 0,
          metadata: vector.metadata
        })),
        total_found: fallbackVectors.length,
        message: `CLIP service unavailable. Showing ${fallbackVectors.length} recent indexed images instead.`
      });
    }
    
    let similarVectors;
    try {
      // Search for similar vectors in Supabase with deduplication
      similarVectors = await clipVectorOperations.searchSimilar(queryEmbedding, limit);
      
      // Apply additional client-side deduplication as safety net
      try {
        const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
        if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
          similarVectors = similarityDedupeUtils.dedupeByUrl(similarVectors);
        } else {
          console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
        }
      } catch (dedupeError) {
        console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
      }
      
    } catch (dbError) {
      console.warn('⚠️ Vector similarity search failed, using local cache');
      try {
        let fallbackVectors = await clipVectorOperations.getAll(limit * 2);
        
        // Apply deduplication to fallback data with error handling
        try {
          const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
          if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
            fallbackVectors = similarityDedupeUtils.dedupeByUrl(fallbackVectors);
          } else {
            console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
          }
        } catch (dedupeError) {
          console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
        }
        similarVectors = fallbackVectors.slice(0, limit);
        
      } catch (fallbackError) {
        console.warn('⚠️ Supabase unavailable, using local cache only');
        let localVectors = localVectorCache.getAll().slice(0, limit * 2);
        
        // Apply deduplication to local cache too with error handling
        try {
          const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
          if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
            localVectors = similarityDedupeUtils.dedupeByUrl(localVectors);
          } else {
            console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
          }
        } catch (dedupeError) {
          console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
        }
        similarVectors = localVectors.slice(0, limit);
      }
    }
    
    const results = {
      query: {
        image_url: imageUrl,
        embedding_dimensions: queryEmbedding.length
      },
      results: similarVectors.map((vector: any) => ({
        id: vector.id,
        image_url: vector.image_url,
        source_url: vector.source_url,
        title: vector.title,
        similarity: vector.similarity || 0,
        metadata: vector.metadata
      })),
      total_found: similarVectors.length,
      message: `Found ${similarVectors.length} similar images`
    };

    console.log(`✅ Visual search completed: ${similarVectors.length} results`);

    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ Error in search-similar API:', error);
    
    // Final fallback - return local cache or empty results with deduplication
    try {
      let localVectors = localVectorCache.getAll().slice(0, 20);
      
      // Apply deduplication even to final fallback with error handling
      try {
        const { similarityDedupeUtils } = await import('@/lib/similarityDedupe');
        if (typeof similarityDedupeUtils.dedupeByUrl === 'function') {
          localVectors = similarityDedupeUtils.dedupeByUrl(localVectors).slice(0, 10);
        } else {
          console.warn('⚠️ Deduplication function not available, proceeding without deduplication');
          localVectors = localVectors.slice(0, 10);
        }
      } catch (dedupeError) {
        console.warn('⚠️ Deduplication failed, proceeding without deduplication:', dedupeError);
        localVectors = localVectors.slice(0, 10);
      }
      
      return NextResponse.json({
        query: {
          image_url: 'unknown',
          embedding_dimensions: 0,
          error_mode: true
        },
        results: localVectors.map((vector: any) => ({
          id: vector.id,
          image_url: vector.image_url,
          source_url: vector.source_url,
          title: vector.title,
          similarity: 0,
          metadata: vector.metadata
        })),
        total_found: localVectors.length,
        message: 'Search service temporarily unavailable. Showing unique local cache results.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (finalError) {
      return NextResponse.json({
        query: {
          image_url: 'unknown',
          embedding_dimensions: 0,
          error_mode: true
        },
        results: [],
        total_found: 0,
        message: 'Search service temporarily unavailable. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// GET endpoint to retrieve all indexed images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`📊 Fetching all indexed vectors (limit: ${limit})`);
    
    let vectors: any[] = [];
    
    // Try to get from Supabase first
    try {
      const supabaseVectors = await clipVectorOperations.getAll(limit);
      vectors = [...supabaseVectors];
      console.log(`📊 Retrieved ${supabaseVectors.length} vectors from Supabase`);
    } catch (dbError) {
      console.warn('⚠️ Supabase unavailable, using local cache only');
    }
    
    // Add local cache vectors
    const localVectors = localVectorCache.getAll();
    vectors = [...vectors, ...localVectors];
    
    console.log(`📊 Total vectors: ${vectors.length} (local cache: ${localVectors.length})`);
    
    const results = {
      vectors: (vectors || []).map(vector => ({
        id: vector.id,
        image_url: vector.image_url,
        source_url: vector.source_url,
        title: vector.title,
        created_at: vector.created_at,
        metadata: vector.metadata
      })),
      total: (vectors || []).length,
      message: `Retrieved ${(vectors || []).length} indexed images`
    };

    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ Error fetching vectors:', error);
    
    // Return local cache as final fallback
    try {
      const localVectors = localVectorCache.getAll();
      return NextResponse.json({
        vectors: localVectors.map(vector => ({
          id: vector.id,
          image_url: vector.image_url,
          source_url: vector.source_url,
          title: vector.title,
          created_at: vector.created_at,
          metadata: vector.metadata
        })),
        total: localVectors.length,
        message: `Retrieved ${localVectors.length} images from local cache`
      });
    } catch (finalError) {
      return NextResponse.json({
        vectors: [],
        total: 0,
        message: 'No indexed images available'
      });
    }
  }
}