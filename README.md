# ORIGEM – A história por trás da canção

WebApp que revela a história por trás de uma música, usando IA com grounding em fontes reais.

## 🏗️ Arquitetura

```
Usuário → Shazam → App Nativo → WebView (este WebApp)
                                    │
                                    ├─ Deep link: ?musica=X&artista=Y
                                    ├─ Cache local (localStorage)
                                    ├─ API: POST /api/origem
                                    │     ├─ Cache central (Supabase)
                                    │     ├─ MusicBrainz (metadados)
                                    │     ├─ Wikipedia PT (contexto)
                                    │     ├─ OpenAI GPT-4o-mini (história)
                                    │     └─ Validação Zod
                                    └─ UI rica com seções editoriais
```

## 🔧 Serviços Necessários

| Serviço | Obrigatório? | Custo | Para que serve |
|---|---|---|---|
| **OpenAI** | ✅ Sim | ~$0.15/mil req (GPT-4o-mini) | Gerar a história da canção |
| **Supabase** | ⚠️ Opcional | Gratuito (500MB) | Cache central (evita chamar IA de novo) |
| MusicBrainz | Já incluído | Gratuito | Metadados (ano, álbum, compositores) |
| Wikipedia PT | Já incluído | Gratuito | Contexto histórico como grounding |

**Não precisa de mais nada.** MusicBrainz e Wikipedia são APIs públicas sem chave.

---

## 🚀 Deploy no Netlify

### 1. Subir para o GitHub

```bash
git init
git add .
git commit -m "ORIGEM v1"
git remote add origin https://github.com/SEU_USER/origem.git
git push -u origin main
```

### 2. Conectar ao Netlify

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique **"Add new site" → "Import an existing project"**
3. Conecte o repo do GitHub
4. Configuração de build (auto-detectada pelo `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Clique **"Deploy site"**

### 3. Configurar variáveis de ambiente

No Netlify: **Site settings → Environment variables → Add a variable**

| Variável | Valor | Obrigatória? |
|---|---|---|
| `OPENAI_API_KEY` | `sk-...` (sua chave) | ✅ Sim |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Opcional |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service_role key) | Opcional |

### 4. Redeploy

Após adicionar as variáveis, vá em **Deploys → Trigger deploy**.

---

## 🗄️ Supabase (Cache Central) — Setup

### 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto (gratuito)
3. Anote a **Project URL** e a **service_role key**

### 2. Criar tabela

Vá em **SQL Editor** e execute:

```sql
CREATE TABLE origens (
  cache_key TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  dados JSONB NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_origens_titulo ON origens (titulo);
CREATE INDEX idx_origens_artista ON origens (artista);
```

### 3. Adicionar variáveis no Netlify

- `SUPABASE_URL` = Project URL
- `SUPABASE_SERVICE_KEY` = service_role key (contorna RLS)

> **Sem Supabase?** O app funciona normalmente. Cada requisição vai direto à OpenAI. O cache local (localStorage) ainda funciona no navegador.

---

## 🧪 Testar Localmente

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Rodar com functions
netlify dev
```

O `netlify dev` sobe o Vite + as Netlify Functions juntos em `localhost:8888`.

### Testar a API diretamente:

```bash
curl -X POST http://localhost:8888/api/origem \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Construção","artista":"Chico Buarque"}'
```

### Testar deep link:

```
http://localhost:8888/?musica=Construção&artista=Chico+Buarque
```

---

## 🔑 OpenAI — Obter API Key

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma nova chave
3. Adicione créditos se necessário (mínimo $5)
4. Modelo usado: **gpt-4o-mini** (~$0.15 por 1M input tokens)

---

## 📱 Integração com App Nativo

O WebView abre este URL:

```
https://SEU-SITE.netlify.app/?musica=NOME+DA+MUSICA&artista=NOME+DO+ARTISTA
```

O WebApp:
1. Lê `musica` e `artista` da URL
2. Verifica cache local (localStorage)
3. Se existe → mostra instantaneamente
4. Se não → chama `POST /api/origem` → salva → mostra
