-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create clip_vectors table if it doesn't exist
CREATE TABLE IF NOT EXISTS clip_vectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  embedding VECTOR(512),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS clip_vectors_embedding_idx ON clip_vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for deduplication
CREATE INDEX IF NOT EXISTS clip_vectors_image_url_idx ON clip_vectors (image_url);

-- Function to find similar vectors with deduplication
CREATE OR REPLACE FUNCTION match_vectors_dedupe(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  source_url TEXT,
  title TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
  SELECT DISTINCT ON (cv.image_url)
    cv.id,
    cv.image_url,
    cv.source_url,
    cv.title,
    1 - (cv.embedding <=> query_embedding) AS similarity,
    cv.metadata
  FROM clip_vectors cv
  WHERE cv.embedding IS NOT NULL
    AND 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.image_url, cv.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Fallback function for regular similarity search
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  source_url TEXT,
  title TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    cv.id,
    cv.image_url,
    cv.source_url,
    cv.title,
    1 - (cv.embedding <=> query_embedding) AS similarity,
    cv.metadata
  FROM clip_vectors cv
  WHERE cv.embedding IS NOT NULL
    AND 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.embedding <=> query_embedding
  LIMIT match_count;
$$;

