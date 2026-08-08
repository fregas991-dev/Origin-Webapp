interface SongCardProps {
  titulo: string;
  artista: string;
  album?: string;
  compositores?: string[];
  capaUrl?: string;
}

export default function SongCard({ titulo, artista, album, compositores, capaUrl }: SongCardProps) {
  return (
    <div className="mx-4 rounded-2xl animate-fade-in-up-delay overflow-hidden relative">
      <div className="p-4 bg-gradient-to-br from-brown-500/92 via-brown-400/88 to-copper-500/82 dark:from-dark-50 dark:via-dark-100 dark:to-brown-500/70 shadow-lg shadow-brown-700/22 dark:shadow-black/30 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none">
          <div className="absolute top-3 right-3 w-12 h-12 rounded-full border border-gold-400" />
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-gold-300" />
        </div>

        {/* Gold shimmer */}
        <div className="absolute inset-0 gold-shimmer rounded-2xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          {/* Album cover */}
          <div className={`rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-gold-400/25 dark:ring-copper-400/30 ${capaUrl ? 'w-20 h-20' : 'w-16 h-16'}`}>
            {capaUrl ? (
              <img src={capaUrl} alt={titulo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-copper-400/40 to-gold-400/30 dark:from-copper-500/30 dark:to-gold-400/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-gold-300/80 dark:text-copper-300/70">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
            )}
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-gold-300/80 dark:text-copper-300/60 font-medium">
              Identificada
            </p>
            <p className="font-playfair text-lg font-semibold text-cream-100 dark:text-cream-50 mt-0.5 truncate leading-snug">
              &ldquo;{titulo}&rdquo;
            </p>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gold-300/60 dark:text-copper-300/40 mt-1.5 font-medium">
              Artista
            </p>
            <p className="font-inter text-sm text-cream-200/90 dark:text-cream-300/80 font-medium truncate">
              {artista}
            </p>

            {/* Album & compositores — extra metadata */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
              {album && (
                <span className="font-inter text-[10px] text-gold-300/60 dark:text-gold-300/40">
                  🎵 {album}
                </span>
              )}
              {compositores && compositores.length > 0 && (
                <span className="font-inter text-[10px] text-gold-300/60 dark:text-gold-300/40 truncate">
                  ✍️ {compositores.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-3 h-[1px] bg-gradient-to-r from-gold-400/30 via-gold-400/10 to-transparent dark:from-copper-400/20 dark:via-copper-400/5 relative z-10" />
      </div>
    </div>
  );
}
