import type { Historia } from '../types';

const API_URL = '/api/origem';

// Mapeia resposta da API (OrigemData) para Historia do frontend
// Aceita null/undefined do schema leniente e converte para valores seguros
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
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: musica, artista }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return mapToHistoria(json.data, musica, artista);
      }
      if (json.titulo || json.historia) {
        return mapToHistoria(json, musica, artista);
      }
      throw new Error(json.error || 'Resposta inválida da API');
    }

    // AQUI ESTÁ O SEGREDO: Pegamos o detalhe que o backend nos enviou
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || errData.error || `HTTP ${response.status}`);
    
  } catch (error) {
    // Pegamos a mensagem de erro nua e crua
    const errorMessage = error instanceof Error ? error.message : String(error);
    return generateOfflineFallback(musica, artista, errorMessage);
  }
}

// Atualizamos o fallback para mostrar o erro na UI
function generateOfflineFallback(musica: string, artista: string, detalheErro: string = 'Erro desconhecido'): Historia {
  return {
    titulo: musica,
    artista,
    ano: '—',
    historia: `🚨 ALERTA DE DEBUG 🚨\nO servidor backend falou o seguinte:\n\n"${detalheErro}"\n\n---------------------------\nA história de "${musica}" por ${artista} ainda será revelada. O servidor ORIGEM não está disponível no momento.`,
    salvo: false,
    timestamp: Date.now(),
  };
}
