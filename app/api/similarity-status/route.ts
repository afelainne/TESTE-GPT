import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      methods: {
        supabase_database: { available: false, status: 'unknown', message: '' },
        external_clip_api: { available: false, status: 'unknown', message: '' },
      }
    };

    // Test Supabase database
    try {
      const { clipVectorOperations } = await import('@/lib/supabase');
      const testData = await clipVectorOperations.getAll(1);
      
      if (testData && testData.length > 0) {
        status.methods.supabase_database = {
          available: true,
          status: 'healthy',
          message: `${testData.length} items available`
        };
      } else {
        status.methods.supabase_database = {
          available: false,
          status: 'empty',
          message: 'No data in database'
        };
      }
    } catch (supabaseError) {
      status.methods.supabase_database = {
        available: false,
        status: 'error',
        message: supabaseError instanceof Error ? supabaseError.message : 'Connection failed'
      };
    }

    // Test external CLIP API
    const clipApiUrl = process.env.CLIP_API_URL;
    if (clipApiUrl) {
      try {
        const testResponse = await fetch(clipApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: ['test'] }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (testResponse.ok) {
          status.methods.external_clip_api = {
            available: true,
            status: 'healthy',
            message: 'API responding correctly'
          };
        } else {
          status.methods.external_clip_api = {
            available: false,
            status: 'error',
            message: `HTTP ${testResponse.status}: ${testResponse.statusText}`
          };
        }
      } catch (clipError) {
        status.methods.external_clip_api = {
          available: false,
          status: 'error',
          message: clipError instanceof Error ? clipError.message : 'Connection failed'
        };
      }
    } else {
      status.methods.external_clip_api = {
        available: false,
        status: 'not_configured',
        message: 'CLIP_API_URL not set'
      };
    }

    // Determine overall status
    const overallStatus = status.methods.supabase_database.available || status.methods.external_clip_api.available
      ? 'operational'
      : 'degraded';

    return NextResponse.json({
      ...status,
      overall_status: overallStatus,
      primary_method: status.methods.supabase_database.available ? 'supabase_database' : 
                     status.methods.external_clip_api.available ? 'external_clip_api' : 'none'
    });

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall_status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      methods: {}
    }, { status: 500 });
  }
}