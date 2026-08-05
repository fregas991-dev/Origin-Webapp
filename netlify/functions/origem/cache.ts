import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OrigemData } from './schema';

let _supabase: SupabaseClient | null = null;
let _supabaseAvailable = true;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (!_supabaseAvailable) return null;

  const url = process.env.SUPABASE_URL;

  // Tenta a secret key (sb_secret_...) primeiro, depois service_role (eyJ...), depois anon
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.info('Supabase não configurado — cache central desabilitado');
    _supabaseAvailable = false;
    return null;
  }

  console.info(`Supabase conectado: ${url.substring(0, 30)}...`);
  _supabase = createClient(url, key);
  return _supabase;


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
    const key = gerarCacheKey(titulo, artista);

    const { data, error } = await supabase
      .from('origens')
      .select('dados')
      .eq('cache_key', key)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao buscar cache Supabase:', error.message);
      return null;
    }

    return data?.dados ?? null;
  } catch (err) {
    console.warn('Exceção ao buscar cache Supabase:', err);
    return null;
  }
}

export async function salvarNoCache(
  titulo: string,
  artista: string,
  dados: OrigemData
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

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

    if (error) {
      console.warn('Erro ao salvar no cache Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Exceção ao salvar no cache Supabase:', err);
  }
}
