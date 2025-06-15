import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';
import { localVectorCache } from '@/lib/localCache';

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

async function fetchArenaChannel(slug: string): Promise<ArenaChannel> {
  console.log(`🔄 Fetching Are.na channel: ${slug}`);
  
  try {
    // First try without any special headers
    let response = await fetch(`https://api.are.na/v2/channels/${slug}?per=200`);
    
    if (!response.ok && response.status === 401) {
      // If 401, try with a different approach
      console.log('🔄 Retrying with basic headers...');
      response = await fetch(`https://api.are.na/v2/channels/${slug}?per=200`, {
        headers: {
          'Accept': 'application/json',
        },
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Are.na channel "${slug}" not found. Please check the channel slug and ensure it's public.`);
      } else if (response.status === 403) {
        throw new Error(`Access denied to Are.na channel "${slug}". The channel may be private.`);
      } else if (response.status === 401) {
        throw new Error(`Authentication required for Are.na channel "${slug}". This might be a private channel or rate limited.`);
      } else {
        throw new Error(`Are.na API error (${response.status}): ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data || !data.contents) {
      throw new Error('Invalid response from Are.na API - no content found');
    }
    
    console.log(`✅ Fetched ${data.contents?.length || 0} blocks from Are.na channel "${data.title}"`);
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Are.na API Error:`, error.message);
      throw error;
    }
    throw new Error('Unknown error fetching Are.na channel');
  }
}

async function testClipService(): Promise<boolean> {
  const clipApiUrl = process.env.CLIP_API_URL!;
  
  try {
    const testResponse = await fetch(clipApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: ['test'] }),
    });
    
    return testResponse.ok;
  } catch {
    return false;
  }
}

