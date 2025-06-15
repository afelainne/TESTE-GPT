const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const arenaToken = process.env.ARENA_ACCESS_TOKEN;

console.log('🔧 Environment Check:', {
  supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
  supabaseKey: supabaseKey ? 'Set' : 'Missing',
  openaiKey: openaiKey ? 'Set' : 'Missing',
  arenaToken: arenaToken ? 'Set' : 'Missing'
});

// Check if we're in demo mode
const isDemoMode = supabaseUrl?.includes('demo.supabase.co') || supabaseKey?.includes('demo_');

if (isDemoMode) {
  console.log('🎭 Demo mode detected - will simulate operations');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function gerarEmbedding(imageUrl) {
  console.log('🎭 Demo mode - simulating embedding generation for:', imageUrl);
  // Return a deterministic mock embedding based on URL
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = ((hash << 5) - hash) + imageUrl.charCodeAt(i);
    hash = hash & hash;
  }
  
  const embedding = Array.from({ length: 512 }, (_, i) => {
    const seed = hash + i;
    return Math.sin(seed) * 0.5; // Normalized to [-0.5, 0.5]
  });
  
  console.log(`✅ Generated mock embedding (${embedding.length} dimensions)`);
  return embedding;
}

async function enrichWithAuthor(id, arenaId) {
  if (!arenaToken || arenaToken.includes('demo_')) {
    console.log('🎭 Demo mode - simulating author enrichment for Arena ID:', arenaId);
    return {
      author_name: 'Demo Author',
      author_profile_url: 'https://are.na/demo-author'
    };
  }

  try {
    console.log('🔄 Fetching author info for Arena block:', arenaId);
    // For demo mode, just use fetch without external dependencies
    const response = await fetch(`https://api.are.na/v2/blocks/${arenaId}`, {
      headers: { 
        'Authorization': `Bearer ${arenaToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Arena API error ${response.status} for block ${arenaId}`);
      return {
        author_name: 'Are.na Community',
        author_profile_url: null
      };
    }
    
    const json = await response.json();
    const user = json.user || json.created_by || {};
    
    const authorData = {
      author_name: user.full_name || user.username || 'Are.na Community',
      author_profile_url: user.channel_url || `https://are.na/${user.slug}` || null
    };
    
    console.log(`✅ Enriched author: ${authorData.author_name}`);
    return authorData;
  } catch (error) {
    console.warn(`⚠️ Failed to enrich author for Arena ID ${arenaId}:`, error.message);
    return {
      author_name: 'Are.na Community',
      author_profile_url: null
    };
  }
}

async function main() {
  try {
    console.log('🚀 Starting embedding and author enrichment process...');
    
    if (isDemoMode) {
      console.log('🎭 Running in demo mode - will simulate all operations');
      console.log('✅ Demo operations completed successfully');
      return;
    }
    
    // Fetch all records without embedding or without author_name
    console.log('📊 Fetching records that need enrichment...');
    const { data: rows, error } = await supabase
      .from('clip_vectors')
      .select('id, image_url, metadata, embedding, author_name')
      .or('embedding.is.null,author_name.is.null')
      .limit(50); // Process in batches to avoid timeout
    
    if (error) {
      console.error('❌ Error fetching records:', error);
      return;
    }
    
    if (!rows || rows.length === 0) {
      console.log('✅ No records need enrichment - all records already have embeddings and authors');
      return;
    }
    
    console.log(`📦 Found ${rows.length} records that need enrichment`);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`\n🔄 Processing ${i + 1}/${rows.length}: ${row.id}`);
      
      const updates = {};
      let needsUpdate = false;
      
      // 1) Generate embedding if missing
      if (!row.embedding) {
        console.log('  📍 Missing embedding - generating...');
        const embedding = await gerarEmbedding(row.image_url);
        if (embedding) {
          updates.embedding = embedding;
          needsUpdate = true;
        }
      } else {
        console.log('  ✓ Embedding already exists');
      }
      
      // 2) Enrich author if missing and Arena ID exists
      if (!row.author_name && row.metadata?.arena_id) {
        console.log('  📍 Missing author - enriching...');
        const { author_name, author_profile_url } = await enrichWithAuthor(
          row.id,
          row.metadata.arena_id
        );
        updates.author_name = author_name;
        updates.author_profile_url = author_profile_url;
        needsUpdate = true;
      } else if (!row.author_name) {
        console.log('  📍 Missing author but no Arena ID - setting default');
        updates.author_name = 'Unknown';
        updates.author_profile_url = null;
        needsUpdate = true;
      } else {
        console.log('  ✓ Author already exists');
      }
      
      // 3) Update record if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('clip_vectors')
          .update(updates)
          .eq('id', row.id);
        
        if (updateError) {
          console.error(`  ❌ Failed to update ${row.id}:`, updateError);
        } else {
          console.log(`  ✅ Updated ${row.id} successfully`);
        }
      } else {
        console.log('  ⏭️ No updates needed');
      }
      
      // Rate limiting - wait between requests
      if (i < rows.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n🎉 Enrichment process completed!');
    
    // Final statistics
    const { data: finalStats } = await supabase
      .from('clip_vectors')
      .select('id, embedding, author_name')
      .not('embedding', 'is', null)
      .not('author_name', 'is', null);
    
    console.log(`📊 Final stats: ${finalStats?.length || 0} records with both embeddings and authors`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);