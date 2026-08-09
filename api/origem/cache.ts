import type { OrigemData } from './schema.js';

function getKeys() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !key) return null;
  return { url, key };
}

function gerarCacheKey(titulo: string, artista: string): string {
  return `${titulo.toLowerCase().trim()}::${artista.toLowerCase().trim()}`;
}

export async function buscarDoCache(
  titulo: string,
  artista: string
): Promise<OrigemData | null> {
  const creds = getKeys();
  if (!creds) return null;

  try {
    const cacheKey = gerarCacheKey(titulo, artista);
    const encodedKey = encodeURIComponent(cacheKey);
    
    // MÁGICA 1: Usando HTTP puro em vez do cliente "mimado" com WebSockets
    const response = await fetch(`${creds.url}/rest/v1/origens?cache_key=eq.${encodedKey}&select=dados`, {
      method: 'GET',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`
      }
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0 && data[0].dados) {
      return data[0].dados;
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

export async function salvarNoCache(
  titulo: string,
  artista: string,
  dados: OrigemData
): Promise<string> {
  const creds = getKeys();
  if (!creds) return "Variáveis do Supabase sumiram no Netlify.";

  try {
    const cacheKey = gerarCacheKey(titulo, artista);
    
    // MÁGICA 2: Fazendo o UPSERT via HTTP REST
    const response = await fetch(`${creds.url}/rest/v1/origens`, {
      method: 'POST',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json',
        // Essa linha manda o Supabase atualizar se a Chave Primária já existir
        'Prefer': 'resolution=merge-duplicates' 
      },
      body: JSON.stringify({
        cache_key: cacheKey,
        titulo,
        artista,
        dados,
        criado_em: new Date().toISOString()
      })
    });

    if (!response.ok) {
       const errorText = await response.text();
       return `REST falhou: ${response.status} - ${errorText}`;
    }
    
    return "OK";
  } catch (err) {
    return `Exceção REST: ${String(err)}`;
  }
}
