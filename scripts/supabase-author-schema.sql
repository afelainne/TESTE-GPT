-- Script para adicionar colunas de autor na tabela clip_vectors
-- Execute no SQL Editor do Supabase

ALTER TABLE clip_vectors 
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_profile_url TEXT,
  ADD COLUMN IF NOT EXISTS author_platform TEXT,
  ADD COLUMN IF NOT EXISTS author_bio TEXT,
  ADD COLUMN IF NOT EXISTS author_avatar TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índice para melhor performance nas consultas de autor
CREATE INDEX IF NOT EXISTS idx_clip_vectors_author_name ON clip_vectors(author_name);

-- Comentário da tabela
COMMENT ON COLUMN clip_vectors.author_name IS 'Nome do autor da imagem extraído da plataforma de origem';
COMMENT ON COLUMN clip_vectors.author_profile_url IS 'URL do perfil do autor na plataforma';
COMMENT ON COLUMN clip_vectors.author_platform IS 'Plataforma de origem (Arena, Pinterest, etc)';
COMMENT ON COLUMN clip_vectors.author_bio IS 'Bio/descrição do autor';
COMMENT ON COLUMN clip_vectors.author_avatar IS 'URL do avatar do autor';
COMMENT ON COLUMN clip_vectors.enriched_at IS 'Timestamp de quando os dados do autor foram enriquecidos';