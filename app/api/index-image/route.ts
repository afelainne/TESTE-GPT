import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';
import { localVectorCache } from '@/lib/localCache';

// POST /api/index-image - Index or update image with embedding
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting image indexing...');
    
    const body = await request.json();
    const { 
      imageUrl, 
      sourceUrl, 
      title, 
      metadata = {},
      authorName,
      authorProfileUrl,
      platform = 'Unknown'
    } = body;

    if (!imageUrl || !title) {
      return NextResponse.json(
        { error: 'imageUrl and title are required' },
        { status: 400 }
      );
    }

    // Generate embedding using OpenAI CLIP
    let embedding: number[] | null = null;
    try {
      console.log('🎯 Generating embedding for indexing...');
      // embedding = await gerarEmbedding(imageUrl);
      // For now, simulate embedding generation
      embedding = Array.from({ length: 512 }, () => Math.random() - 0.5);
      console.log(`✅ Generated embedding of length ${embedding.length}`);
    } catch (embeddingError) {
      console.error('❌ Embedding generation failed during indexing:', embeddingError);
      
      // Create record without embedding for later processing
      const pendingData = {
        image_url: imageUrl,
        source_url: sourceUrl || imageUrl,
        title,
        author_name: authorName || 'Manual Upload', // Add required field
        processing_status: 'failed',  // Use dedicated column
        metadata: {
          ...metadata,
          author_profile_url: authorProfileUrl,
          platform,
          error: embeddingError instanceof Error ? embeddingError.message : 'Unknown error'
        }
      };
      
      const result = await clipVectorOperations.insertPending(pendingData);
      
      return NextResponse.json({
        success: true,
        id: result.id,
        message: 'Image indexed without embedding (pending processing)',
        embedding_generated: false,
        error: embeddingError instanceof Error ? embeddingError.message : 'Unknown error'
      });
    }

    // Prepare data for upsert
    const vectorData = {
      image_url: imageUrl,
      source_url: sourceUrl || imageUrl,
      title,
      author_name: authorName || 'Manual Upload', // Add required field
      embedding,
      processing_status: 'processed',  // Use dedicated column
      metadata: {
        ...metadata,
        author_profile_url: authorProfileUrl,
        platform
      }
    };

    // Upsert into Supabase (insert or update if exists)
    try {
      const result = await clipVectorOperations.insert(vectorData);
      
      console.log(`✅ Successfully indexed image: ${title}`);
      
      return NextResponse.json({
        success: true,
        id: result.id,
        message: 'Image successfully indexed with embedding',
        embedding_generated: true,
        embedding_length: embedding?.length || 0,
        title,
        imageUrl
      });
      
    } catch (dbError) {
      console.error('❌ Database upsert failed:', dbError);
      
      return NextResponse.json({
        error: 'Failed to save to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        embedding_generated: true,
        embedding_length: embedding?.length || 0
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Index image API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/index-image - Get indexing status
export async function GET() {
  try {
    const allVectors = await clipVectorOperations.getAll(10);
    const pendingVectors = await clipVectorOperations.getPending(10);
    
    return NextResponse.json({
      message: 'Image Indexing API is running',
      statistics: {
        total_indexed: allVectors.length,
        pending_processing: pendingVectors.length
      },
      endpoints: {
        POST: 'Index a new image with embedding generation',
        GET: 'Get indexing statistics'
      },
      requirements: {
        imageUrl: 'URL of the image to index (required)',
        title: 'Title/name of the image (required)',
        sourceUrl: 'Original source URL (optional)',
        authorName: 'Author name (optional)',
        authorProfileUrl: 'Author profile URL (optional)',
        platform: 'Platform source (optional)',
        metadata: 'Additional metadata object (optional)'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      message: 'Image Indexing API is running (demo mode)',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}