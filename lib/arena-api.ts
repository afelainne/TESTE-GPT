"use client";

// Arena API configuration
const ARENA_API_BASE = 'https://api.are.na/v2';

interface ArenaBlock {
  id: number;
  title: string;
  content: string;
  image?: {
    original?: {
      url: string;
    };
    thumb?: {
      url: string;
    };
  };
  source?: {
    url: string;
  };
}

interface ArenaChannel {
  title: string;
  contents: ArenaBlock[];
}

// List of known working public Arena channels
const WORKING_CHANNELS = [
  'arena-influences', 
  'good-channels-v9gpzzrfl4s',
  'examples-cshgve6lmuy',
  'featured-channels-c1f30sunbl4',
  'graphic-design',
  'typography',
  'web-design'
];

export async function testArenaAPI(slug: string): Promise<{ success: boolean; data?: ArenaChannel; error?: string }> {
  try {
    console.log(`🔄 Testing Are.na channel: ${slug}`);
    
    const response = await fetch(`${ARENA_API_BASE}/channels/${slug}?per=20`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UNBSERVED-Platform/1.0'
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Arena API error (${response.status}): ${response.statusText}`
      };
    }

    const data = await response.json();
    
    if (!data || !data.contents) {
      return {
        success: false,
        error: 'Invalid response from Are.na API'
      };
    }

    console.log(`✅ Successfully fetched ${data.contents?.length || 0} blocks from channel "${data.title}"`);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Arena API test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getWorkingArenaChannel(): Promise<{ success: boolean; data?: ArenaChannel; slug?: string; error?: string }> {
  console.log('🔍 Finding a working Are.na channel...');
  
  for (const slug of WORKING_CHANNELS) {
    const result = await testArenaAPI(slug);
    if (result.success && result.data) {
      console.log(`✅ Found working channel: ${slug}`);
      return {
        success: true,
        data: result.data,
        slug: slug
      };
    }
    
    // Wait a bit between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return {
    success: false,
    error: 'No working Are.na channels found'
  };
}