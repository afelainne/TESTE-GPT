import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database status...');
    
    // Use regular count query (no SQL RPC function)
    const { count, error: countError } = await supabaseAdmin
      .from('clip_vectors')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query error:', countError);
      return NextResponse.json({
        error: 'Failed to count records',
        details: countError.message
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${count} total records`);
    
    // Get a sample of all records to verify
    const { data: allRecords, error: allError } = await supabaseAdmin
      .from('clip_vectors')
      .select('id, title, created_at, image_url')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('❌ Sample records query error:', allError);
      return NextResponse.json({
        error: 'Failed to fetch sample records',
        details: allError.message
      }, { status: 500 });
    }
    
    // Check for records with embeddings
    const { count: embeddingCount, error: embeddingError } = await supabaseAdmin
      .from('clip_vectors')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    
    return NextResponse.json({
      total_records: count,
      embedding_records: embeddingCount || 0,
      sample_records: allRecords?.slice(0, 5) || [],
      last_record_date: allRecords?.[0]?.created_at,
      message: `Database contains ${count} total records (${embeddingCount || 0} with embeddings)`,
      method: 'direct_count'
    });
    
  } catch (error) {
    console.error('❌ Database check error:', error);
    
    return NextResponse.json({
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}