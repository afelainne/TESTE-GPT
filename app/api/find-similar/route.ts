import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let imageUrl;
    
    // Safely parse JSON with error handling
    try {
      const body = await request.json();
      imageUrl = body.imageUrl;
    } catch (parseError) {
      console.error('[find-similar] Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        similar: []
      }, { status: 400 });
    }
    
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.warn('[find-similar] Missing imageUrl, returning random Supabase images');
      
      // Return random Supabase images when imageUrl is missing
      const { clipVectorOperations } = await import('@/lib/supabase');
      const dbItems = await clipVectorOperations.getAll(20);
      
      if (dbItems && dbItems.length > 0) {
        const similar = dbItems
          .filter((item: any) => item && item.image_url)
          .slice(0, 8)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] Returning', similar.length, 'random database images');
        return NextResponse.json({ similar });
      }
      
      return NextResponse.json({ similar: [] });
    }
    
    // Clean and validate the imageUrl
    imageUrl = imageUrl.trim();
    console.log('[find-similar] ⚡ SUPABASE CLIP SIMILARITY for:', imageUrl);

    const { clipVectorOperations } = await import('@/lib/supabase');
    
    // Step 1: Find the source image in our database
    const { data: allVectors } = await clipVectorOperations.supabaseAdmin
      .from('clip_vectors')
      .select('*')
      .eq('image_url', imageUrl)
      .maybeSingle();
    
    if (!allVectors || !allVectors.embedding) {
      console.log('[find-similar] Image not found in database or no embedding, getting random images');
      
      // Get random similar images from database
      const dbItems = await clipVectorOperations.getAll(20);
      if (dbItems && dbItems.length > 0) {
        const similar = dbItems
          .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
          .slice(0, 8)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] Returning', similar.length, 'random database images (no embedding found)');
        return NextResponse.json({ similar });
      }
      
      return NextResponse.json({ similar: [] });
    }
    
    console.log('[find-similar] 🎯 Found source image with embedding, searching for similar...');
    
    // Step 2: Search for similar images using CLIP embeddings
    const similarVectors = await clipVectorOperations.searchSimilar(
      allVectors.embedding,
      10 // Get 10 similar items
    );
    
    if (similarVectors && similarVectors.length > 0) {
      // Filter out the original image and extract URLs
      const similar = similarVectors
        .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
        .slice(0, 8)
        .map((item: any) => item.image_url);
      
      console.log('[find-similar] ✅ Found', similar.length, 'CLIP-similar images from Supabase');
      return NextResponse.json({ 
        similar,
        method: 'clip-embedding-similarity',
        similarity_scores: similarVectors.slice(0, 8).map((item: any) => ({
          url: item.image_url,
          score: item.similarity || 0
        }))
      });
    }
    
    // Fallback: get random images from database if no similar found
    console.log('[find-similar] No similar images found, returning random database images');
    const dbItems = await clipVectorOperations.getAll(20);
    
    if (dbItems && dbItems.length > 0) {
      const similar = dbItems
        .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
        .slice(0, 8)
        .map((item: any) => item.image_url);
      
      console.log('[find-similar] Returning', similar.length, 'random database images (no similarities)');
      return NextResponse.json({ 
        similar,
        method: 'random-database-fallback'
      });
    }
    
    return NextResponse.json({ similar: [] });
    
  } catch (error) {
    console.error('[find-similar] Exception:', error);
    
    // Ultimate fallback: get any database images
    try {
      const { clipVectorOperations } = await import('@/lib/supabase');
      const dbItems = await clipVectorOperations.getAll(10);
      
      if (dbItems && dbItems.length > 0) {
        const similar = dbItems
          .filter((item: any) => item && item.image_url)
          .slice(0, 6)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] Exception fallback: returning', similar.length, 'database images');
        return NextResponse.json({ similar });
      }
    } catch (fallbackError) {
      console.warn('[find-similar] All fallbacks failed:', fallbackError);
    }
    
    return NextResponse.json({ similar: [] });
  }
}