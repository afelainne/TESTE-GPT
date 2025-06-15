import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking current table schema...');

    // Get a sample record to see current column structure
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('clip_vectors')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Sample query failed:', sampleError);
      return NextResponse.json({
        success: false,
        error: 'Sample query failed',
        details: sampleError.message
      }, { status: 500 });
    }

    // Get column information from information_schema
    const { data: columnData, error: columnError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'clip_vectors')
      .eq('table_schema', 'public');

    if (columnError) {
      console.log('⚠️ Could not query information_schema, using sample data');
    }

    console.log('✅ Schema check completed');

    return NextResponse.json({
      success: true,
      message: 'Schema check completed',
      sample_record: sampleData?.[0] || null,
      sample_record_keys: sampleData?.[0] ? Object.keys(sampleData[0]) : [],
      columns: columnData || null,
      total_records: sampleData?.length || 0
    });

  } catch (error) {
    console.error('❌ Schema check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}