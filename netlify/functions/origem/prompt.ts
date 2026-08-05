import type { MetadadosCompletos } from './metadata.js';

export function buildSystemPrompt(): string {
  return `Você é um pesquisador musical especializado em música popular brasileira e mundial. Sua tarefa é explicar a ORIGEM de uma canção — como ela surgiu, não apenas o que a letra significa.

## REGRAS OBRIGATÓRIAS

1. FOQUE na história de criação da música, não em interpretação de letra.
2. Inclua: contexto histórico da época, inspirações do compositor, acontecimentos que motivaram a obra, curiosidades verificáveis.
3. Se houver diferença entre o que a letra parece dizer e a motivação real da composição, explique em "diferenca_letra_vs_motivacao".
4. NUNCA invente fontes, URLs ou fatos. Se não tem certeza, diga isso.
5. Se não encontrar informação sobre algum campo, deixe vazio ou liste o campo em "campos_nao_confirmados".
6. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois.
7. Todas as respostas em português brasileiro.
8. "confianca.nivel" deve ser:
   - "alto": fatos amplamente documentados em enciclopédias, biografias ou entrevistas
   - "medio": baseado em fontes parciais ou indiretas
   - "baixo": informação escassa, pode conter inferências

## SCHEMA DO JSON
{
  "titulo": string,
  "artista": string,
  "ano_lancamento": string,
  "album": string,
  "compositores": string[],
  "contexto_historico": string (parágrafos sobre o contexto político, social e cultural da época),
  "inspiracao": string (o que motivou o compositor a escrever a canção),
  "historia": string (a história completa da criação, com pelo menos 3 parágrafos separados por \\n\\n),
  "diferenca_letra_vs_motivacao": string | null (se o sentido aparente da letra difere da motivação real),
  "curiosidades": [{ "texto": string, "fonte": string? }],
  "fontes_conhecidas": [{ 
    "titulo": string, 
    "url": string | null, 
    "tipo": "entrevista"|"enciclopedia"|"biografia"|"jornal"|"discografia"|"documentario" 
  }],
  "confianca": { "nivel": "alto"|"medio"|"baixo", "justificativa": string },
  "campos_nao_confirmados": string[]
}`;
}

export function buildUserPrompt(
  titulo: string,
  artista: string,
  metadados?: MetadadosCompletos
): string {
  let prompt = `Explique a origem da música "${titulo}" de ${artista}.`;

  if (metadados) {
    const sections: string[] = [];

    if (metadados.musicBrainz) {
      const mb = metadados.musicBrainz;
      const mbInfo: Record<string, unknown> = {};
      if (mb.ano) mbInfo['ano'] = mb.ano;
      if (mb.album) mbInfo['album'] = mb.album;
      if (mb.compositores && mb.compositores.length > 0)
        mbInfo['compositores'] = mb.compositores;
      if (mb.pais) mbInfo['pais'] = mb.pais;
      if (mb.isrc) mbInfo['isrc'] = mb.isrc;
      if (Object.keys(mbInfo).length > 0) {
        sections.push(`MusicBrainz (metadados verificados):\n${JSON.stringify(mbInfo, null, 2)}`);
      }
    }

    if (metadados.wikipedia && metadados.wikipedia.resumo) {
      sections.push(
        `Wikipedia (contexto adicional):\n${metadados.wikipedia.resumo}`
      );
    }

    if (sections.length > 0) {
      prompt += `\n\n--- DADOS DE REFERÊNCIA ---\n${sections.join('\n\n')}\n--- FIM DADOS DE REFERÊNCIA ---\n\nUse esses dados como base. Corrija qualquer inconsistência que encontrar. Se os dados de referência forem insuficientes, preencha com seu conhecimento, marcando campos incertos em "campos_nao_confirmados".`;
    }
  }

  return prompt;
}

export function buildRetryPrompt(
  titulo: string,
  artista: string,
  jsonOriginal: string,
  erros: string
): string {
  return `O JSON anterior para "${titulo}" de ${artista} teve erros de validação Zod:

ERROS:
${erros}

JSON ORIGINAL:
${jsonOriginal}

Corrija TODOS os erros e retorne o JSON válido seguindo exatamente o schema do system prompt. Não inclua nenhum texto fora do JSON.`;
}
