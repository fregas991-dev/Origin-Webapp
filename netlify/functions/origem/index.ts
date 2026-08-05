import { buscarDoCache, salvarNoCache } from './cache';
import { gerarOrigem, type OrigemResult } from './ai';
import type { OrigemData } from './schema';

interface RequestBody {
  titulo?: string;
  artista?: string;
}

interface ApiResponse {
  success: boolean;
  data?: OrigemData & { capaUrl?: string; artistaFotoUrl?: string };
  error?: string;
  detail?: string;
  from_cache?: boolean;
}

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (
  event: { httpMethod: string; body: string | null },
  _context: unknown
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '', headers: COMMON_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Método não permitido' }),
      headers: COMMON_HEADERS,
    };
  }

  // Parse body
  let body: RequestBody;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'JSON inválido' }),
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
    // 1. Cache central (Supabase)
    const cached = await buscarDoCache(titulo, artista);
    if (cached) {
      console.log(`[ORIGEM] Cache hit: "${titulo}"`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: cached,
          from_cache: true,
        } as ApiResponse),
        headers: COMMON_HEADERS,
      };
    }

    // 2. Gerar com IA (MusicBrainz + Wikipedia + Deezer/iTunes + OpenAI + Zod)
    console.log(`[ORIGEM] Cache miss, gerando: "${titulo}"`);
    const resultado: OrigemResult = await gerarOrigem(titulo, artista);

    // 3. Montar resposta com imagens
    const dataComImagem = {
      ...resultado.data,
      capaUrl: resultado.capaUrl || undefined,
      artistaFotoUrl: resultado.artistaFotoUrl || undefined,
    };

    // 4. Salvar no cache central (com imagens)
    await salvarNoCache(titulo, artista, dataComImagem as OrigemData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: dataComImagem,
        from_cache: false,
      } as ApiResponse),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[ORIGEM] Erro para "${titulo}":`, message);

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
