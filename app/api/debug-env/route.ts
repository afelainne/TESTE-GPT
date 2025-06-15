import { NextRequest, NextResponse } from 'next/server';

// Environmental Variables Debugging API
export async function GET(request: NextRequest) {
  console.log('🔍 Environment Variables Debug Check...');
  
  try {
    // Server-side environment variables
    const serverEnvs = {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
        `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'Missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Missing',
      HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ? 'Set' : 'Missing'
    };

    // Log for server debugging
    console.log('📊 Server Environment Check:', serverEnvs);

    // Return safe information (no actual keys)
    return NextResponse.json({
      success: true,
      message: 'Environment variables debug check',
      server_environment: {
        supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabase_service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        openai_key_set: !!process.env.OPENAI_API_KEY,
        huggingface_key_set: !!process.env.HUGGINGFACE_API_KEY,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Environment debug error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}