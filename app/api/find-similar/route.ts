import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let imageUrl;
    
    // Parse request body
    try {
      const body = await request.json();
      imageUrl = body.imageUrl;
    } catch (parseError) {
      console.error('[find-similar] Failed to parse request body:', parseError);
      return NextResponse.json({ similar: [] }, { status: 200 });
    }
    
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      console.warn('[find-similar] Missing imageUrl');
      return NextResponse.json({ similar: [] }, { status: 200 });
    }
    
    // Clean and validate the imageUrl
    imageUrl = imageUrl.trim();
    console.log('[find-similar] 🔍 CLIP API SIMILARITY for:', imageUrl);

    // Use CLIP_API_URL from environment
    const clipApiUrl = process.env.CLIP_API_URL;
    if (!clipApiUrl) {
      console.error('[find-similar] CLIP_API_URL not configured');
      return NextResponse.json({ similar: [] }, { status: 200 });
    }
    
    console.log('[find-similar] Using CLIP API:', clipApiUrl);
    
    // Try CLIP API first
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
      
      if (response.ok) {
        const result = await response.json();
        console.log('[find-similar] CLIP API response:', result);
        
        if (result && result.data && Array.isArray(result.data) && result.data[0]) {
          const data = result.data[0];
          if (Array.isArray(data)) {
            // Sort by score and extract URLs
            const similar = data
              .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
              .slice(0, 8)
              .map((item: any) => item.url)
              .filter((url: string) => url && typeof url === 'string');
            
            console.log('[find-similar] ✅ Found', similar.length, 'similar images from CLIP API');
            return NextResponse.json({ similar });
          }
        }
      } else {
        console.warn('[find-similar] CLIP API error:', response.status, response.statusText);
      }
    } catch (clipError) {
      console.warn('[find-similar] CLIP API failed:', clipError);
    }
    
    // Fallback to Supabase search when CLIP API fails
    console.log('[find-similar] Falling back to Supabase database search');
    
    try {
      const { clipVectorOperations } = await import('@/lib/supabase');
      
      // Try to find the image in our database and use its embedding for similarity
      const { data: sourceVector } = await clipVectorOperations.supabaseAdmin
        .from('clip_vectors')
        .select('*')
        .eq('image_url', imageUrl)
        .maybeSingle();
      
      if (sourceVector && sourceVector.embedding) {
        console.log('[find-similar] Found source image in database with embedding');
        
        // Search for similar images using CLIP embeddings
        const similarVectors = await clipVectorOperations.searchSimilar(
          sourceVector.embedding,
          10
        );
        
        if (similarVectors && similarVectors.length > 0) {
          const similar = similarVectors
            .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
            .slice(0, 8)
            .map((item: any) => item.image_url);
          
          console.log('[find-similar] ✅ Found', similar.length, 'similar images from Supabase embeddings');
          return NextResponse.json({ similar, method: 'supabase-embedding' });
        }
      }
      
      // Final fallback: random images from database
      console.log('[find-similar] Using random database images as fallback');
      const dbItems = await clipVectorOperations.getAll(20);
      
      if (dbItems && dbItems.length > 0) {
        const similar = dbItems
          .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
          .slice(0, 8)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] ✅ Returning', similar.length, 'random database images');
        return NextResponse.json({ similar, method: 'random-fallback' });
      }
    } catch (supabaseError) {
      console.error('[find-similar] Supabase fallback failed:', supabaseError);
    }
    
    return NextResponse.json({ similar: [] });
    
  } catch (error) {
    console.error('[find-similar] Exception:', error);
    return NextResponse.json({ similar: [] }, { status: 200 });
  }
}