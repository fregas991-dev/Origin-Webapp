import Header from './Header';
import SearchBar from './SearchBar';
import type { Historia } from '../types';

interface HomeScreenProps {
  onOpenStory: (titulo: string, artista: string) => void;
  recentFromCache: Historia[];
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function HomeScreen({ onOpenStory, recentFromCache, darkMode, onToggleDark }: HomeScreenProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-20 page-enter">
      <Header darkMode={darkMode} onToggleDark={onToggleDark} />

      {/* Search */}
      <div className="mt-4">
        <SearchBar onSelect={(titulo, artista) => onOpenStory(titulo, artista)} />
      </div>

      {/* Divider */}
      <div className="mx-6 mt-6 mb-4 flex items-center gap-3">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-cream-300 dark:to-brown-500/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-copper-400/40" />
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-cream-300 dark:to-brown-500/30" />
      </div>

      {/* Recent searches */}
      <div className="px-5 flex-1">
        <h2 className="font-inter text-xs uppercase tracking-[0.15em] text-brown-300 dark:text-cream-300/60 font-semibold mb-3">
          Últimas consultadas
        </h2>

        {recentFromCache.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-copper-400/20 to-gold-400/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-copper-400/50">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="font-inter text-sm text-brown-300 dark:text-cream-300/50 font-medium">
              Nenhuma música pesquisada ainda
            </p>
            <p className="font-inter text-xs text-brown-200 dark:text-cream-300/30 mt-1 max-w-[220px]">
              Busque uma canção acima para descobrir sua história
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentFromCache.map((item, i) => (
              <button
                key={`${item.titulo}_${item.artista}_${i}`}
                onClick={() => onOpenStory(item.titulo, item.artista)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-200/70 dark:hover:bg-dark-50/60 transition-colors duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-copper-400/25 to-gold-400/15 flex items-center justify-center flex-shrink-0 group-hover:from-copper-400/35 group-hover:to-gold-400/25 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-copper-500/70 group-hover:text-copper-500 transition-colors">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-inter text-sm font-medium text-brown-500 dark:text-cream-100 truncate group-hover:text-brown-600 dark:group-hover:text-cream-50 transition-colors">
                    {item.titulo}
                  </p>
                  <p className="font-inter text-xs text-brown-200 dark:text-cream-300/50 truncate">
                    {item.artista}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-brown-200 dark:text-cream-300/30 group-hover:text-copper-400 transition-colors flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Helper text */}
        <div className="mt-8 px-2">
          <p className="font-inter text-xs text-brown-200 dark:text-cream-300/40 text-center leading-relaxed">
            Ou identifique uma música pelo Shazam e toque na notificação do Origem.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-copper-400/60">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p className="font-inter text-[10px] text-copper-400/60">
              📖 Quer conhecer a história dessa música?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
