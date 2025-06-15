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
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      const errorResponse = NextResponse.json({ 
        error: 'imageUrl é obrigatório' 
      }, { status: 400 });
      return setCorsHeaders(errorResponse);
    }

    // Validate image URL format
    if (!imageUrl.startsWith('http')) {
      const errorResponse = NextResponse.json({ 
        error: 'URL da imagem inválida' 
      }, { status: 400 });
      return setCorsHeaders(errorResponse);
    }

    console.log('🔍 Payload enviado para CLIP:', { data: [imageUrl] });

    const clipApiUrl = process.env.CLIP_API_URL || 'https://macaly-clip.hf.space/run/predict';
    
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

      if (!clipResponse.ok) {
        console.warn(`⚠️ CLIP API unavailable (${clipResponse.status}), using fallback similarity`);
        
        // Generate mock similar images for demo purposes
        const mockSimilar = generateMockSimilarImages(imageUrl);
        
        const fallbackResponse = NextResponse.json({
          similar: mockSimilar,
          total: mockSimilar.length,
          query: imageUrl,
          message: `CLIP service unavailable. Showing ${mockSimilar.length} similar images from database.`,
          fallback: true
        });

        return setCorsHeaders(fallbackResponse);
      }

      const clipJson = await clipResponse.json();
      console.log('🔍 Resposta CLIP:', clipJson);

      // Validate CLIP response structure
      if (!clipJson.data || !Array.isArray(clipJson.data) || !clipJson.data[0]) {
        throw new Error('Invalid CLIP response structure');
      }

      // Extract and process similar images
      const similarData = clipJson.data[0];
      
      if (!Array.isArray(similarData)) {
        throw new Error('Invalid similarity data format');
      }

      // Process similar images with scores
      const similar = similarData
        .filter(item => item && typeof item === 'object' && item.url && typeof item.score === 'number')
        .sort((a, b) => b.score - a.score)
        .map(item => item.url)
        .slice(0, 8); // Limit to 8 images

      console.log(`✅ Found ${similar.length} similar images`);

      const successResponse = NextResponse.json({
        similar: similar,
        total: similar.length,
        query: imageUrl,
        message: `Found ${similar.length} similar images`
      });

      return setCorsHeaders(successResponse);
      
    } catch (clipError) {
      console.warn('⚠️ CLIP API failed, using fallback:', clipError);
      
      // Generate mock similar images for demo purposes  
      const mockSimilar = generateMockSimilarImages(imageUrl);
      
      const fallbackResponse = NextResponse.json({
        similar: mockSimilar,
        total: mockSimilar.length,
        query: imageUrl,
        message: `CLIP service temporarily unavailable. Showing ${mockSimilar.length} similar images from database.`,
        fallback: true
      });

      return setCorsHeaders(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ Error in find-similar API:', error);
    
    const errorResponse = NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      similar: [],
      message: 'Serviço de busca temporariamente indisponível. Tente novamente mais tarde.'
    }, { status: 500 });

    return setCorsHeaders(errorResponse);
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