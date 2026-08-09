import OpenAI from 'openai';
import { OrigemSchema, normalizeOrigemData, type OrigemData } from './schema.js';
import { buildSystemPrompt, buildUserPrompt, buildRetryPrompt } from './prompt.js';
import { buscarMetadados, type MetadadosCompletos } from './metadata.js';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY não configurada');
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

export interface OrigemResult {
  data: OrigemData;
  capaUrl: string | null;
  artistaFotoUrl: string | null;
}

export async function gerarOrigem(
  titulo: string,
  artista: string
): Promise<OrigemResult> {
  const openai = getOpenAI();

  // ── Passo 1: Buscar metadados reais (grounding + imagens) ──
  let metadados: MetadadosCompletos | undefined;
  try {
    metadados = await buscarMetadados(titulo, artista);
  } catch {
    // Metadados são opcionais — continua sem eles
  }

  const capaUrl = metadados?.capaUrl || null;
  const artistaFotoUrl = metadados?.artistaFotoUrl || null;

  // ── Passo 2: Chamar OpenAI ──
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(titulo, artista, metadados) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('OpenAI retornou resposta vazia');

  // ── Passo 3: Parse + validação Zod ──
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`JSON inválido da OpenAI: ${raw.substring(0, 300)}`);
  }

  const result = OrigemSchema.safeParse(parsed);

  if (result.success) {
    return { data: normalizeOrigemData(result.data), capaUrl, artistaFotoUrl };
  }

  // ── Passo 4: Retry com correção ──
  console.warn(
    'Zod validation falhou (tentativa 1):',
    JSON.stringify(result.error.issues)
  );

  const retried = await retryComCorrecao(titulo, artista, raw, result.error.issues);
  return { data: retried, capaUrl, artistaFotoUrl };
}

async function retryComCorrecao(
  titulo: string,
  artista: string,
  jsonOriginal: string,
  erros: unknown[]
): Promise<OrigemData> {
  const openai = getOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: buildRetryPrompt(
          titulo,
          artista,
          jsonOriginal,
          JSON.stringify(erros, null, 2)
        ),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Retry retornou vazio');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Retry JSON inválido: ${raw.substring(0, 300)}`);
  }

  const result = OrigemSchema.parse(parsed);
  return normalizeOrigemData(result);
}
