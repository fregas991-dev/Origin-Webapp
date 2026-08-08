import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OrigemData } from './schema';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  _supabase = createClient(url, key);
  return _supabase;
}

function gerarCacheKey(titulo: string, artista: string): string {
  return `${titulo.toLowerCase().trim()}::${artista.toLowerCase().trim()}`;
}

export async function buscarDoCache(
  titulo: string,
  artista: string
): Promise<OrigemData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('origens')
      .select('dados')
      .eq('cache_key', gerarCacheKey(titulo, artista))
      .maybeSingle();
    if (error) return null;
    return data?.dados ?? null;
  } catch (err) {
    return null;
  }
}

// AGORA RETORNA UMA STRING COM O RESULTADO
export async function salvarNoCache(
  titulo: string,
  artista: string,
  dados: OrigemData
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return "Variáveis do Supabase (URL ou KEY) sumiram no Netlify.";

  try {
    const key = gerarCacheKey(titulo, artista);
    const { error } = await supabase.from('origens').upsert(
      {
        cache_key: key,
        titulo,
        artista,
        dados,
        criado_em: new Date().toISOString(),
      },
      { onConflict: 'cache_key' }
    );

    // Se o banco recusar, a gente pega a mensagem exata!
    if (error) {
       return `Supabase recusou: ${error.message} (Código: ${error.code})`;
    }
    return "OK";
  } catch (err) {
    return `Exceção fatal no código: ${String(err)}`;
  }
}
