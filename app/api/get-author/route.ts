import { NextRequest, NextResponse } from 'next/server';

interface AuthorInfo {
  name: string;
  profileUrl: string;
  avatar?: string;
  bio?: string;
  platform: string;
}

// Cache for author information
const authorCache = new Map<string, AuthorInfo>();

// Utility function to validate URL format
function isValidUrl(string: string): boolean {
  try {
    // Check if it's a basic URL format
    if (!string || typeof string !== 'string') return false;
    
    // Skip validation for internal identifiers like 'user-upload-supabase'
    if (!string.startsWith('http://') && !string.startsWith('https://')) {
      return false;
    }
    
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Extract author information from Arena URL patterns
function extractArenaAuthor(sourceUrl: string): AuthorInfo | null {
  try {
    console.log('🔍 Extracting Arena author from:', sourceUrl);
    
    // Parse Are.na URLs - pattern: https://are.na/user-name/channel-name
    if (sourceUrl.includes('are.na')) {
      const url = new URL(sourceUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 1) {
        const username = pathParts[0];
        
        return {
          name: username.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profileUrl: `https://are.na/${username}`,
          platform: 'Are.na'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to extract Arena author:', error);
    return null;
  }
}

// Extract author from other platforms
function extractAuthorFromUrl(sourceUrl: string): AuthorInfo | null {
  try {
    // Validate URL format first - skip internal identifiers completely
    if (!sourceUrl || typeof sourceUrl !== 'string') {
      console.warn('Invalid or missing source URL for author extraction');
      return null;
    }
    
    // Skip processing of internal identifiers completely
    if (sourceUrl.includes('user-upload') || sourceUrl.includes('supabase') || !sourceUrl.startsWith('http')) {
      console.log('Skipping internal identifier for author extraction:', sourceUrl);
      return null;
    }
    
    if (!isValidUrl(sourceUrl)) {
      console.warn('Invalid URL format for author extraction:', sourceUrl);
      return null;
    }
    
    const url = new URL(sourceUrl);
    const domain = url.hostname.toLowerCase();
    
    // Pinterest
    if (domain.includes('pinterest')) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1 && pathParts[0] !== 'pin') {
        const username = pathParts[0];
        return {
          name: username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profileUrl: `https://pinterest.com/${username}`,
          platform: 'Pinterest'
        };
      }
    }
    
    // Behance
    if (domain.includes('behance')) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1) {
        const username = pathParts[0];
        return {
          name: username.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profileUrl: `https://behance.net/${username}`,
          platform: 'Behance'
        };
      }
    }
    
    // Dribbble
    if (domain.includes('dribbble')) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1) {
        const username = pathParts[0];
        return {
          name: username.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profileUrl: `https://dribbble.com/${username}`,
          platform: 'Dribbble'
        };
      }
    }
    
    // Instagram
    if (domain.includes('instagram')) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1 && pathParts[0] === 'p' && pathParts.length >= 2) {
        // Instagram post URL, try to extract from post
        return {
          name: 'Instagram User',
          profileUrl: sourceUrl,
          platform: 'Instagram'
        };
      }
    }
    
    // Unsplash
    if (domain.includes('unsplash')) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === '@') {
        const username = pathParts[1];
        return {
          name: username.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profileUrl: `https://unsplash.com/@${username}`,
          platform: 'Unsplash'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to extract author from URL:', error);
    return null;
  }
}

// Simulate Arena API call (since we don't have real API access)
async function fetchArenaAuthor(imageId: string, sourceUrl: string): Promise<AuthorInfo | null> {
  try {
    console.log('🔄 Simulating Arena API call for image:', imageId);
    
    // In a real implementation, you would call:
    // const response = await fetch(`https://api.are.na/v2/blocks/${imageId}`);
    
    // For now, extract from URL patterns
    const author = extractArenaAuthor(sourceUrl);
    
    if (author) {
      // Enhance with simulated additional data
      author.bio = `Creative from Are.na community`;
      author.avatar = `https://avatar.are.na/${author.name.toLowerCase().replace(' ', '-')}.jpg`;
    }
    
    return author;
  } catch (error) {
    console.warn('Arena API simulation failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sourceUrl, imageId, platform = 'unknown' } = await request.json();
    
    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'Source URL is required' },
        { status: 400 }
      );
    }
    
    console.log('👤 Author lookup request for:', sourceUrl);
    
    // Check cache first
    const cacheKey = `${sourceUrl}_${imageId}`;
    if (authorCache.has(cacheKey)) {
      const cached = authorCache.get(cacheKey)!;
      console.log('📋 Returning cached author:', cached.name);
      
      return NextResponse.json({
        ...cached,
        cached: true
      });
    }
    
    let author: AuthorInfo | null = null;
    
    // Try Arena API first if it's an Arena image
    if (platform === 'arena' || sourceUrl.includes('are.na')) {
      author = await fetchArenaAuthor(imageId || '', sourceUrl);
    }
    
    // Fallback to URL pattern extraction
    if (!author) {
      author = extractAuthorFromUrl(sourceUrl);
    }
    
    // Final fallback with better handling for invalid URLs
    if (!author) {
      const validUrl = isValidUrl(sourceUrl) ? sourceUrl : '';
      
      // Handle special cases for internal identifiers
      if (sourceUrl.includes('supabase') || sourceUrl.includes('user-upload')) {
        author = {
          name: 'Community Member',
          profileUrl: '/dashboard',
          platform: 'Community'
        };
      } else {
        author = {
          name: 'Unknown Creator',
          profileUrl: validUrl,
          platform: platform || 'Unknown'
        };
      }
    }
    
    // Cache the result
    authorCache.set(cacheKey, author);
    
    console.log(`✅ Author identified: ${author.name} from ${author.platform}`);
    
    return NextResponse.json({
      ...author,
      cached: false,
      extraction_method: author.name === 'Unknown Creator' ? 'fallback' : 'url_pattern'
    });
    
  } catch (error) {
    console.error('❌ Author lookup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Author lookup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: {
          name: 'Unknown Creator',
          profileUrl: '',
          platform: 'Unknown'
        }
      },
      { status: 500 }
    );
  }
}

// GET endpoint for cache info
export async function GET() {
  return NextResponse.json({
    cache_size: authorCache.size,
    supported_platforms: ['Are.na', 'Pinterest', 'Behance', 'Dribbble', 'Instagram', 'Unsplash'],
    message: 'Author Information API - Extract creator details from image sources'
  });
}