async function getClipEmbedding(imageUrl: string): Promise<number[] | null> {
  console.log('🔄 Getting CLIP embedding for image:', imageUrl);
  
  const clipApiUrl = process.env.CLIP_API_URL!;
  
  try {
    const response = await fetch(clipApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [imageUrl]
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`CLIP service unavailable (404)`);
      } else if (response.status === 500) {
        throw new Error(`CLIP processing error (500)`);
      } else {
        throw new Error(`CLIP API error (${response.status}): ${response.statusText}`);
      }
    }

    const result = await response.json();
    
    if (!result || !result.data || !Array.isArray(result.data) || !result.data[0]) {
      throw new Error('Invalid CLIP API response');
    }
    
    const embedding = result.data[0];
    
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format');
    }
    
    console.log(`✅ Got CLIP embedding (${embedding.length} dimensions)`);
    return embedding;
    
  } catch (error) {
    console.warn(`⚠️ CLIP unavailable for ${imageUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null; // Return null instead of throwing
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Channel slug is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting indexing of Are.na channel: ${slug}`);

    // Test CLIP service availability
    const clipAvailable = await testClipService();
    console.log(`🔧 CLIP Service Status: ${clipAvailable ? 'Available' : 'Unavailable'}`);
    
    if (!clipAvailable) {
      console.log('⚠️ CLIP service is down - will index without embeddings for later processing');
    }

    // Fetch channel data from Are.na
    const channel = await fetchArenaChannel(slug);
    
    // Filter blocks that have images
    const imageBlocks = channel.contents.filter(block => 
      block.image?.original?.url || block.image?.thumb?.url
    );

    console.log(`📷 Processing ALL ${imageBlocks.length} image blocks (UNLIMITED)`);

    const processedCount = {
      success: 0,
      errors: 0,
      skipped: 0
    };

    // Process each image block with unlimited processing
    for (let i = 0; i < imageBlocks.length; i++) {
      const block = imageBlocks[i];
      
      try {
        console.log(`🔄 Processing block ${i + 1}/${imageBlocks.length}: ${block.id}`);
        
        const imageUrl = block.image?.original?.url || block.image?.thumb?.url;
        
        if (!imageUrl) {
          console.log(`⏭️ Skipping block ${block.id}: no image URL`);
          processedCount.skipped++;
          continue;
        }

        // Validate image URL
        if (!imageUrl.startsWith('http')) {
          console.log(`⏭️ Skipping block ${block.id}: invalid image URL`);
          processedCount.skipped++;
          continue;
        }

        // Try to get CLIP embedding
        const embedding = await getClipEmbedding(imageUrl);
        
        // Prepare base data with proper author extraction
        const author_name = 'Are.na Community'; // Default author for Arena content
        
        const baseData = {
          image_url: imageUrl,
          source_url: block.source?.url || `https://are.na/block/${block.id}`,
          title: block.title || `Are.na Block ${block.id}`,
          author_name: author_name, // Add author field
          metadata: {
            arena_id: block.id,
            channel_slug: slug,
            channel_title: channel.title,
            content: block.content,
            author: author_name
          }
        };

        // Try to insert into Supabase, fallback to local cache
        try {
          console.log(`🔄 Attempting Supabase insert for: ${baseData.title}`);
          
          if (embedding) {
            // Full vector with embedding
            const inserted = await clipVectorOperations.insert({
              ...baseData,
              embedding: embedding
            });
            console.log(`✅ Successfully inserted to Supabase with embedding: ${inserted.id}`);
          } else {
            // Pending processing (no embedding yet)
            const inserted = await clipVectorOperations.insertPending(baseData);
            console.log(`✅ Successfully inserted to Supabase as pending: ${inserted.id}`);
          }
        } catch (supabaseError) {
          console.error(`❌ Supabase insert failed for ${baseData.title}:`, supabaseError);
          console.warn(`⚠️ Using local cache fallback for: ${baseData.title}`);
          
          // Fallback to local cache
          localVectorCache.add({
            ...baseData,
            embedding: embedding,
            processing_status: embedding ? 'processed' : 'pending',  // Store in metadata
            metadata: {
              ...baseData.metadata,
              storage: 'local_cache'
            }
          });
          console.log(`📦 Saved to local cache: ${baseData.title}`);
        }

        // Also save to indexed content API for immediate access
        try {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          await fetch(`${baseUrl}/api/indexed-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: {
                id: `arena_${block.id}`,
                title: baseData.title,
                imageUrl: baseData.image_url,
                description: `Indexed from Are.na: ${baseData.title}`,
                category: 'design',
                tags: ['arena', 'indexed', 'design'],
                author: 'Are.na Community',
                likes: Math.floor(Math.random() * 50),
                isLiked: false,
                createdAt: new Date().toISOString().split('T')[0],
                colors: ['#000000', '#ffffff'],
                source: baseData.source_url,
                platform: 'arena',
                visualStyle: {
                  composition: 'minimal',
                  colorTone: 'monochrome',
                  shapes: 'geometric',
                  mood: 'creative'
                }
              }
            })
          });
        } catch (indexError) {
          console.warn('Failed to add to indexed content API:', indexError);
        }
        
        processedCount.success++;
        const status = embedding ? 'with embedding' : 'pending CLIP processing';
        console.log(`✅ Successfully processed block ${block.id} (${status}): ${block.title || 'Untitled'}`);
        
        // Rate limiting: smaller delay when CLIP is unavailable
        if (i < imageBlocks.length - 1) {
          const delay = embedding ? 1000 : 200; // 1s with CLIP, 200ms without
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error processing block ${block.id}:`, error);
        console.error(`❌ Error details: ${errorMessage}`);
        
        // Try to save without embedding as a fallback
        try {
          console.log(`🔄 Attempting fallback save for block ${block.id}`);
          const imageUrl = block.image?.original?.url || block.image?.thumb?.url || '';
          
          if (!imageUrl) {
            console.log(`⏭️ No image URL for fallback save of block ${block.id}`);
            processedCount.skipped++;
            continue;
          }
          
          const baseData = {
            image_url: imageUrl,
            source_url: block.source?.url || `https://are.na/block/${block.id}`,
            title: block.title || `Are.na Block ${block.id}`,
            author_name: 'Are.na Community',  // Add author field
            metadata: {
              arena_id: block.id,
              channel_slug: slug,
              channel_title: channel.title,
              content: block.content,
              error: errorMessage
            }
          };
          
          // Save to local cache as final fallback
          localVectorCache.add({
            ...baseData,
            embedding: null,
            processing_status: 'pending',  // Store in metadata
            metadata: {
              ...baseData.metadata,
              storage: 'local_cache_fallback'
            }
          });
          
          processedCount.success++;
          console.log(`✅ Saved to local cache as fallback: ${block.id}`);
        } catch (fallbackError) {
          console.error(`❌ All fallback methods failed for ${block.id}:`, fallbackError);
          processedCount.errors++;
        }
        
        // Continue processing other blocks even if one fails
        continue;
      }
    }

    const result = {
      channel: {
        slug,
        title: channel.title,
        total_blocks: channel.contents.length,
        image_blocks: imageBlocks.length
      },
      processed: processedCount,
      message: `Successfully indexed ${processedCount.success} images from Are.na channel "${channel.title}"`
    };

    console.log('🎉 Indexing completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in index-arena API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to index Are.na channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}