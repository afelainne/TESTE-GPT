import { NextRequest, NextResponse } from 'next/server';
import { gerarEmbedding, generateClipEmbedding, generateClipEmbeddingFromBuffer } from '@/lib/clipEmbeddings';
import { clipVectorOperations, supabaseAdmin } from '@/lib/supabase';

// POST /api/find-similar - Find similar images using CLIP embeddings
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting similarity search...');
    
    const body = await request.json();
    const { imageUrl, imageBuffer, limit = 12 } = body;

    if (!imageUrl && !imageBuffer) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBuffer is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the query image
    let queryEmbedding: number[];
    
    try {
      if (imageBuffer) {
        console.log('🖼️ Generating embedding from buffer...');
        const buffer = Buffer.from(imageBuffer, 'base64');
        queryEmbedding = await generateClipEmbeddingFromBuffer(buffer.buffer);
      } else {
        console.log('🖼️ Generating embedding from URL:', imageUrl);
        
        // Validate URL format first
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          throw new Error('Invalid image URL format');
        }
        
        queryEmbedding = await gerarEmbedding(imageUrl);
      }
      
      console.log(`✅ Generated query embedding of length ${queryEmbedding.length}`);
      
      // Validate embedding
      if (!queryEmbedding || queryEmbedding.length !== 512) {
        throw new Error('Invalid embedding generated');
      }
      
    } catch (clipError) {
      console.error('❌ CLIP embedding failed:', clipError);
      
      // Generate fallback results based on recent images
      console.log('⚠️ Using fallback similarity search...');
      
      try {
        // Get some recent vectors from the database as fallback - UNLIMITED
        const { clipVectorOperations } = await import('@/lib/supabase');
        const recentVectors = await clipVectorOperations.getAll(); // NO LIMIT
        
        const fallbackResults = recentVectors.slice(0, limit || 12).map((vector: any) => ({
          id: vector.id,
          image_url: vector.image_url,
          title: vector.title,
          similarity: Math.random() * 0.3 + 0.4, // Random similarity 0.4-0.7
          author_name: vector.metadata?.author_name || 'Unknown',
          author_profile_url: vector.metadata?.author_profile_url || '#',
          platform: vector.metadata?.platform || 'Unknown',
          source_url: vector.source_url
        }));
        
        return NextResponse.json({
          results: fallbackResults,
          fallback: true,
          message: 'CLIP embeddings unavailable, returning recent images',
          error: clipError instanceof Error ? clipError.message : 'Unknown CLIP error'
        });
        
      } catch (fallbackError) {
        return NextResponse.json({
          results: [],
          fallback: true,
          message: 'Both CLIP and database fallback failed',
          error: clipError instanceof Error ? clipError.message : 'Unknown error'
        });
      }
    }

    // Search for similar vectors in Supabase
    try {
      const similarVectors = await clipVectorOperations.searchSimilar(queryEmbedding, limit);
      
      console.log(`✅ Found ${similarVectors.length} similar images`);
      
      // If no similar vectors found, provide fallback from recent images
      if (similarVectors.length === 0) {
        console.log('📋 No similar vectors found, using recent images as fallback...');
        const recentVectors = await clipVectorOperations.getAll(); // NO LIMIT
        
        const fallbackResults = recentVectors.slice(0, limit || 12).map((vector: any) => ({
          id: vector.id,
          image_url: vector.image_url,
          title: vector.title,
          similarity: Math.random() * 0.3 + 0.3, // Random similarity 0.3-0.6
          author_name: vector.metadata?.author_name || 'Unknown',
          author_profile_url: vector.metadata?.author_profile_url || '#',
          platform: vector.metadata?.platform || 'Unknown',
          source_url: vector.source_url
        }));
        
        return NextResponse.json({
          results: fallbackResults,
          fallback: true,
          message: 'No similarity matches found, showing recent images',
          query_embedding_length: queryEmbedding.length,
          total_found: fallbackResults.length
        });
      }
      
      // Transform to expected format
      const results = similarVectors.map((vector: any) => ({
        id: vector.id,
        image_url: vector.image_url,
        title: vector.title,
        similarity: vector.similarity || 0,
        author_name: vector.metadata?.author_name || 'Unknown',
        author_profile_url: vector.metadata?.author_profile_url || '#',
        platform: vector.metadata?.platform || 'Unknown',
        source_url: vector.source_url
      }));

      return NextResponse.json({
        results,
        query_embedding_length: queryEmbedding.length,
        total_found: results.length
      });

    } catch (supabaseError) {
      console.error('❌ Supabase search failed:', supabaseError);
      
      // Try to get fallback data even on database errors
      try {
        console.log('🔄 Attempting fallback data retrieval...');
        const recentVectors = await clipVectorOperations.getAll(); // NO LIMIT
        
        const fallbackResults = recentVectors.slice(0, limit || 12).map((vector: any) => ({
          id: vector.id,
          image_url: vector.image_url,
          title: vector.title,
          similarity: Math.random() * 0.2 + 0.2, // Random similarity 0.2-0.4
          author_name: vector.metadata?.author_name || 'Unknown',
          author_profile_url: vector.metadata?.author_profile_url || '#',
          platform: vector.metadata?.platform || 'Unknown',
          source_url: vector.source_url
        }));
        
        return NextResponse.json({
          results: fallbackResults,
          fallback: true,
          message: 'Database search failed, showing recent images',
          query_embedding_length: queryEmbedding.length,
          total_found: fallbackResults.length,
          error: supabaseError instanceof Error ? supabaseError.message : 'Unknown database error'
        });
        
      } catch (fallbackError) {
        return NextResponse.json({
          results: [],
          fallback: true,
          message: 'Both database search and fallback failed',
          error: supabaseError instanceof Error ? supabaseError.message : 'Unknown database error'
        });
      }
    }

  } catch (error) {
    console.error('❌ Find similar API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/find-similar - Get similar/related images with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const cursor = parseInt(searchParams.get('cursor') || '0');
    const pageSize = 10;
    
    console.log('🔍 GET find-similar - imageId:', imageId, 'cursor:', cursor);
    
    if (imageId) {
      // Find similar images based on embeddings
      try {
        const targetVector = await clipVectorOperations.getById(imageId);
        
        if (targetVector && targetVector.embedding) {
          const similarVectors = await clipVectorOperations.searchSimilar(
            targetVector.embedding, 
            pageSize + 5 // Get a few extra to filter out the original
          );
          
          // Filter out the original image
          const filteredSimilar = similarVectors.filter(
            (vector: any) => vector.id !== imageId
          ).slice(0, pageSize);
          
          return NextResponse.json({
            similar: filteredSimilar.map((vector: any) => ({
              id: vector.id,
              image_url: vector.image_url,
              title: vector.title,
              author_name: vector.metadata?.author_name || 'Unknown',
              similarity: vector.similarity || 0,
              source_url: vector.source_url
            })),
            nextCursor: null, // For embeddings, we typically return all at once
            hasMore: false
          });
        }
      } catch (error) {
        console.log('⚠️ Embedding search failed, falling back to recent images');
      }
    }
    
    // Fallback: Return recent images with pagination (keep for performance)
    const { data: entries, error } = await supabaseAdmin
      .from('clip_vectors')
      .select('id, image_url, title, author_name, created_at, source_url')
      .order('created_at', { ascending: false })
      .range(cursor, cursor + pageSize - 1); // Keep pagination for fallback performance
    
    if (error) {
      throw error;
    }
    
    const hasMore = entries.length === pageSize;
    const nextCursor = hasMore ? cursor + pageSize : null;
    
    return NextResponse.json({
      similar: entries.map((entry: any) => ({
        id: entry.id,
        image_url: entry.image_url,
        title: entry.title,
        author_name: entry.author_name || 'Unknown',
        similarity: Math.random() * 0.3 + 0.4, // Fallback similarity
        source_url: entry.source_url
      })),
      nextCursor,
      hasMore,
      fallback: true
    });
    
  } catch (error) {
    console.error('❌ GET find-similar error:', error);
    return NextResponse.json({
      similar: [],
      nextCursor: null,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}