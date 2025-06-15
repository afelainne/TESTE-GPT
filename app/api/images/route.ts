import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/images - Paginated images for infinite gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log(`📖 Fetching images - page: ${page}, limit: ${limit}`);
    
    // Calculate range for Supabase
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Fetch images from clip_vectors with pagination
    const { data: images, error, count } = await supabaseAdmin
      .from('clip_vectors')
      .select('id, image_url, title, author_name, created_at, source_url', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);
    
    if (error) {
      console.error('❌ Error fetching images:', error);
      throw error;
    }
    
    const totalImages = count || 0;
    const hasMore = Boolean(images && images.length === limit);
    
    console.log(`✅ Fetched ${images?.length || 0} images (page ${page}), hasMore: ${hasMore}, total: ${totalImages}`);
    
    return NextResponse.json({
      images: (images || []).map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        title: img.title || 'Untitled',
        author: img.author_name || 'Unknown',
        sourceUrl: img.source_url || img.image_url,
        createdAt: img.created_at
      })),
      hasMore,
      totalCount: totalImages,
      currentPage: page,
      success: true
    });
    
  } catch (error) {
    console.error('❌ Error in images API:', error);
    
    return NextResponse.json({
      images: [],
      hasMore: false,
      totalCount: 0,
      currentPage: 1,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}