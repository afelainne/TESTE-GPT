# UNBSERVED - Design Platform

Uma plataforma de inspiração visual para designers, focada em curadoria de design, tipografia, branding e criatividade.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Supabase** - Backend completo (Database + Storage + Auth)
- **Vercel KV** - Storage Redis para cache e sessões
- **OpenAI/Hugging Face** - APIs de AI para embeddings CLIP
- **Colormind** - API para geração de paletas de cores
- **Arena API** - Integração com plataforma Are.na

## 🎨 Design System

O projeto utiliza um design system minimalista inspirado no design suíço:

- **Cores**: Swiss palette (branco, preto, tons de cinza)
- **Tipografia**: Fontes geométricas e mono-espaçadas
- **Layout**: Grid system organizado e espaçamento consistente
- **Componentes**: shadcn/ui customizados

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase
- Conta Vercel (para deploy)

### Setup Local

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd unbserved
```

2. **Instale as dependências:**
```bash
npm install
```

> **📝 Nota:** O projeto utiliza `legacy-peer-deps=true` no arquivo `.npmrc` para resolver conflitos de peer dependencies. Esta configuração é necessária para compatibilidade com algumas bibliotecas específicas.

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tjidivtwncamikujcpvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# OpenAI/Hugging Face (para CLIP embeddings)
OPENAI_API_KEY=sua_chave_openai_aqui
HUGGINGFACE_API_KEY=sua_chave_huggingface_aqui

# Arena API
ARENA_CLIENT_ID=seu_client_id_arena
ARENA_CLIENT_SECRET=seu_client_secret_arena
ARENA_ACCESS_TOKEN=seu_token_arena
ARENA_REDIRECT_URI=https://unbserved.com/api/auth/callback

# Vercel KV (opcional, para produção)
KV_URL=sua_kv_url_aqui
KV_REST_API_URL=sua_kv_rest_api_url_aqui
KV_REST_API_TOKEN=seu_kv_rest_api_token_aqui
KV_REST_API_READ_ONLY_TOKEN=seu_kv_readonly_token_aqui
```

4. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

5. **Acesse:** http://localhost:3000

## 🏗️ Build e Deploy

### Build Local
```bash
npm run build
npm start
```

### Deploy no Vercel

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente** no painel do Vercel
3. **Deploy automático** será executado a cada push

> **⚠️ Importante:** Certifique-se de que todas as variáveis de ambiente estão configuradas no Vercel antes do deploy.

## 📁 Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── admin/             # Painel administrativo
│   └── dashboard/         # Dashboard do usuário
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── dashboard/        # Componentes específicos do dashboard
├── lib/                  # Utilitários e configurações
├── hooks/                # React Hooks customizados
├── types/                # Definições TypeScript
├── data/                 # Dados estáticos e mock
└── scripts/              # Scripts utilitários
```

## 🔧 Configurações Importantes

### Peer Dependencies
O projeto utiliza `.npmrc` com `legacy-peer-deps=true` para resolver conflitos de dependências. Isso é necessário devido a incompatibilidades entre algumas bibliotecas específicas do ecossistema React.

### Supabase Schema
O banco de dados Supabase inclui:
- Tabela `clip_vectors` para embeddings de imagem
- Storage bucket `inspirations` para arquivos
- Autenticação integrada

### APIs Disponíveis
- `/api/images` - Listagem de imagens do Supabase Storage
- `/api/clip-vectors` - Dados de embeddings CLIP
- `/api/colormind` - Proxy para geração de paletas
- `/api/find-similar` - Busca por similaridade visual
- `/api/debug-env` - Debug de variáveis de ambiente

## 🎯 Funcionalidades

### Para Usuários
- **Navegação Visual:** Grid infinito de inspirações
- **Busca Inteligente:** Similaridade visual via CLIP
- **Paletas de Cores:** Extração automática com Colormind
- **Coleções:** Organização em pastas personalizadas
- **Social:** Curtidas e salvamentos
- **Responsive:** Design otimizado para mobile

### Para Administradores
- **Upload em Massa:** Interface administrativa
- **Indexação Arena:** Importação automática do Are.na
- **Monitoramento:** Debug de sistema e APIs
- **Análticas:** Estatísticas de uso

## 🔍 Debug e Desenvolvimento

### Environment Checker
O componente `EnvDebugger` (visível apenas em desenvolvimento) mostra o status das variáveis de ambiente em tempo real.

### Logs
O sistema utiliza logging extensivo via `console.log` para facilitar o debug. Os logs são organizados por categorias com emojis identificadores.

### TypeScript
Execute `npm run build` para verificar erros de tipo antes do deploy.

## 📋 TODO / Roadmap

- [ ] Implementar autenticação completa com Supabase Auth
- [ ] Adicionar mais integrações de plataformas (Pinterest, Behance)
- [ ] Melhorar algoritmos de similaridade visual
- [ ] Sistema de tags e categorias avançadas
- [ ] API pública para desenvolvedores
- [ ] PWA e notificações push
- [ ] Analytics avançadas

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para reportar bugs ou solicitar features:
- Abra uma issue no GitHub
- Entre em contato via [unbserved.com](https://unbserved.com)

---

**Desenvolvido com ❤️ para a comunidade de design**