import { useEffect, useState } from 'react';
import Header from './Header';
import { getAllSaved, deleteHistoria, toggleSalvo } from '../services/db';
import type { Historia } from '../types';

interface SavedScreenProps {
  onOpenStory: (titulo: string, artista: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  refreshTrigger?: number;
}

export default function SavedScreen({ onOpenStory, darkMode, onToggleDark, refreshTrigger }: SavedScreenProps) {
  const [saved, setSaved] = useState<Historia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, [refreshTrigger]);

  function loadSaved() {
    setLoading(true);
    const items = getAllSaved();
    setSaved(items);
    setLoading(false);
  }

  function handleDelete(e: React.MouseEvent, titulo: string, artista: string) {
    e.stopPropagation();
    deleteHistoria(titulo, artista);
    setSaved((prev) => prev.filter((h) => !(h.titulo === titulo && h.artista === artista)));
  }

  function handleToggleSalvo(e: React.MouseEvent, titulo: string, artista: string) {
    e.stopPropagation();
    toggleSalvo(titulo, artista);
    setSaved((prev) => prev.filter((h) => h.salvo));
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-20 page-enter">
      <Header darkMode={darkMode} onToggleDark={onToggleDark} />

      <div className="px-5 mt-4">
        <h2 className="font-playfair text-xl font-bold text-brown-600 dark:text-cream-100">
          Canções Salvas
        </h2>
        <p className="font-inter text-xs text-brown-300 dark:text-cream-300/50 mt-1">
          Histórias que você guardou
        </p>
      </div>

      <div className="px-4 mt-4 flex-1">
        {loading ? (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper-400/20 to-gold-400/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-copper-400/50">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="font-inter text-sm text-brown-300 dark:text-cream-300/50 font-medium">
              Nenhuma canção salva ainda
            </p>
            <p className="font-inter text-xs text-brown-200 dark:text-cream-300/30 mt-1 max-w-[240px]">
              Pesquise uma música e toque no botão salvar para guardar aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {saved.map((item, i) => (
              <button
                key={`${item.titulo}_${item.artista}_${i}`}
                onClick={() => onOpenStory(item.titulo, item.artista)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cream-200/70 dark:hover:bg-dark-50/60 transition-colors duration-150 group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-cream-300/40 dark:ring-brown-500/30">
                  {item.capaUrl ? (
                    <img src={item.capaUrl} alt={item.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-copper-400/25 to-gold-400/15 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-copper-500/60">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-inter text-sm font-medium text-brown-500 dark:text-cream-100 truncate group-hover:text-brown-600 dark:group-hover:text-cream-50 transition-colors">
                    {item.titulo}
                  </p>
                  <p className="font-inter text-xs text-brown-200 dark:text-cream-300/50 truncate">
                    {item.artista} {item.ano && item.ano !== '—' ? `· ${item.ano}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    onClick={(e) => handleToggleSalvo(e, item.titulo, item.artista)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-copper-500 dark:text-copper-400 hover:bg-copper-500/10 transition-all"
                    title="Remover dos salvos"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  </span>
                  <span
                    onClick={(e) => handleDelete(e, item.titulo, item.artista)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-brown-200 dark:text-cream-300/30 hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-400/10 transition-all"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
