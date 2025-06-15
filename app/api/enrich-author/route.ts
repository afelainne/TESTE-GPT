import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function extractAuthorFromMetadata(metadata: any, sourceUrl: string): Promise<any> {
  // Try to extract author from metadata first
  if (metadata?.arena_id) {
    try {
      // For Are.na content, we can use the channel information
      return {
        author_name: 'Are.na Community',
        author_platform: 'arena',
        author_profile_url: `https://are.na/channel/${metadata.channel_slug}`,
        enriched_at: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Failed to extract Are.na author:', error);
    }
  }

  // Call our internal API for author extraction
  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/get-author`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceUrl: sourceUrl,
        platform: detectPlatform(sourceUrl)
      })
    });

    if (response.ok) {
      const authorData = await response.json();
      return {
        author_name: authorData.name,
        author_profile_url: authorData.profileUrl,
        author_platform: authorData.platform,
        author_bio: authorData.bio || null,
        author_avatar: authorData.avatar || null,
        enriched_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('Failed to call get-author API:', error);
  }

  // Fallback
  return {
    author_name: 'Unknown Creator',
    author_platform: detectPlatform(sourceUrl),
    enriched_at: new Date().toISOString()
  };
}

function detectPlatform(url: string): string {
  if (!url) return 'unknown';
  
  if (url.includes('are.na')) return 'arena';
  if (url.includes('pinterest')) return 'pinterest';
  if (url.includes('behance')) return 'behance';
  if (url.includes('dribbble')) return 'dribbble';
  if (url.includes('instagram')) return 'instagram';
  if (url.includes('unsplash')) return 'unsplash';
  if (url.includes('supabase') || url.includes('user-upload')) return 'community';
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { vectorId, sourceUrl, metadata } = await request.json();

    console.log(`🔍 Enriching author for vector ${vectorId}`);

    // Extract author information
    const authorData = await extractAuthorFromMetadata(metadata, sourceUrl);

    // Update the clip_vectors record
    const { error } = await supabase
      .from('clip_vectors')
      .update(authorData)
      .eq('id', vectorId);

    if (error) {
      throw new Error(`Failed to update vector: ${error.message}`);
    }

    console.log(`✅ Successfully enriched author for vector ${vectorId}: ${authorData.author_name}`);

    return NextResponse.json({
      success: true,
      author: authorData,
      message: `Author enriched: ${authorData.author_name}`
    });

  } catch (error) {
    console.error('❌ Error enriching author:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Endpoint GET para enriquecer todos os registros sem autor
export async function GET() {
  try {
    console.log('🚀 Starting bulk author enrichment...');

    // Buscar registros sem informações de autor
    const { data: vectors, error } = await supabase
      .from('clip_vectors')
      .select('id, source_url, metadata')
      .is('author_name', null)
      .limit(50); // Processar em lotes

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    console.log(`📋 Found ${vectors.length} vectors to enrich`);

    let enriched = 0;
    let failed = 0;

    // Processar cada vetor
    for (const vector of vectors) {
      try {
        const authorData = await extractAuthorFromMetadata(vector.metadata, vector.source_url);

        const { error: updateError } = await supabase
          .from('clip_vectors')
          .update(authorData)
          .eq('id', vector.id);

        if (updateError) {
          console.error(`❌ Failed to update vector ${vector.id}:`, updateError.message);
          failed++;
        } else {
          console.log(`✅ Enriched vector ${vector.id}: ${authorData.author_name}`);
          enriched++;
        }

        // Pequena pausa para evitar sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Failed to process vector ${vector.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: vectors.length,
      enriched,
      failed,
      message: `Bulk enrichment completed: ${enriched} successful, ${failed} failed`
    });

  } catch (error) {
    console.error('❌ Error in bulk enrichment:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}