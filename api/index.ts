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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '', headers: COMMON_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Use POST' }), headers: COMMON_HEADERS };
  }

  let body: { titulo?: string; artista?: string };
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ success: false, error: 'JSON inválido' }), headers: COMMON_HEADERS }; }

  const { titulo, artista } = body;
  if (!titulo || !artista) return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Falta titulo e artista' }), headers: COMMON_HEADERS };

  try {
    const cached = await buscarDoCache(titulo, artista);
    if (cached) {
      return { statusCode: 200, body: JSON.stringify({ success: true, data: cached, from_cache: true } as ApiResponse), headers: COMMON_HEADERS };
    }

    const resultado: OrigemResult = await gerarOrigem(titulo, artista);
    const dataComImagem = {
      ...resultado.data,
      capaUrl: resultado.capaUrl || undefined,
      artistaFotoUrl: resultado.artistaFotoUrl || undefined,
    };

    // --- SISTEMA DE DEBUG FORÇADO NA TELA DO APP ---
    try {
      const dadosSanitizados = JSON.parse(JSON.stringify(dataComImagem));
      const debugMsg = await salvarNoCache(titulo, artista, dadosSanitizados as OrigemData);

      // Se não retornou "OK", força a TELA VERMELHA de erro no app para você ler o motivo!
      if (debugMsg !== "OK") {
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'ALERTA DE DEBUG (O banco recusou salvar o cache)',
            detail: debugMsg,
          } as ApiResponse),
          headers: COMMON_HEADERS,
        };
      }
    } catch (cacheErr) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'ALERTA DE DEBUG (Crash no código do banco)',
            detail: String(cacheErr),
          } as ApiResponse),
          headers: COMMON_HEADERS,
        };
    }

    // Se o banco salvou com sucesso, retorna a música normal!
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: dataComImagem, from_cache: false } as ApiResponse),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Erro ao processar', detail: message } as ApiResponse),
      headers: COMMON_HEADERS,
    };
  }
};
