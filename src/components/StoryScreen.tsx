import { useEffect, useState } from 'react';
import Header from './Header';
import SongCard from './SongCard';
import Timeline from './Timeline';
import LoadingState from './LoadingState';
import ReadingProgress from './ReadingProgress';
import { getCachedHistoria, saveHistoria, toggleSalvo } from '../services/db';
import { fetchHistoria } from '../services/api';
import type { Historia } from '../types';

interface StoryScreenProps {
  musica: string;
  artista: string;
  darkMode: boolean;
  onToggleDark: () => void;
  onBack?: () => void;
}

export default function StoryScreen({ musica, artista, darkMode, onToggleDark, onBack }: StoryScreenProps) {
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSalvo, setIsSalvo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setHistoria(null);

      // 1. Cache local (localStorage)
      const cached = getCachedHistoria(musica, artista);
      if (cancelled) return;

      if (cached) {
        setHistoria(cached);
        setIsSalvo(cached.salvo);
        setLoading(false);
        return;
      }

      // 2. API (Netlify Function → Supabase → MusicBrainz → OpenAI)
      try {
        const data = await fetchHistoria(musica, artista);
        if (cancelled) return;
        setHistoria(data);
        setIsSalvo(data.salvo);
        setLoading(false);
        saveHistoria(musica, artista, data);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [musica, artista]);

  function handleToggleSalvo() {
    toggleSalvo(musica, artista);
    setIsSalvo(!isSalvo);
  }

  // Format paragraphs
  function renderParagraphs(text: string, isDropCap = false) {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
    return paragraphs.map((paragraph, i) => (
      <p
        key={i}
        className={`font-inter text-sm leading-[1.85] text-brown-400 dark:text-cream-300/80 ${i > 0 ? 'mt-4' : isDropCap ? 'drop-cap' : ''}`}
        style={{ textIndent: i > 0 ? '1.5em' : undefined }}
      >
        {paragraph.trim()}
      </p>
    ));
  }

  // Confidence badge colors
  const confiancaColors: Record<string, { bg: string; text: string; label: string }> = {
    alto: { bg: 'bg-green-600/15 dark:bg-green-400/15', text: 'text-green-700 dark:text-green-400', label: 'Alta' },
    medio: { bg: 'bg-amber-600/15 dark:bg-amber-400/15', text: 'text-amber-700 dark:text-amber-400', label: 'Média' },
    baixo: { bg: 'bg-red-600/15 dark:bg-red-400/15', text: 'text-red-700 dark:text-red-400', label: 'Baixa' },
  };

  // Fonte tipo labels
  const fonteTipoLabel: Record<string, string> = {
    entrevista: '🎤 Entrevista',
    enciclopedia: '📚 Enciclopédia',
    biografia: '📖 Biografia',
    jornal: '📰 Jornal',
    discografia: '💿 Discografia',
    documentario: '🎬 Documentário',
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-20 page-enter">
      <ReadingProgress />
      <Header darkMode={darkMode} onToggleDark={onToggleDark} />

      {/* Top bar: back + save */}
      {onBack && (
        <div className="mx-5 mb-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-brown-300 dark:text-cream-300/60 hover:text-copper-500 dark:hover:text-copper-400 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="font-inter text-xs font-medium">Voltar</span>
          </button>

          {historia && (
            <button
              onClick={handleToggleSalvo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isSalvo
                  ? 'bg-copper-500/15 dark:bg-copper-500/20 text-copper-500 dark:text-copper-400'
                  : 'bg-cream-200/80 dark:bg-dark-50/80 text-brown-300 dark:text-cream-300/50 hover:text-copper-500 dark:hover:text-copper-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isSalvo ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              <span className="font-inter text-xs font-medium">{isSalvo ? 'Salvo' : 'Salvar'}</span>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="px-6 py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-500/70">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="font-inter text-sm text-brown-300 dark:text-cream-300/50">
            Não foi possível carregar a história.
          </p>
          <p className="font-inter text-xs text-brown-200 dark:text-cream-300/30 mt-3 text-left whitespace-pre-line leading-relaxed max-w-sm mx-auto">
            {error}
          </p>
          <button onClick={() => window.location.reload()} className="mt-4 font-inter text-xs font-medium text-copper-500 dark:text-copper-400 hover:text-copper-600 underline underline-offset-2 transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : historia ? (
        <div className="animate-fade-in-up">
          {/* ── Song Card ── */}
          <SongCard
            titulo={historia.titulo}
            artista={historia.artista}
            album={historia.album}
            compositores={historia.compositores}
            capaUrl={historia.capaUrl}
          />

          <div className="mx-5 mt-8">
            {/* ── Confidence badge (top right) ── */}
            {historia.confianca && (() => {
              const c = confiancaColors[historia.confianca.nivel] || confiancaColors.medio;
              return (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-inter font-semibold mb-4 ${c.bg} ${c.text}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Confiança: {c.label}
                </div>
              );
            })()}

            {/* ── Contexto Histórico ── */}
            {historia.contexto_historico && (
              <section className="mb-8 animate-fade-in-up-delay">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-copper-500/10 dark:bg-copper-400/10 flex items-center justify-center">
                    <span className="text-sm">🏛️</span>
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brown-600 dark:text-cream-100">
                    Contexto Histórico
                  </h3>
                </div>
                <div className="pl-9 border-l-2 border-copper-400/20 dark:border-copper-500/15">
                  {renderParagraphs(historia.contexto_historico)}
                </div>
              </section>
            )}

            {/* ── Inspiração ── */}
            {historia.inspiracao && (
              <section className="mb-8 animate-fade-in-up-delay">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/10 dark:bg-gold-400/10 flex items-center justify-center">
                    <span className="text-sm">💡</span>
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brown-600 dark:text-cream-100">
                    Inspiração
                  </h3>
                </div>
                <div className="pl-9 border-l-2 border-gold-400/20 dark:border-gold-500/15">
                  {renderParagraphs(historia.inspiracao)}
                </div>
              </section>
            )}

            {/* ── A História Desta Canção ── */}
            <section className="mb-8 animate-fade-in-up-delay">
              <h2 className="font-playfair text-2xl font-bold text-brown-600 dark:text-cream-100 leading-tight">
                A História Desta Canção
              </h2>
              <div className="mt-2 mb-1 w-12 h-[2px] bg-gradient-to-r from-copper-500 to-copper-400/40" />

              {historia.ano && historia.ano !== '—' && (
                <Timeline ano={historia.ano} />
              )}

              <div className="animate-fade-in-up-delay-2">
                {renderParagraphs(historia.historia, true)}
              </div>
            </section>

            {/* ── Diferença Letra vs Motivação ── */}
            {historia.diferenca_letra_vs_motivacao && (
              <section className="mb-8 animate-fade-in-up-delay-2">
                <div className="p-4 rounded-xl bg-copper-500/5 dark:bg-copper-400/8 border border-copper-400/15 dark:border-copper-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🎭</span>
                    <h3 className="font-playfair text-base font-bold text-brown-500 dark:text-cream-200">
                      A Letra vs. A Motivação
                    </h3>
                  </div>
                  {renderParagraphs(historia.diferenca_letra_vs_motivacao)}
                </div>
              </section>
            )}

            {/* ── Curiosidades ── */}
            {historia.curiosidades && historia.curiosidades.length > 0 && (
              <section className="mb-8 animate-fade-in-up-delay-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/10 dark:bg-gold-400/10 flex items-center justify-center">
                    <span className="text-sm">✨</span>
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brown-600 dark:text-cream-100">
                    Curiosidades
                  </h3>
                </div>
                <div className="space-y-2.5 pl-2">
                  {historia.curiosidades.map((c, i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className="mt-0.5 text-copper-400 dark:text-copper-400/60 text-xs font-inter font-semibold flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-inter text-sm leading-relaxed text-brown-400 dark:text-cream-300/80">
                          {c.texto}
                        </p>
                        {c.fonte && (
                          <p className="font-inter text-[10px] text-brown-200 dark:text-cream-300/30 mt-0.5 italic">
                            Fonte: {c.fonte}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Fontes Conhecidas ── */}
            {historia.fontes_conhecidas && historia.fontes_conhecidas.length > 0 && (
              <section className="mb-8 animate-fade-in-up-delay-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-brown-300/10 dark:bg-cream-300/5 flex items-center justify-center">
                    <span className="text-sm">📚</span>
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brown-600 dark:text-cream-100">
                    Fontes
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  {historia.fontes_conhecidas.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-inter text-[10px] text-brown-200 dark:text-cream-300/30 flex-shrink-0 mt-0.5">
                        {fonteTipoLabel[f.tipo] || '📎'}
                      </span>
                      <div className="min-w-0">
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-inter text-sm text-copper-500 dark:text-copper-400 hover:text-copper-600 dark:hover:text-copper-300 hover:underline underline-offset-2 transition-colors"
                          >
                            {f.titulo}
                          </a>
                        ) : (
                          <span className="font-inter text-sm text-brown-400 dark:text-cream-300/70">
                            {f.titulo}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Confiança justificativa ── */}
            {historia.confianca && (
              <section className="mb-6 animate-fade-in-up-delay-2">
                <div className="px-3 py-2.5 rounded-lg bg-cream-200/50 dark:bg-dark-50/50 border border-cream-300/40 dark:border-brown-500/20">
                  <p className="font-inter text-[10px] uppercase tracking-wider text-brown-300 dark:text-cream-300/40 font-semibold mb-1">
                    Nível de confiança
                  </p>
                  <p className="font-inter text-xs text-brown-400 dark:text-cream-300/60 leading-relaxed italic">
                    {historia.confianca.justificativa}
                  </p>
                  {historia.campos_nao_confirmados && historia.campos_nao_confirmados.length > 0 && (
                    <p className="font-inter text-[10px] text-amber-600/70 dark:text-amber-400/50 mt-1.5">
                      ⚠️ Campos não confirmados: {historia.campos_nao_confirmados.join(', ')}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* End decorative mark */}
            <div className="flex items-center justify-center gap-2 mt-6 mb-4">
              <div className="w-8 h-[1px] bg-copper-400/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-copper-400/40" />
              <div className="w-8 h-[1px] bg-copper-400/40" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
