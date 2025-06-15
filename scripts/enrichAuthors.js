/**
 * Script para enriquecer autores existentes na tabela clip_vectors
 * Execute: node scripts/enrichAuthors.js
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BATCH_SIZE = 10; // Processar em lotes para evitar rate limiting

async function extractAuthorFromUrl(sourceUrl, imageUrl) {
  console.log(`🔍 Extracting author from: ${sourceUrl}`);
  
  try {
    // Chamar nossa API interna para extrair autor
    const response = await fetch('http://localhost:3000/api/get-author', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceUrl: sourceUrl || imageUrl,
        platform: detectPlatform(sourceUrl || imageUrl)
      })
    });

    if (response.ok) {
      const authorData = await response.json();
      return {
        author_name: authorData.name,
        author_profile_url: authorData.profileUrl,
        author_platform: authorData.platform,
        author_bio: authorData.bio || null,
        author_avatar: authorData.avatar || null,
        enriched_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn(`Failed to extract author from ${sourceUrl}:`, error.message);
  }

  return null;
}

function detectPlatform(url) {
  if (!url) return 'unknown';
  
  if (url.includes('are.na')) return 'arena';
  if (url.includes('pinterest')) return 'pinterest';
  if (url.includes('behance')) return 'behance';
  if (url.includes('dribbble')) return 'dribbble';
  if (url.includes('instagram')) return 'instagram';
  if (url.includes('unsplash')) return 'unsplash';
  
  return 'unknown';
}

async function enrichAuthors() {
  console.log('🚀 Starting author enrichment process...');

  try {
    // Buscar todos os registros sem informações de autor
    const { data: rows, error } = await supabase
      .from('clip_vectors')
      .select('id, image_url, source_url, metadata')
      .is('author_name', null)
      .limit(100); // Limitar para evitar timeout

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    console.log(`📋 Found ${rows.length} records to enrich`);

    if (rows.length === 0) {
      console.log('✅ All records already have author information');
      return;
    }

    let enriched = 0;
    let failed = 0;

    // Processar em lotes
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)}`);

      const promises = batch.map(async (row) => {
        try {
          const authorData = await extractAuthorFromUrl(row.source_url, row.image_url);
          
          if (authorData) {
            const { error: updateError } = await supabase
              .from('clip_vectors')
              .update(authorData)
              .eq('id', row.id);

            if (updateError) {
              console.error(`❌ Failed to update record ${row.id}:`, updateError.message);
              return { success: false, id: row.id };
            }

            console.log(`✅ Enriched author for record ${row.id}: ${authorData.author_name}`);
            return { success: true, id: row.id, author: authorData.author_name };
          } else {
            // Marcar como processado mesmo sem autor encontrado
            await supabase
              .from('clip_vectors')
              .update({ 
                author_name: 'Unknown Creator',
                author_platform: detectPlatform(row.source_url || row.image_url),
                enriched_at: new Date().toISOString()
              })
              .eq('id', row.id);

            return { success: true, id: row.id, author: 'Unknown Creator' };
          }
        } catch (error) {
          console.error(`❌ Failed to process record ${row.id}:`, error.message);
          return { success: false, id: row.id, error: error.message };
        }
      });

      const results = await Promise.all(promises);
      
      // Contar sucessos e falhas
      results.forEach(result => {
        if (result.success) {
          enriched++;
        } else {
          failed++;
        }
      });

      // Pausa entre lotes para ser respeitoso com APIs
      if (i + BATCH_SIZE < rows.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n🎉 Author enrichment completed!`);
    console.log(`✅ Successfully enriched: ${enriched} records`);
    console.log(`❌ Failed to enrich: ${failed} records`);

  } catch (error) {
    console.error('💥 Critical error during enrichment:', error);
    process.exit(1);
  }
}

// Executar o script
enrichAuthors()
  .then(() => {
    console.log('📝 Author enrichment process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });