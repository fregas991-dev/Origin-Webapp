import { useState, useRef, useEffect } from 'react';
import { searchCache } from '../services/db';
import type { Historia } from '../types';

interface SearchBarProps {
  onSelect: (titulo: string, artista: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [musica, setMusica] = useState('');
  const [artista, setArtista] = useState('');
  const [suggestions, setSuggestions] = useState<Historia[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (musica.trim().length > 0 && !artista.trim()) {
      const results = searchCache(musica);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [musica, artista]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit() {
    const m = musica.trim();
    const a = artista.trim();
    if (m && a) {
      setMusica('');
      setArtista('');
      setShowSuggestions(false);
      onSelect(m, a);
    }
  }

  function handleSuggestionSelect(item: Historia) {
    setMusica('');
    setArtista('');
    setShowSuggestions(false);
    onSelect(item.titulo, item.artista);
  }

  const canSearch = musica.trim().length > 0 && artista.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto px-4">
      <div className="space-y-2">
        {/* Música input */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-300 dark:text-cream-300/60 pointer-events-none">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={musica}
            onChange={(e) => setMusica(e.target.value)}
            onFocus={() => {
              if (musica.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSearch) handleSubmit();
            }}
            placeholder="Música"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-cream-200/80 dark:bg-dark-50/80 border border-cream-300 dark:border-brown-500/40 text-brown-600 dark:text-cream-100 placeholder:text-brown-200 dark:placeholder:text-cream-300/40 font-inter text-sm focus:outline-none focus:border-copper-400 dark:focus:border-copper-400 focus:ring-2 focus:ring-copper-400/20 dark-transition"
          />
        </div>

        {/* Artista input */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-300 dark:text-cream-300/60 pointer-events-none">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSearch) handleSubmit();
            }}
            placeholder="Artista"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-cream-200/80 dark:bg-dark-50/80 border border-cream-300 dark:border-brown-500/40 text-brown-600 dark:text-cream-100 placeholder:text-brown-200 dark:placeholder:text-cream-300/40 font-inter text-sm focus:outline-none focus:border-copper-400 dark:focus:border-copper-400 focus:ring-2 focus:ring-copper-400/20 dark-transition"
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSubmit}
          disabled={!canSearch}
          className={`w-full h-10 rounded-xl font-inter text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 dark-transition ${
            canSearch
              ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-cream-100 shadow-md shadow-copper-600/20 hover:shadow-lg hover:shadow-copper-600/30 active:scale-[0.98]'
              : 'bg-cream-300/60 dark:bg-brown-500/30 text-brown-300 dark:text-cream-300/40 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Descobrir a origem
        </button>
      </div>

      {/* Suggestions dropdown from cache */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-4 right-4 top-[52px] z-40 bg-cream-100 dark:bg-dark-50 border border-cream-300 dark:border-brown-500/40 rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
          {suggestions.map((item, i) => (
            <button
              key={`${item.titulo}_${item.artista}_${i}`}
              onClick={() => handleSuggestionSelect(item)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-copper-300/15 dark:hover:bg-copper-500/10 transition-colors duration-150 ${
                i < suggestions.length - 1 ? 'border-b border-cream-300/50 dark:border-brown-500/20' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-copper-400/30 to-gold-400/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-copper-500">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-inter text-sm font-medium text-brown-500 dark:text-cream-100 truncate">{item.titulo}</p>
                <p className="font-inter text-xs text-brown-300 dark:text-cream-300/60 truncate">{item.artista}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
