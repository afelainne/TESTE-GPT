import { NextResponse } from 'next/server';

// GET /api/arena-auth-url - Securely generate Arena OAuth URL
export async function GET() {
  try {
    console.log('🔗 Generating Arena OAuth URL...');
    
    // Access sensitive credentials only on server-side
    const clientId = process.env.ARENA_CLIENT_ID;
    const redirectUri = process.env.ARENA_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      console.error('❌ Missing Arena OAuth configuration');
      return NextResponse.json(
        { error: 'Arena OAuth not configured' },
        { status: 500 }
      );
    }
    
    // Build OAuth URL safely on server
    const authUrl = `https://dev.are.na/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    console.log('✅ Arena OAuth URL generated successfully');
    
    return NextResponse.json({ 
      authUrl,
      message: 'Arena OAuth URL generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error generating Arena OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}