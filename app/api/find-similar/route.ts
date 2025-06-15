import { NextRequest, NextResponse } from 'next/server';

// CORS headers for cross-origin requests
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  console.log('🔧 CLIP_API_URL configured:', process.env.CLIP_API_URL);
  
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      console.log('❌ No imageUrl provided');
      return setCorsHeaders(NextResponse.json({ similar: [] }));
    }

    // Validate image URL format
    if (!imageUrl.startsWith('http')) {
      console.log('❌ Invalid imageUrl format:', imageUrl);
      return setCorsHeaders(NextResponse.json({ similar: [] }));
    }

    console.log('🔍 Fetch Similar →', process.env.CLIP_API_URL, imageUrl);
    console.log('🔍 Payload enviado para CLIP:', { data: [imageUrl] });

    const clipApiUrl = process.env.CLIP_API_URL || 'https://macaly-clip.hf.space/api/predict';
    console.log('🌐 Using CLIP API URL:', clipApiUrl);
    
    try {
      // Call CLIP API with proper timeout and error handling
      const clipResponse = await fetch(clipApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [imageUrl]
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('🌐 CLIP Response status:', clipResponse.status);

      if (!clipResponse.ok) {
        console.warn(`⚠️ CLIP API unavailable (${clipResponse.status}), using fallback similarity`);
        return setCorsHeaders(NextResponse.json({ similar: [] }));
      }

      const clipJson = await clipResponse.json();
      console.log('🔍 CLIP response:', clipJson);

      // Validate CLIP response structure
      if (!clipJson.data || !Array.isArray(clipJson.data) || !clipJson.data[0]) {
        console.log('⚠️ Invalid CLIP response structure, returning empty');
        return setCorsHeaders(NextResponse.json({ similar: [] }));
      }

      // Extract and process similar images
      const similarData = clipJson.data[0];
      
      if (!Array.isArray(similarData)) {
        console.log('⚠️ CLIP data[0] is not an array, returning empty');
        return setCorsHeaders(NextResponse.json({ similar: [] }));
      }

      // Process similar images with scores - extract only URLs
      const similar = similarData
        .filter(item => item && typeof item === 'object' && item.url && typeof item.score === 'number')
        .sort((a, b) => b.score - a.score)
        .map(item => item.url)
        .slice(0, 8); // Limit to 8 images

      console.log(`✅ Found ${similar.length} similar images:`, similar);

      return setCorsHeaders(NextResponse.json({ similar: similar }));
      
    } catch (clipError) {
      console.warn('⚠️ CLIP API failed, using fallback:', clipError);
      return setCorsHeaders(NextResponse.json({ similar: [] }));
    }

  } catch (error) {
    console.error('❌ Error in find-similar API:', error);
    return setCorsHeaders(NextResponse.json({ similar: [] }));
  }
}

// Generate mock similar images for fallback when CLIP is unavailable
function generateMockSimilarImages(queryUrl: string): string[] {
  // Some sample images for demo purposes
  const mockImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
    'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8'
  ];
  
  // Filter out the query image itself and return random selection
  return mockImages
    .filter(url => url !== queryUrl)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);
}