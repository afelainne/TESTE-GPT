import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔐 Arena OAuth callback received');
  console.log('Query params:', req.query);
  console.log('ARENA_REDIRECT_URI:', process.env.ARENA_REDIRECT_URI);

  const { code, error } = req.query;

  if (error) {
    console.error('❌ OAuth error:', error);
    return res.status(400).json({ error: 'OAuth authorization failed' });
  }

  if (!code || typeof code !== 'string') {
    console.error('❌ No authorization code received');
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://dev.are.na/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.ARENA_CLIENT_ID,
        client_secret: process.env.ARENA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.ARENA_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');

    // Set secure HTTP-only cookie
    const cookieOptions = [
      `arena_token=${tokenData.access_token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      'Max-Age=86400' // 24 hours
    ].join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    // Redirect to dashboard or home page
    console.log('🔄 Redirecting to dashboard with arena_token cookie set');
    return res.redirect(302, '/dashboard');

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return res.status(500).json({ error: 'Internal server error during OAuth callback' });
  }
}