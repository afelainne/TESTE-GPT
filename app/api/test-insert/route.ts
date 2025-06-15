import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing direct Supabase query...');
    
    // Test direct query to clip_vectors table
    const { data, error, count } = await supabase
      .from('clip_vectors')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        status: 'error',
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Direct query successful:', data?.length, 'records, total:', count);
    
    return NextResponse.json({
      status: 'success',
      message: `Direct query successful - found ${data?.length || 0} records`,
      total_count: count,
      sample_records: data?.map(record => ({
        id: record.id,
        title: record.title,
        image_url: record.image_url?.substring(0, 50) + '...',
        has_embedding: !!record.embedding,
        metadata_type: typeof record.metadata,
        created_at: record.created_at
      })) || []
    });

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    
    return NextResponse.json({
      status: 'error', 
      error: 'Test failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing simple insert...');
    
    // Test simple insert
    const testData = {
      image_url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80',
      source_url: 'https://unsplash.com/test-upload', 
      title: 'Test Upload - ' + new Date().toISOString(),
      embedding: null, // Start with null
      metadata: {
        upload_source: 'vercel_blob',
        test: true,
        created_by: 'api_test'
      }
    };

    const { data, error } = await supabase
      .from('clip_vectors')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({
        status: 'error',
        error: 'Insert failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Insert successful:', data.id);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test insert successful',
      inserted_record: {
        id: data.id,
        title: data.title,
        image_url: data.image_url
      }
    });

  } catch (error) {
    console.error('❌ Insert test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: 'Insert test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}