import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Arena OAuth endpoint accessed');
    
    // Check required environment variables
    const clientId = process.env.ARENA_CLIENT_ID;
    const clientSecret = process.env.ARENA_CLIENT_SECRET;
    const redirectUri = process.env.ARENA_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('❌ Missing Arena OAuth environment variables');
      return NextResponse.json({
        success: false,
        error: 'Arena OAuth not configured',
        missing: {
          client_id: !clientId,
          client_secret: !clientSecret,
          redirect_uri: !redirectUri
        }
      }, { status: 500 });
    }
    
    console.log('✅ Arena OAuth environment variables configured');
    
    // Check if this is a callback or initial auth request
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code) {
      // Handle OAuth callback
      console.log('🔄 Processing OAuth callback with code');
      
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://dev.are.na/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        });
        
        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenResponse.status}`);
        }
        
        const tokenData = await tokenResponse.json();
        console.log('✅ Successfully obtained Arena access token');
        
        // Store token and redirect to success page
        const response = NextResponse.redirect(new URL('/admin?arena=success', request.url));
        response.cookies.set('arena_token', tokenData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        
        return response;
        
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        return NextResponse.redirect(new URL('/admin?arena=error', request.url));
      }
    } else {
      // Generate authorization URL
      const authUrl = new URL('https://dev.are.na/oauth/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'public');
      authUrl.searchParams.set('state', Math.random().toString(36).substring(2));
      
      console.log('🔗 Generated Arena authorization URL');
      
      return NextResponse.json({
        success: true,
        auth_url: authUrl.toString(),
        client_id: clientId,
        redirect_uri: redirectUri
      });
    }
    
  } catch (error) {
    console.error('❌ Arena OAuth error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'test') {
      // Test Arena API connection
      const token = request.cookies.get('arena_token')?.value;
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'No Arena token found'
        }, { status: 401 });
      }
      
      const response = await fetch('https://api.are.na/v2/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Arena API test successful');
        
        return NextResponse.json({
          success: true,
          user: userData,
          message: 'Arena API connection successful'
        });
      } else {
        throw new Error(`Arena API test failed: ${response.status}`);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Arena OAuth POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}