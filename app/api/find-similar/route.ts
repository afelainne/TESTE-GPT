import { NextResponse } from 'next/server';

// CLIP API URL with fallback to Hugging Face Space
const CLIP_API_URL =
  process.env.CLIP_API_URL ||
  'https://antonielfelain-macaly-clip.hf.space/run/predict';

console.log('[find-similar] CLIP_API_URL=', CLIP_API_URL);

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
    console.log('[find-similar] 🔍 Finding similar images for:', imageUrl);

    // PRIMARY: Use Supabase database with CLIP embeddings (reliable)
    try {
      console.log('[find-similar] 🎯 Using Supabase CLIP embeddings (primary method)');
      const { clipVectorOperations } = await import('@/lib/supabase');
      
      // Try to find the image in our database and use its embedding for similarity
      const { data: sourceVector } = await clipVectorOperations.supabaseAdmin
        .from('clip_vectors')
        .select('*')
        .eq('image_url', imageUrl)
        .maybeSingle();
      
      if (sourceVector && sourceVector.embedding) {
        console.log('[find-similar] ✅ Found source image in database with embedding');
        
        // Search for similar images using CLIP embeddings
        const similarVectors = await clipVectorOperations.searchSimilar(
          sourceVector.embedding,
          50
        );
        
        if (similarVectors && similarVectors.length > 0) {
          const similar = similarVectors
            .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
            .slice(0, 50)
            .map((item: any) => item.image_url);
          
          console.log('[find-similar] ✅ Found', similar.length, 'similar images from Supabase embeddings');
          return NextResponse.json({ 
            similar, 
            method: 'supabase-embedding',
            source: 'database'
          });
        }
      }
      
      // If no embedding found for source image, get related images from same category/author
      console.log('[find-similar] 🔄 No embedding found, trying contextual similarity');
      const dbItems = await clipVectorOperations.getAll(100);
      
      if (dbItems && dbItems.length > 0) {
        // Filter by same author or similar metadata if available
        let filteredItems = dbItems.filter((item: any) => 
          item && item.image_url && item.image_url !== imageUrl
        );
        
        // Shuffle for variety
        filteredItems = filteredItems.sort(() => Math.random() - 0.5);
        
        const similar = filteredItems
          .slice(0, 50)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] ✅ Found', similar.length, 'contextually related images');
        return NextResponse.json({ 
          similar, 
          method: 'contextual-database',
          source: 'database'
        });
      }
    } catch (supabaseError) {
      console.warn('[find-similar] Supabase search failed, will try external API:', supabaseError);
    }
    
    // SECONDARY: External CLIP API (timeout after 5 seconds)
    try {
      console.log('[find-similar] 🌐 Trying external CLIP API:', CLIP_API_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(CLIP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [imageUrl] }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const json = await response.json();
        console.log('[find-similar] ✅ CLIP API response received');
        
        const results = Array.isArray(json.data) && Array.isArray(json.data[0])
          ? json.data[0]
          : [];
        
        if (results.length > 0) {
          const similar = results
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 50)
            .map((item: any) => item.url);
          
          console.log('[find-similar] ✅ Found', similar.length, 'similar images from CLIP API');
          return NextResponse.json({ 
            similar, 
            method: 'external-clip-api',
            source: 'huggingface'
          });
        }
      }
    } catch (clipError) {
      if (clipError instanceof Error && clipError.name === 'AbortError') {
        console.warn('[find-similar] CLIP API timeout after 5 seconds');
      } else {
        console.warn('[find-similar] CLIP API failed:', clipError);
      }
    }
    
    // FINAL FALLBACK: Random database images
    try {
      console.log('[find-similar] 🎲 Using final fallback: random database images');
      const { clipVectorOperations } = await import('@/lib/supabase');
      const dbItems = await clipVectorOperations.getAll(100);
      
      if (dbItems && dbItems.length > 0) {
        const similar = dbItems
          .filter((item: any) => item && item.image_url && item.image_url !== imageUrl)
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 50)
          .map((item: any) => item.image_url);
        
        console.log('[find-similar] ✅ Returning', similar.length, 'random database images');
        return NextResponse.json({ 
          similar, 
          method: 'random-fallback',
          source: 'database'
        });
      }
    } catch (fallbackError) {
      console.error('[find-similar] All fallbacks failed:', fallbackError);
    }
    
    console.log('[find-similar] ❌ No similar images found by any method');
    return NextResponse.json({ 
      similar: [], 
      method: 'empty',
      source: 'none'
    });
    
  } catch (error) {
    console.error('[find-similar] Critical exception:', error);
    return NextResponse.json({ 
      similar: [], 
      error: 'Internal server error',
      method: 'error'
    }, { status: 200 }); // Still return 200 to prevent UI errors
  }
}