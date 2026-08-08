interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Header({ darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="text-center pt-5 pb-3 px-4 relative">
      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-cream-200/80 dark:bg-dark-50/80 border border-cream-300 dark:border-brown-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 dark-transition"
        aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
      >
        {darkMode ? (
          // Sun icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gold-400">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-brown-400">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* Top decorative line */}
      <div className="mx-auto mb-3 w-24 h-[1px] bg-gradient-to-r from-transparent via-copper-400/50 to-transparent" />

      <h1
        className="font-playfair text-[1.75rem] font-bold text-brown-600 dark:text-cream-100"
        style={{ letterSpacing: '0.2em' }}
      >
        ORIGEM
      </h1>

      {/* Decorative diamond */}
      <div className="flex items-center justify-center gap-2 mt-1.5 mb-1">
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent to-copper-400/40" />
        <div className="w-1.5 h-1.5 rotate-45 bg-copper-400/40" />
        <div className="w-6 h-[1px] bg-gradient-to-l from-transparent to-copper-400/40" />
      </div>

      <p className="font-inter text-[10px] text-brown-300 dark:text-cream-300/60 tracking-[0.12em] italic">
        A história por trás da canção
      </p>
    </header>
  );
}
