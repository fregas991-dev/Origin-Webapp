import type { Screen } from '../types';

interface BottomNavProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream-100/95 dark:bg-dark-200/95 backdrop-blur-md border-t border-cream-300/60 dark:border-brown-500/30 dark-transition">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
            current === 'home' || current === 'story'
              ? 'text-copper-500 dark:text-copper-400 scale-105'
              : 'text-brown-300 dark:text-cream-300/40 hover:text-brown-400 dark:hover:text-cream-300/60'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={current === 'home' || current === 'story' ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-inter font-medium">Início</span>
        </button>

        <button
          onClick={() => onNavigate('saved')}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
            current === 'saved'
              ? 'text-copper-500 dark:text-copper-400 scale-105'
              : 'text-brown-300 dark:text-cream-300/40 hover:text-brown-400 dark:hover:text-cream-300/60'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={current === 'saved' ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <span className="text-[10px] font-inter font-medium">Salvos</span>
        </button>
      </div>
    </nav>
  );
}
