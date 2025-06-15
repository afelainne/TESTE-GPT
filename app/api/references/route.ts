import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, cleanId } from '@/lib/supabase';

// GET /api/references - Get paginated references for infinite scroll
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = parseInt(searchParams.get('cursor') || '0');
    const pageSize = 15; // Return 15 items per page
    const excludeId = searchParams.get('excludeId'); // Exclude current image
    
    console.log('📖 Fetching references with cursor:', cursor, 'exclude:', excludeId);
    
    // For references API, we keep pagination but with larger page size
    // This allows infinite scroll while avoiding overwhelming the client
    let query = supabaseAdmin
      .from('clip_vectors')
      .select('id, image_url, title, author_name, created_at, source_url')
      .order('created_at', { ascending: false })
      .range(cursor, cursor + pageSize - 1); // Keep pagination for performance
    
    // Exclude the current image if specified
    if (excludeId) {
      const cleanExcludeId = cleanId(excludeId);
      console.log('🔧 Cleaned excludeId:', excludeId, '->', cleanExcludeId);
      query = query.neq('id', cleanExcludeId);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      console.error('❌ References query error:', error);
      throw error;
    }
    
    const hasMore = entries.length === pageSize;
    const nextCursor = hasMore ? cursor + pageSize : null;
    
    console.log(`✅ Fetched ${entries.length} references (hasMore: ${hasMore})`);
    
    return NextResponse.json({
      references: entries.map((entry: any) => ({
        id: entry.id,
        image_url: entry.image_url,
        title: entry.title,
        author_name: entry.author_name || 'Unknown',
        source_url: entry.source_url,
        created_at: entry.created_at
      })),
      nextCursor,
      hasMore,
      success: true
    });
    
  } catch (error) {
    console.error('❌ References API error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      references: [],
      nextCursor: null,
      hasMore: false,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}