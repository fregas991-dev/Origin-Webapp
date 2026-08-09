import type { Historia } from '../types';

const API_URL = '/api/origem';

function mapToHistoria(data: Record<string, unknown>, titulo: string, artista: string): Historia {
  return {
    titulo: (data.titulo as string) || titulo,
    artista: (data.artista as string) || artista,
    ano: (data.ano_lancamento as string) || (data.ano as string) || '—',
    album: (data.album as string) || undefined,
    compositores: Array.isArray(data.compositores) ? data.compositores as string[] : undefined,
    contexto_historico: (data.contexto_historico as string) || undefined,
    inspiracao: (data.inspiracao as string) || undefined,
    historia: (data.historia as string) || '',
    diferenca_letra_vs_motivacao: (data.diferenca_letra_vs_motivacao as string | null) || undefined,
    curiosidades: Array.isArray(data.curiosidades) ? data.curiosidades as Historia['curiosidades'] : undefined,
    fontes_conhecidas: Array.isArray(data.fontes_conhecidas) ? data.fontes_conhecidas as Historia['fontes_conhecidas'] : undefined,
    confianca: (data.confianca as Historia['confianca']) || undefined,
    campos_nao_confirmados: Array.isArray(data.campos_nao_confirmados) ? data.campos_nao_confirmados as string[] : undefined,
    capaUrl: (data.capaUrl as string) || (data.artistaFotoUrl as string) || '',
    salvo: false,
    timestamp: Date.now(),
  };
}

export async function fetchHistoria(musica: string, artista: string): Promise<Historia> {
  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: musica, artista }),
    });
  } catch (fetchError) {
    // fetch() itself falhou — sem conexão, CORS, ou URL não existe
    const msg = fetchError instanceof Error ? fetchError.message : 'Erro de conexão';
    console.error('[ORIGEM] fetch() falhou:', msg);
    throw new Error(
      `Não foi possível conectar ao servidor.\n\nDetalhe: ${msg}\n\nVerifique se o Netlify Function está deployado e as variáveis de ambiente estão configuradas.`
    );
  }

  // Ler o body (sempre tenta, mesmo com status de erro)
  const json = await response.json().catch(() => null);

  // Sucesso (200)
  if (response.ok && json) {
    if (json.success && json.data) {
      return mapToHistoria(json.data, musica, artista);
    }
    // Resposta direta sem wrapper
    if (json.titulo || json.historia) {
      return mapToHistoria(json, musica, artista);
    }
    // 200 mas formato inesperado
    console.error('[ORIGEM] Resposta 200 mas formato inesperado:', JSON.stringify(json).substring(0, 500));
    throw new Error(`Resposta da API em formato inesperado.`);
  }

  // Erro HTTP (4xx, 5xx)
  const apiError = json?.error || json?.detail || '';
  const httpError = `HTTP ${response.status}`;

  console.error(`[ORIGEM] ${httpError}:`, apiError, json?.detail || '');

  if (response.status === 404) {
    throw new Error(
      `A API não foi encontrada (HTTP 404).\n\nIsso significa que o Netlify Function NÃO está deployado ou a URL está errada.\n\nVerifique:\n1. O netlify.toml está na raiz do repo?\n2. A pasta netlify/functions/ existe no deploy?\n3. No Netlify, aba "Functions" — aparece "origem"?`
    );
  }

  if (response.status === 500) {
    throw new Error(
      `Erro interno no servidor (HTTP 500).\n\n${apiError ? `Mensagem: ${apiError}\n\n` : ''}${json?.detail ? `Detalhe: ${json.detail}\n\n` : ''}Verifique os logs do Netlify Function em: Site → Functions → origem → Real-time logs`
    );
  }

  throw new Error(
    `Erro da API: ${httpError}\n\n${apiError || 'Sem mensagem de erro.'}`
  );
}
