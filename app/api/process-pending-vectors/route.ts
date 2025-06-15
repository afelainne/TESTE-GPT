import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';

async function getClipEmbedding(imageUrl: string): Promise<number[]> {
  const clipApiUrl = process.env.CLIP_API_URL!;
  
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
    throw new Error(`CLIP API error (${response.status}): ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result || !result.data || !Array.isArray(result.data) || !result.data[0]) {
    throw new Error('Invalid response from CLIP API');
  }
  
  const embedding = result.data[0];
  
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Invalid embedding format from CLIP API');
  }
  
  return embedding;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Process Pending Vectors...');
    
    // Parse request body safely
    let limit = 50;
    try {
      const body = await request.json();
      limit = body.limit || 50;
    } catch {
      // If no JSON body, use default limit
    }
    
    console.log(`🔄 Processing pending vectors (limit: ${limit})`);

    // Get pending vectors with error handling
    let pendingVectors;
    try {
      pendingVectors = await clipVectorOperations.getPending(limit);
    } catch (error) {
      console.log('⚠️ Unable to fetch pending vectors - likely in demo mode');
      return NextResponse.json({
        message: 'No pending vectors to process (demo mode)',
        processed: { success: 0, errors: 0 },
        total_pending: 0
      });
    }
    
    if (pendingVectors.length === 0) {
      return NextResponse.json({
        message: 'No pending vectors to process',
        processed: { success: 0, errors: 0 },
        total_pending: 0
      });
    }

    console.log(`📝 Found ${pendingVectors.length} pending vectors to process`);

    const processedCount = {
      success: 0,
      errors: 0
    };

    // Process each pending vector
    for (const vector of pendingVectors) {
      try {
        console.log(`🔄 Processing vector ${vector.id}: ${vector.title}`);
        
        // Get CLIP embedding
        const embedding = await getClipEmbedding(vector.image_url);
        
        // Update vector with embedding
        await clipVectorOperations.updateEmbedding(vector.id, embedding);
        
        processedCount.success++;
        console.log(`✅ Successfully processed vector ${vector.id}`);
        
        // Small delay to be respectful to CLIP API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error processing vector ${vector.id}:`, error);
        processedCount.errors++;
      }
    }

    // Check remaining pending with error handling
    let remainingPending = false;
    try {
      const remainingCheck = await clipVectorOperations.getPending(1);
      remainingPending = remainingCheck.length > 0;
    } catch (error) {
      console.log('⚠️ Unable to check remaining pending vectors');
      remainingPending = false;
    }

    const result = {
      message: `Processed ${processedCount.success} pending vectors successfully`,
      processed: processedCount,
      total_pending: pendingVectors.length,
      remaining_pending: remainingPending
    };

    console.log('🎉 Pending vector processing completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in process-pending-vectors API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process pending vectors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}