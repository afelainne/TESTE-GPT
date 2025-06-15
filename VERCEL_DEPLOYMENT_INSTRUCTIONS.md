# 🚀 **INSTRUÇÕES PARA DEPLOYMENT VIA VERCEL CLI**

## ✅ **STATUS ATUAL**
- **Sistema funcionando** em modo demo (Supabase em placeholder)
- **APIs funcionais**: Arena OAuth, Colormind, Find-Similar
- **Mobile otimizado** com botões corretos
- **Script de enriquecimento** pronto para produção

---

## 🔧 **COMANDOS VERCEL CLI PARA PRODUÇÃO**

### **1. Listar Deployments Atuais:**
```bash
cd /seu-projeto
npx vercel ls
```
*Identifique a URL do deployment mais recente (ex: `unbserved-abc123.vercel.app`)*

### **2. Alias do Domínio Custom:**
```bash
# Substitua 'abc123' pelo ID do seu deployment mais recente
npx vercel alias set unbserved-abc123.vercel.app unbserved.com
npx vercel alias set unbserved-abc123.vercel.app www.unbserved.com
```

### **3. Verificar Status:**
```bash
npx vercel ls --scope=seu-team
npx vercel domains ls
```

### **4. Force Deploy (se necessário):**
```bash
npx vercel --prod
```

---

## 🌐 **CONFIGURAÇÕES ENVIRONMENT VARIABLES VERCEL**

**Acesse: Vercel Dashboard → Project → Settings → Environment Variables**

### **✅ Confirme estas variáveis:**
```env
# Supabase (PRODUÇÃO - substituir valores demo)
SUPABASE_URL=https://sua-instancia.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_real
SUPABASE_ANON_KEY=seu_anon_key_real

# OpenAI (Para embeddings)
OPENAI_API_KEY=sk-seu_openai_key_real

# Arena OAuth (CORRETO)
ARENA_CLIENT_ID=Bkg__GV91PWX8HjISG8FHCoUVxmd-8IRvMujD0g-HLE
ARENA_CLIENT_SECRET=96p62vl0xIkXRpWBnTi0npnqD1-ChWmdqP7ctuvE6Jk
ARENA_REDIRECT_URI=https://unbserved.com/api/auth/callback
ARENA_ACCESS_TOKEN=lVtuGdUG4m2SM0Yvmtco7CG_lTq4wqbWammJY5eqCu0

# Vercel Blob (OK)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_HkQcP7AZz2yYcmHr_rtCvnhWn2RwYvLjGP0VX1OBToAgEym

# CLIP API (OK)
CLIP_API_URL=https://macaly-clip.hf.space/run/predict
```

---

## 🗄️ **SUPABASE CONFIGURAÇÃO**

### **📋 Schema da Tabela `clip_vectors`:**
```sql
CREATE TABLE clip_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Unknown',
  author_profile_url TEXT,
  embedding VECTOR(512), -- pgvector extension
  metadata JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clip_vectors_embedding ON clip_vectors USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_clip_vectors_author ON clip_vectors (author_name);
CREATE INDEX idx_clip_vectors_status ON clip_vectors (processing_status);
```

### **🔧 Função de Similaridade:**
```sql
CREATE OR REPLACE FUNCTION match_vectors(
  query_embedding VECTOR(512),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  title TEXT,
  author_name TEXT,
  author_profile_url TEXT,
  similarity FLOAT
)
LANGUAGE sql
AS $$
SELECT 
  cv.id,
  cv.image_url,
  cv.title,
  cv.author_name,
  cv.author_profile_url,
  1 - (cv.embedding <=> query_embedding) AS similarity
FROM clip_vectors cv
WHERE cv.embedding IS NOT NULL
  AND (1 - (cv.embedding <=> query_embedding)) > match_threshold
ORDER BY cv.embedding <=> query_embedding
LIMIT match_count;
$$;
```

---

## 🧪 **TESTE FINAL PÓS-DEPLOYMENT**

### **1. URLs para Testar:**
```bash
curl https://unbserved.com/api/status
curl https://unbserved.com/api/test-colormind
curl https://unbserved.com/api/arena-auth-url
```

### **2. Script de Enriquecimento (Produção):**
```bash
# Após deployment, rode localmente com env vars corretas:
SUPABASE_URL=sua_url SUPABASE_SERVICE_ROLE_KEY=sua_key node scripts/fillEmbeddingsAndAuthors.js
```

### **3. Verificações Visuais:**
- ✅ Logo e navegação mobile
- ✅ Modal de imagem com paleta de cores
- ✅ Similaridade funcionando
- ✅ Login Arena OAuth
- ✅ Upload de imagens

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Execute comandos Vercel CLI** para alias do domínio
2. **Configure variáveis de ambiente** com valores reais do Supabase
3. **Rode script de enriquecimento** para preencher dados
4. **Teste todas as funcionalidades** em produção

**Status: 🟢 PRONTO PARA PRODUÇÃO COM DOMÍNIO CUSTOM**