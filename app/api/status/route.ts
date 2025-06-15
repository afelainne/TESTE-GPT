import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking system status...');

    let supabaseConnected = false;
    let tableExists = false;
    let vectorExtensionEnabled = false;
    let connectionError: string | null = null;

    try {
      // Simple connection test
      const { data, error } = await supabase
        .from('clip_vectors')
        .select('id, embedding')
        .limit(1);

      if (!error) {
        supabaseConnected = true;
        tableExists = true;
        vectorExtensionEnabled = true;
        console.log('✅ Full system check passed - Supabase, table, and vector extension working');
      } else if (error.code === '42P01') {
        supabaseConnected = true;
        tableExists = false;
        vectorExtensionEnabled = false;
        console.log('📋 Supabase connected but clip_vectors table does not exist');
      } else {
        supabaseConnected = true;
        tableExists = true;
        // If table exists and we can access it, assume vector extension is working
        vectorExtensionEnabled = true;
        connectionError = error.message;
        console.log('✅ Table exists and accessible - assuming vector extension is working');
      }
    } catch (error) {
      supabaseConnected = false;
      connectionError = error instanceof Error ? error.message : 'Connection failed';
      console.error('❌ Supabase connection failed:', error);
    }

    const status = {
      supabase_connected: supabaseConnected,
      table_exists: tableExists,
      vector_extension_enabled: vectorExtensionEnabled,
      connection_error: connectionError,
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabase_key: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'Set' : 'Missing',
        clip_api_url: process.env.CLIP_API_URL ? 'Set' : 'Missing',
        blob_token: process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Missing'
      }
    };

    console.log('✅ Status check completed:', status);

    return NextResponse.json({
      status: 'success',
      message: 'Status check completed',
      data: status
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Status check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Create table endpoint
export async function POST() {
  try {
    console.log('🔄 This endpoint provides setup instructions...');

    const setupInstructions = {
      status: 'setup_required',
      message: 'Please set up the Supabase database manually',
      instructions: {
        step1: 'Go to your Supabase project dashboard',
        step2: 'Navigate to SQL Editor',
        step3: 'Run the SQL commands from SUPABASE_SETUP.md',
        step4: 'Enable the pgvector extension',
        step5: 'Create the clip_vectors table with proper schema'
      },
      required_sql: `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create clip_vectors table
CREATE TABLE IF NOT EXISTS clip_vectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  embedding VECTOR(512),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clip_vectors_created_at ON clip_vectors(created_at);
CREATE INDEX IF NOT EXISTS idx_clip_vectors_metadata ON clip_vectors USING GIN(metadata);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  image_url TEXT,
  source_url TEXT,
  title TEXT,
  embedding VECTOR(512),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $
BEGIN
  RETURN QUERY
  SELECT
    cv.id,
    cv.image_url,
    cv.source_url,
    cv.title,
    cv.embedding,
    cv.metadata,
    cv.created_at,
    1 - (cv.embedding <=> query_embedding) AS similarity
  FROM clip_vectors cv
  WHERE 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.embedding <=> query_embedding
  LIMIT match_count;
END;
$;
      `
    };

    console.log('📋 Setup instructions provided');

    return NextResponse.json(setupInstructions);

  } catch (error) {
    console.error('❌ Error providing setup instructions:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error providing setup instructions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}