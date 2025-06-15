import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase credentials',
        env_check: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
        }
      }, { status: 500 });
    }

    // Test direct connection to Supabase
    console.log('🔍 Testing direct Supabase connection...');
    
    // 1. Test basic table query
    const tableResponse = await fetch(`${supabaseUrl}/rest/v1/clip_vectors?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Table query response status:', tableResponse.status);
    
    if (!tableResponse.ok) {
      const errorText = await tableResponse.text();
      console.error('❌ Table query failed:', errorText);
      
      return NextResponse.json({
        error: 'Supabase table query failed',
        status: tableResponse.status,
        details: errorText,
        test_results: {
          connection: false,
          table_access: false
        }
      }, { status: 500 });
    }

    const tableData = await tableResponse.json();
    console.log('✅ Table query successful:', tableData);

    // 2. Test table structure
    const structureResponse = await fetch(`${supabaseUrl}/rest/v1/?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/vnd.pgrst.object+json'
      }
    });

    let structureInfo = 'Not available';
    if (structureResponse.ok) {
      structureInfo = await structureResponse.text();
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection test completed',
      results: {
        connection: true,
        table_access: true,
        table_data: tableData,
        supabase_url: supabaseUrl.replace(/\/[^\/]*$/, '/***'),
        key_status: supabaseKey ? 'Present' : 'Missing'
      }
    });

  } catch (error) {
    console.error('❌ Supabase test error:', error);
    return NextResponse.json({
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      test_results: {
        connection: false,
        table_access: false
      }
    }, { status: 500 });
  }
}