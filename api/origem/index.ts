import { buscarDoCache, salvarNoCache } from './cache';
import { gerarOrigem } from './ai';

export default async function handler(req: any, res: any) {
  // 1. Libera o CORS (Acesso para o seu App Android)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Use POST' });
  }

  // 2. Na Vercel, o body já vem pronto e mastigado! 
  const { titulo, artista } = req.body || {};

  if (!titulo || !artista) {
    return res.status(400).json({ success: false, error: 'titulo e artista são obrigatórios' });
  }

  try {
    const cached = await buscarDoCache(titulo, artista);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, from_cache: true });
    }

    const resultado = await gerarOrigem(titulo, artista);
    const dataComImagem = {
      ...resultado.data,
      capaUrl: resultado.capaUrl || undefined,
      artistaFotoUrl: resultado.artistaFotoUrl || undefined,
    };

    // 3. Salva no banco (O Cavalo de Troia do Debug continua aqui)
    try {
      const dadosSanitizados = JSON.parse(JSON.stringify(dataComImagem));
      const debugMsg = await salvarNoCache(titulo, artista, dadosSanitizados);

      if (debugMsg !== "OK") {
        return res.status(500).json({
          success: false,
          error: 'ALERTA DE DEBUG (O banco recusou salvar)',
          detail: debugMsg,
        });
      }
    } catch (cacheErr) {
      return res.status(500).json({
        success: false,
        error: 'ALERTA DE DEBUG (Crash no código do banco)',
        detail: String(cacheErr),
      });
    }

    // 4. Retorna a música para o app!
    return res.status(200).json({ success: true, data: dataComImagem, from_cache: false });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar',
      detail: String(error)
    });
  }
}
