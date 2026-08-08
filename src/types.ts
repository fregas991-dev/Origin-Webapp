export interface Curiosidade {
  texto: string;
  fonte?: string;
}

export interface Fonte {
  titulo: string;
  url?: string | null;
  tipo: string;
}

export interface Confianca {
  nivel: string;
  justificativa: string;
}

export interface Historia {
  titulo: string;
  artista: string;
  ano: string;
  album?: string;
  compositores?: string[];
  contexto_historico?: string;
  inspiracao?: string;
  historia: string;
  diferenca_letra_vs_motivacao?: string | null;
  curiosidades?: Curiosidade[];
  fontes_conhecidas?: Fonte[];
  confianca?: Confianca;
  campos_nao_confirmados?: string[];
  capaUrl?: string;
  salvo: boolean;
  timestamp: number;
}

export type Screen = 'home' | 'story' | 'saved';
