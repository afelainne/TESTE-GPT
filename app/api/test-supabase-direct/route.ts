import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing direct Supabase connection...');
    
    // Test 1: Connection test
    const { data: testData, error: testError } = await supabase
      .from('clip_vectors')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Supabase connection error:', testError);
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        error: testError.message,
        details: testError
      });
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Get all records
    const { data: allRecords, error: fetchError } = await supabase
      .from('clip_vectors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      return NextResponse.json({
        status: 'error',
        message: 'Failed to fetch records',
        error: fetchError.message,
        details: fetchError
      });
    }
    
    console.log('✅ Found', allRecords?.length || 0, 'records in Supabase');
    
    return NextResponse.json({
      status: 'success',
      message: `Supabase working! Found ${allRecords?.length || 0} uploaded images`,
      totalCount: allRecords?.length || 0,
      records: allRecords || [],
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        SUPABASE_KEY: process.env.SUPABASE_KEY ? 'Set' : 'Missing'
      }
    });
    
  } catch (error) {
    console.error('❌ Direct Supabase test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Supabase test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}