import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OrigemData } from './schema';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  // Reutiliza a conexão se ela já existir na memória do servidor
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  // Se não achar as variáveis, retorna nulo, mas NÃO bloqueia as próximas tentativas
  if (!url || !key) {
    return null; 
  }

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
    const key = gerarCacheKey(titulo, artista);

    const { data, error } = await supabase
      .from('origens')
      .select('dados')
      .eq('cache_key', key)
      .maybeSingle();

    if (error) return null;

    return data?.dados ?? null;
  } catch (err) {
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

    // Envia o upsert garantindo que os dados não têm lixo ou 'undefined'
    await supabase.from('origens').upsert(
      {
        cache_key: key,
        titulo,
        artista,
        dados,
        criado_em: new Date().toISOString(),
      },
      { onConflict: 'cache_key' }
    );
  } catch (err) {
    // Falha silenciosa: a IA gerou a resposta e o app não vai quebrar
  }
}
  }

  // Parse body
  let body: { titulo?: string; artista?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'JSON inválido no body' }),
      headers: COMMON_HEADERS,
    };
  }

  const { titulo, artista } = body;
  if (!titulo || !artista) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'titulo e artista são obrigatórios' }),
      headers: COMMON_HEADERS,
    };
  }

  console.log(`[ORIGEM] Buscando: "${titulo}" de "${artista}"`);

  try {
    // 1. Cache central (Supabase) — opcional
    let cached: OrigemData | null = null;
    try {
      cached = await buscarDoCache(titulo, artista);
    } catch (cacheErr) {
      console.warn('[ORIGEM] Erro ao buscar cache (não fatal):', cacheErr);
    }

    if (cached) {
      console.log(`[ORIGEM] Cache hit: "${titulo}"`);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, data: cached, from_cache: true } as ApiResponse),
        headers: COMMON_HEADERS,
      };
    }

    // 2. Gerar com IA
    console.log(`[ORIGEM] Cache miss, gerando: "${titulo}"`);
    const resultado: OrigemResult = await gerarOrigem(titulo, artista);

    // 3. Montar resposta com imagens
    const dataComImagem = {
      ...resultado.data,
      capaUrl: resultado.capaUrl || undefined,
      artistaFotoUrl: resultado.artistaFotoUrl || undefined,
    };

    // 4. Salvar no cache central — opcional
    try {
      console.log(`[ORIGEM - SUPABASE] Iniciando envio do cache para: "${titulo}"`);
      
      // MÁGICA AQUI: Limpa campos 'undefined' que fazem o cliente do Supabase falhar silenciosamente
      const dadosSanitizados = JSON.parse(JSON.stringify(dataComImagem));
      
      await salvarNoCache(titulo, artista, dadosSanitizados as OrigemData);
      
      console.log(`[ORIGEM - SUPABASE] Concluído comando de salvar cache para: "${titulo}"`);
    } catch (cacheErr) {
      console.warn('[ORIGEM - SUPABASE] Erro ao salvar cache (não fatal):', cacheErr);
    }

    console.log(`[ORIGEM] Sucesso: "${titulo}"`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: dataComImagem, from_cache: false } as ApiResponse),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error(`[ORIGEM] ERRO para "${titulo}":`, message);
    if (stack) console.error('[ORIGEM] Stack:', stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Erro ao processar a origem da canção',
        detail: message,
      } as ApiResponse),
      headers: COMMON_HEADERS,
    };
  }
};
