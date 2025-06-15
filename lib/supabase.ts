import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Supabase Configuration Check:', {
  url: SUPABASE_URL ? 'Set' : 'Missing',
  anonKey: SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  serviceKey: SUPABASE_SERVICE_KEY ? 'Set' : 'Missing'
});

// Utility function to ensure proper UUID format for database queries
export function cleanId(id: string): string {
  if (!id) return id;
  
  // Remove clip_vector_ prefix if present
  const cleaned = id.replace(/^clip_vector_/, '');
  
  // Validate UUID format
  if (!cleaned.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    console.warn('⚠️ Invalid UUID format:', cleaned, 'from original:', id);
  }
  
  return cleaned;
}

// Cliente para uso no browser (somente leitura anônima)
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

// Cliente para uso em rotas API/SSR/SSG (leitura completa e escrita)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
});

// Legacy export for backward compatibility
export const supabase = supabaseAdmin;

// Legacy clipVectorOperations for backward compatibility
export const clipVectorOperations = {
  supabaseAdmin, // Expose supabaseAdmin for direct access
  findSimilar: async (embedding: number[], limit = 10) => {
    console.log('🔍 Searching similar vectors with match_vectors function...');
    const { data, error } = await supabaseAdmin
      .rpc('match_vectors', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: limit
      });
    
    if (error) {
      console.error('❌ match_vectors function error:', error);
      throw error;
    }
    console.log(`✅ Found ${data?.length || 0} similar vectors`);
    return data;
  },
  
  insert: async (record: any) => {
    // Remove processing_status from the record to avoid schema issues
    const { processing_status, ...cleanRecord } = record;
    
    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .insert({
        ...cleanRecord,
        metadata: {
          ...cleanRecord.metadata,
          processing_status: processing_status || 'processed'  // Store in metadata JSON instead
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  insertPending: async (record: any) => {
    // Remove processing_status from the record to avoid schema issues
    const { processing_status, ...cleanRecord } = record;
    
    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .insert({
        ...cleanRecord,
        metadata: {
          ...cleanRecord.metadata,
          processing_status: 'pending'  // Store in metadata JSON instead
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getAll: async (limit?: number) => {
    console.log('🔄 Getting ALL vectors - UNLIMITED MODE');
    let query = supabaseAdmin
      .from('clip_vectors')
      .select('*')
      .order('created_at', { ascending: false });
    
    // NEVER APPLY LIMITS - ALWAYS RETURN ALL RECORDS
    // if (limit && limit > 0) {
    //   query = query.limit(limit);
    // }
    
    const { data, error } = await query;
    
    if (error) throw error;
    console.log(`✅ Retrieved ${data?.length || 0} total vectors (UNLIMITED)`);
    return data;
  },
  
  getPending: async (limit?: number) => {
    console.log('🔄 Getting pending vectors from metadata - UNLIMITED MODE');
    let query = supabaseAdmin
      .from('clip_vectors')
      .select('*')
      .is('embedding', null)  // Get records without embeddings
      .order('created_at', { ascending: false });
    
    // NEVER APPLY LIMITS - ALWAYS RETURN ALL PENDING RECORDS
    // if (limit) {
    //   query = query.limit(limit);
    // }
    
    const { data, error } = await query;
    
    if (error) throw error;
    console.log(`✅ Retrieved ${data?.length || 0} total pending vectors (UNLIMITED)`);
    return data;
  },
  
  updateEmbedding: async (id: string, embedding: number[]) => {
    const cleanedId = cleanId(id);
    
    // Get current record to preserve existing metadata
    const { data: currentRecord } = await supabaseAdmin
      .from('clip_vectors')
      .select('metadata')
      .eq('id', cleanedId)
      .single();
    
    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .update({
        embedding,
        metadata: {
          ...(currentRecord?.metadata || {}),
          processing_status: 'processed'  // Store in metadata JSON instead
        }
      })
      .eq('id', cleanedId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  searchSimilar: async (embedding: number[], limit = 10) => {
    console.log('🔍 Searching similar vectors with match_vectors function...');
    
    try {
      const { data, error } = await supabaseAdmin
        .rpc('match_vectors', {
          query_embedding: embedding,
          match_threshold: 0.1,
          match_count: limit
        });
      
      if (error) {
        console.warn('⚠️ match_vectors RPC failed, trying manual search:', error);
        
        // Fallback: Get all vectors and do manual similarity calculation
        const { data: allVectors, error: fetchError } = await supabaseAdmin
          .from('clip_vectors')
          .select('*')
          .not('embedding', 'is', null)
          .limit(200);
          
        if (fetchError) {
          console.error('❌ Manual fallback failed:', fetchError);
          return [];
        }
        
        // Calculate similarity manually for vectors that have embeddings
        const similarities = allVectors
          .filter(vector => vector.embedding && Array.isArray(vector.embedding))
          .map(vector => {
            const similarity = calculateCosineSimilarity(embedding, vector.embedding);
            return { ...vector, similarity };
          })
          .filter(vector => vector.similarity > 0.2)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
          
        console.log(`✅ Manual similarity search found ${similarities.length} results`);
        return similarities;
      }
      
      console.log(`✅ Found ${data?.length || 0} similar vectors via RPC`);
      return data || [];
    } catch (error) {
      console.error('❌ searchSimilar error:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    const cleanedId = cleanId(id);
    console.log('🔍 Getting vector by ID:', cleanedId);
    
    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .select('*')
      .eq('id', cleanedId)
      .single();
    
    if (error) {
      console.error('❌ Error getting vector by ID:', error);
      return null;
    }
    console.log(`✅ Found vector:`, data?.title);
    return data;
  }
};

// Helper function for cosine similarity calculation
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return isNaN(similarity) ? 0 : similarity;
}

// Types for the clip_vectors table
export interface ClipVector {
  id: string;
  image_url: string;
  source_url: string;
  title: string;
  author_name: string;
  embedding: number[] | null;
  created_at?: string;
  metadata?: {
    processing_status?: 'pending' | 'processed' | 'failed';  // Stored in metadata JSON
    [key: string]: any;
  };
}