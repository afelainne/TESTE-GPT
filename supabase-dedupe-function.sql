-- SQL function for Supabase to search similar vectors with deduplication
-- This function should be created in the Supabase SQL editor

CREATE OR REPLACE FUNCTION match_vectors_dedupe(
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  image_url text,
  source_url text,
  title text,
  similarity float,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT ON (image_url)
    clip_vectors.id,
    clip_vectors.image_url,
    clip_vectors.source_url,
    clip_vectors.title,
    (clip_vectors.embedding <=> query_embedding) * -1 + 1 AS similarity,
    clip_vectors.metadata,
    clip_vectors.created_at
  FROM clip_vectors
  WHERE clip_vectors.embedding IS NOT NULL
    AND (clip_vectors.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY image_url, similarity DESC
  LIMIT match_count;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_vectors_dedupe TO anon, authenticated;