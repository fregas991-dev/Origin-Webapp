# ═══════════════════════════════════════════════════
# ORIGEM — Guia de Setup (apague este arquivo depois)
# ═══════════════════════════════════════════════════

## ❌ Problema 1: SQL do Supabase

O SQL Editor do Supabase às vezes engasga com múltiplos statements.
Rode UM POR VEZ assim:

### Passo 1 — Criar tabela

Cole SÓ isto e clique Run:

CREATE TABLE origens (
  cache_key TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  dados JSONB NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

### Passo 2 — Criar índice 1

Cole SÓ isto e clique Run:

CREATE INDEX idx_origens_titulo ON origens (titulo);

### Passo 3 — Criar índice 2

Cole SÓ isto e clique Run:

CREATE INDEX idx_origens_artista ON origens (artista);


## ❌ Problema 2: Supabase Service Role Key

A chave que você achou (sb_secret_...) é a SENHA DO BANCO, não a API key.

### Onde encontrar a service_role key:

1. Abra https://supabase.com/dashboard
2. Clique no seu projeto
3. No menu lateral, clique em ⚙️ Settings (engrenagem)
4. Clique em API
5. Role até "Project API keys"
6. Você verá DUAS chaves:
   - anon (public)  → começa com eyJ...
   - service_role (secret) → começa com eyJ...  ← ESTA É A QUE PRECISA
7. Copie a service_role

⚠️ Se NÃO encontrar: pode usar a anon key por enquanto.
   O cache vai funcionar, mas sem bypassar RLS.


## ✅ Variáveis de Ambiente no Netlify

Depois de fazer deploy, vá em:

Site settings → Environment variables → Add a variable

Adicione:

Nome: OPENAI_API_KEY
Valor: (sua chave OpenAI)

Nome: SUPABASE_URL
Valor: https://ahonwmnzrcxmdivqssxv.supabase.co

Nome: SUPABASE_SERVICE_KEY
Valor: (a service_role key que começa com eyJ...)

Depois: Deploys → Trigger deploy


## 🧪 Testar localmente ANTES do deploy

npm install -g netlify-cli

# Criar arquivo .env na raiz do projeto com:
# OPENAI_API_KEY=sua_chave
# SUPABASE_URL=https://ahonwmnzrcxmdivqssxv.supabase.co
# SUPABASE_SERVICE_KEY=sua_service_role_key

netlify dev

# Testar a API:
curl -X POST http://localhost:8888/api/origem \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Construção","artista":"Chico Buarque"}'
