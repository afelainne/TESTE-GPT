import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Finding similar images for ID:', imageId);

    // Step 1: Get the target image and its embedding from clip_vectors
    const targetVector = await clipVectorOperations.getById(imageId);
    
    if (!targetVector) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (!targetVector.embedding) {
      return NextResponse.json({
        similar: [],
        message: 'Image has no embedding - cannot find similarities'
      });
    }

    console.log('✅ Found target image with embedding:', targetVector.title);

    // Step 2: Use the embedding to find similar vectors
    const similarVectors = await clipVectorOperations.searchSimilar(
      targetVector.embedding, 
      10 // Return 10 similar items
    );

    // Step 3: Filter out the original image from results
    const filteredSimilar = similarVectors.filter(
      (vector: any) => vector.id !== imageId
    );

    console.log(`✅ Found ${filteredSimilar.length} similar images`);

    return NextResponse.json({
      similar: filteredSimilar.map((vector: any) => ({
        id: vector.id,
        image_url: vector.image_url,
        title: vector.title,
        author_name: vector.metadata?.author_name || 'Unknown',
        similarity: vector.similarity || 0,
        source_url: vector.source_url
      })),
      query: {
        id: imageId,
        title: targetVector.title,
        image_url: targetVector.image_url
      },
      total_found: filteredSimilar.length
    });

  } catch (error) {
    console.error('❌ Error in find-similar-by-id API:', error);
    
    return NextResponse.json(
      { 
        similar: [],
        error: 'Failed to find similar images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required in request body' },
        { status: 400 }
      );
    }

    console.log('🔍 POST request - Finding similar images for ID:', imageId);

    // Reuse GET logic
    const url = new URL(request.url);
    url.searchParams.set('imageId', imageId);
    
    const mockRequest = new NextRequest(url);
    return await GET(mockRequest);

  } catch (error) {
    console.error('❌ Error in POST find-similar-by-id:', error);
    
    return NextResponse.json(
      { 
        similar: [],
        error: 'Failed to find similar images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}