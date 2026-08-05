import { z } from 'zod';

const CuriosidadeSchema = z.object({
  texto: z.string(),
  fonte: z.string().optional(),
});

const FonteSchema = z.object({
  titulo: z.string(),
  url: z.string().nullable().optional(),
  tipo: z.enum([
    'entrevista',
    'enciclopedia',
    'biografia',
    'jornal',
    'discografia',
    'documentario',
  ]),
});

const ConfiancaSchema = z.object({
  nivel: z.enum(['alto', 'medio', 'baixo']),
  justificativa: z.string(),
});

// Schema leniente — a IA pode não ter todos os dados.
// Campos obrigatórios: apenas titulo, artista, historia
// O resto aceita null/undefined — o frontend preenche defaults
export const OrigemSchema = z.object({
  titulo: z.string(),
  artista: z.string(),
  ano_lancamento: z.string().nullable().optional(),
  album: z.string().nullable().optional(),
  compositores: z.array(z.string()).nullable().optional(),
  contexto_historico: z.string().nullable().optional(),
  inspiracao: z.string().nullable().optional(),
  historia: z.string(),
  diferenca_letra_vs_motivacao: z.string().nullable().optional(),
  curiosidades: z.array(CuriosidadeSchema).nullable().optional(),
  fontes_conhecidas: z.array(FonteSchema).nullable().optional(),
  confianca: ConfiancaSchema.nullable().optional(),
  campos_nao_confirmados: z.array(z.string()).nullable().optional(),
});

export type OrigemData = z.infer<typeof OrigemSchema>;

// Aplica defaults seguros após validação
export function normalizeOrigemData(data: OrigemData): OrigemData {
  return {
    titulo: data.titulo,
    artista: data.artista,
    ano_lancamento: data.ano_lancamento ?? '',
    album: data.album ?? '',
    compositores: data.compositores ?? [],
    contexto_historico: data.contexto_historico ?? '',
    inspiracao: data.inspiracao ?? '',
    historia: data.historia,
    diferenca_letra_vs_motivacao: data.diferenca_letra_vs_motivacao ?? null,
    curiosidades: data.curiosidades ?? [],
    fontes_conhecidas: data.fontes_conhecidas ?? [],
    confianca: data.confianca ?? {
      nivel: 'medio',
      justificativa: 'Nível de confiança não especificado pela IA',
    },
    campos_nao_confirmados: data.campos_nao_confirmados ?? [],
  };
}
