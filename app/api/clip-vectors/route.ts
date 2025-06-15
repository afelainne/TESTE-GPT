import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'full' for admin panel
    
    console.log('🖼️ Fetching from clip_vectors table, format:', format);
    
    if (format === 'full') {
      // Return UNLIMITED full data for admin panel (most recent first)
      const { data: entries, error } = await supabaseAdmin
        .from('clip_vectors')
        .select('*')
        .order('created_at', { ascending: false }); // Newest uploads first - NO LIMIT
      
      if (error) {
        console.error('❌ Supabase clip_vectors query error:', error);
        return NextResponse.json({ 
          error: error.message,
          success: false 
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        items: entries || [],
        total: entries?.length || 0
      });
    } else {
      // Return ALL URLs without pagination - completely unlimited
      const { data: entries, error } = await supabaseAdmin
        .from('clip_vectors')
        .select('id, image_url, title, author_name, created_at, source_url')
        .order('created_at', { ascending: false }); // Newest uploads FIRST - UNLIMITED RECORDS

      if (error) {
        console.error('❌ Supabase clip_vectors query error:', error);
        return NextResponse.json({ 
          error: error.message,
          success: false 
        }, { status: 500 });
      }

      if (!entries || entries.length === 0) {
        console.log('📊 No records found in clip_vectors table');
        return NextResponse.json({ 
          items: [],
          hasMore: false,
          success: true,
          message: 'No images found'
        });
      }

      // Transform ALL entries to complete items - NO LIMITS
      const items = entries
        .filter(record => record.image_url) // Only include records with valid image URLs
        .map((record, index) => ({
          id: `clip_vector_${record.id}`,
          title: record.title || `Image ${index + 1}`,
          imageUrl: record.image_url,
          description: `Image from ${record.source_url || 'Arena'}`,
          category: 'inspiration',
          tags: ['arena', 'clip_vectors'],
          author: record.author_name || 'Arena Community',
          likes: Math.floor(Math.random() * 100) + 1,
          isLiked: false,
          createdAt: record.created_at || new Date().toISOString(),
          colors: [],
          platform: 'arena',
          source: record.source_url || 'arena',
          visualStyle: {
            composition: 'creative',
            colorTone: 'varied',
            shapes: 'mixed',
            mood: 'inspiring'
          }
        }));

      console.log(`✅ Successfully fetched ALL ${items.length} image items from clip_vectors (UNLIMITED)`);

      return NextResponse.json({ 
        items, // Frontend expects 'items' not 'urls'
        hasMore: false, // All data returned at once - no pagination
        success: true,
        total: items.length,
        unlimited: true // Flag to indicate unlimited response
      });
    }

  } catch (error) {
    console.error('❌ Clip vectors API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

// POST /api/clip-vectors - Insert new vector (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_url, title, author_name, embedding } = body;

    if (!image_url) {
      return NextResponse.json({
        success: false,
        error: 'image_url is required'
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .insert([{
        image_url,
        title: title || 'Untitled',
        author_name: author_name || 'Unknown',
        embedding: embedding || null,
        metadata: { source: 'api_upload', timestamp: new Date().toISOString() }
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert vector',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Vector inserted successfully:', data.id);

    return NextResponse.json({
      success: true,
      vector: data,
      message: 'Vector inserted successfully'
    });

  } catch (error) {
    console.error('❌ Insert API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process insert request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}