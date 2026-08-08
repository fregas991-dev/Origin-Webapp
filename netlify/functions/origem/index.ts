import { buscarDoCache, salvarNoCache } from './cache';
import { gerarOrigem, type OrigemResult } from './ai';
import type { OrigemData } from './schema';

interface ApiResponse {
  success: boolean;
  data?: OrigemData & { capaUrl?: string; artistaFotoUrl?: string };
  error?: string;
  detail?: string;
  from_cache?: boolean;
}

const COMMON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async function (
  event: { httpMethod: string; body: string | null; [key: string]: unknown },
  _context: unknown
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  console.log('[ORIGEM] Handler invocado. method=', event.httpMethod);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '', headers: COMMON_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Método não permitido. Use POST.' }),
      headers: COMMON_HEADERS,
    };
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
      
      // Limpa campos 'undefined' que fazem o cliente do Supabase falhar silenciosamente
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
