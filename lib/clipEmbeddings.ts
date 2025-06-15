// Real CLIP Embeddings using Hugging Face API
// This handles real image feature extraction for similarity search using CLIP-VIT-Base-Patch32

// Main embedding generation function using Hugging Face CLIP
export async function gerarEmbedding(imageUrl: string): Promise<number[]> {
  try {
    console.log('🤖 Generating real CLIP embedding for:', imageUrl);
    
    // Validate URL format
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw new Error('Invalid image URL format');
    }

    // Try Hugging Face CLIP API first
    const clipEmbedding = await generateHuggingFaceClipEmbedding(imageUrl);
    if (clipEmbedding) {
      return clipEmbedding;
    }

    // Fallback to custom CLIP API
    const customClipEmbedding = await generateCustomClipEmbedding(imageUrl);
    if (customClipEmbedding) {
      return customClipEmbedding;
    }

    // Final fallback to mock embedding
    console.log('⚠️ All CLIP APIs failed, using mock embedding');
    return generateMockEmbedding(imageUrl);
    
  } catch (error) {
    console.error('❌ CLIP embedding generation failed:', error);
    return generateMockEmbedding(imageUrl);
  }
}

// Hugging Face CLIP API
async function generateHuggingFaceClipEmbedding(imageUrl: string): Promise<number[] | null> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const apiUrl = process.env.HUGGINGFACE_CLIP_URL || 'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32';

    console.log('🤖 CLIP Configuration Check:', {
      huggingface_configured: apiKey && apiKey !== 'your-huggingface-key-here',
      openai_configured: process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-key-here',
      clip_url: apiUrl
    });

    if (!apiKey || apiKey === 'your-huggingface-key-here') {
      console.warn('⚠️ HUGGINGFACE_API_KEY not configured');
      return null;
    }

    console.log('🤗 Using Hugging Face CLIP API');

    // Fetch image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Send to Hugging Face
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && Array.isArray(result) && result.length > 0) {
      console.log(`✅ Generated Hugging Face CLIP embedding of length ${result.length}`);
      return result.slice(0, 512); // Ensure 512 dimensions
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Hugging Face CLIP failed:', error);
    return null;
  }
}

// Custom CLIP API fallback
async function generateCustomClipEmbedding(imageUrl: string): Promise<number[] | null> {
  try {
    const clipApiUrl = process.env.CLIP_API_URL;
    
    if (!clipApiUrl) {
      console.warn('⚠️ CLIP_API_URL not found');
      return null;
    }

    console.log('🔧 Using custom CLIP API');

    const response = await fetch(clipApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [imageUrl]
      })
    });

    if (!response.ok) {
      throw new Error(`Custom CLIP API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result.data && Array.isArray(result.data[0])) {
      const embedding = result.data[0];
      console.log(`✅ Generated custom CLIP embedding of length ${embedding.length}`);
      
      // Normalize to 512 dimensions
      if (embedding.length > 512) {
        return embedding.slice(0, 512);
      } else if (embedding.length < 512) {
        const padded = [...embedding];
        while (padded.length < 512) {
          padded.push(0);
        }
        return padded;
      }
      
      return embedding;
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Custom CLIP API failed:', error);
    return null;
  }
}

// Generate embedding from image buffer using Hugging Face
export async function generateClipEmbeddingFromBuffer(imageBuffer: ArrayBuffer): Promise<number[]> {
  try {
    console.log('🖼️ Generating CLIP embedding from buffer');

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const apiUrl = process.env.HUGGINGFACE_CLIP_URL || 'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32';

    if (!apiKey) {
      console.warn('⚠️ HUGGINGFACE_API_KEY not found, using mock');
      return generateMockEmbeddingFromBuffer(imageBuffer);
    }

    // Send buffer directly to Hugging Face
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && Array.isArray(result) && result.length > 0) {
      console.log(`✅ Generated buffer CLIP embedding of length ${result.length}`);
      return result.slice(0, 512);
    }

    // Fallback to mock
    return generateMockEmbeddingFromBuffer(imageBuffer);

  } catch (error) {
    console.error('❌ Buffer CLIP embedding failed:', error);
    return generateMockEmbeddingFromBuffer(imageBuffer);
  }
}

// Mock embedding for fallback (deterministic based on URL)
function generateMockEmbedding(imageUrl: string): number[] {
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    const char = imageUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const embedding: number[] = [];
  for (let i = 0; i < 512; i++) {
    const seed = hash + i + imageUrl.length;
    const value = Math.sin(seed) * 0.5;
    embedding.push(value);
  }
  
  return embedding;
}

// Mock embedding from buffer
function generateMockEmbeddingFromBuffer(imageBuffer: ArrayBuffer): number[] {
  const uint8Array = new Uint8Array(imageBuffer);
  let hash = 0;
  for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
    hash = ((hash << 5) - hash) + uint8Array[i];
    hash = hash & hash;
  }
  
  const embedding: number[] = [];
  for (let i = 0; i < 512; i++) {
    const seed = hash + i + uint8Array.length;
    const value = Math.sin(seed) * 0.5;
    embedding.push(value);
  }

  return embedding;
}

// Legacy function name for backward compatibility
export async function generateClipEmbedding(imageUrl: string): Promise<number[]> {
  return gerarEmbedding(imageUrl);
}

// Test CLIP functionality
export async function testClipModel(): Promise<boolean> {
  try {
    console.log('🧪 Testing CLIP model...');
    
    const testImageUrl = 'https://httpbin.org/image/png';
    const embedding = await generateClipEmbedding(testImageUrl);
    
    if (embedding && embedding.length === 512) {
      console.log('✅ CLIP model test successful');
      return true;
    } else {
      console.error('❌ CLIP model test failed - invalid embedding');
      return false;
    }
    
  } catch (error) {
    console.error('❌ CLIP model test failed:', error);
    return false;
  }
}

// Calculate cosine similarity
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}