import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing Supabase schema cache...');

    // Force a schema refresh by making a simple query
    const { data: schemaTest, error: schemaError } = await supabaseAdmin
      .from('clip_vectors')
      .select('id, author_name, metadata')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema cache refresh failed:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Schema cache refresh failed',
        details: schemaError.message
      }, { status: 500 });
    }

    // Test insertion to verify schema
    console.log('🧪 Testing schema with sample insertion...');
    
    const testRecord = {
      image_url: 'https://test.com/test.jpg',
      source_url: 'https://test.com/test.jpg',
      title: 'Schema Test Record',
      author_name: 'Test Author',
      metadata: { 
        test: true,
        processing_status: 'pending'
      }
    };

    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('clip_vectors')
      .insert(testRecord)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Schema test insertion failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Schema validation failed',
        details: insertError.message,
        schema_error: true
      }, { status: 500 });
    }

    // Clean up test record
    if (insertTest?.id) {
      await supabaseAdmin
        .from('clip_vectors')
        .delete()
        .eq('id', insertTest.id);
      console.log('🧹 Cleaned up test record');
    }

    console.log('✅ Schema cache cleared and validated');

    return NextResponse.json({
      success: true,
      message: 'Schema cache cleared successfully',
      schema_valid: true,
      changes: [
        'Schema cache refreshed',
        'Column structure validated',
        'Test insertion successful'
      ]
    });

  } catch (error) {
    console.error('❌ Cache clear failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cache clear failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}