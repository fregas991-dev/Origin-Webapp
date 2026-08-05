import { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import StoryScreen from './components/StoryScreen';
import SavedScreen from './components/SavedScreen';
import BottomNav from './components/BottomNav';
import { getAllRecent } from './services/db';
import type { Screen, Historia } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [musica, setMusica] = useState<string>('');
  const [artista, setArtista] = useState<string>('');
  const [recentFromCache, setRecentFromCache] = useState<Historia[]>([]);
  const [savedRefresh, setSavedRefresh] = useState(0);

  // Dark mode — persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('origem_dark');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('origem_dark', String(darkMode));
    } catch {}
  }, [darkMode]);

  const toggleDark = useCallback(() => setDarkMode((prev) => !prev), []);

  // Read query params on mount — deep link from native app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('musica');
    const a = params.get('artista');

    if (m && a) {
      setMusica(m);
      setArtista(a);
      setScreen('story');
    }

    loadRecentFromCache();

    // Handle browser back button (WebView)
    function handlePopState() {
      const p = new URLSearchParams(window.location.search);
      const m2 = p.get('musica');
      const a2 = p.get('artista');
      if (m2 && a2) {
        setMusica(m2);
        setArtista(a2);
        setScreen('story');
      } else {
        setScreen('home');
        setMusica('');
        setArtista('');
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reload data when screen changes
  useEffect(() => {
    if (screen === 'home') loadRecentFromCache();
    if (screen === 'saved') setSavedRefresh((prev) => prev + 1);
  }, [screen]);

  function loadRecentFromCache() {
    const items = getAllRecent();
    setRecentFromCache(items);
  }

  const openStory = useCallback((titulo: string, artistaParam: string) => {
    setMusica(titulo);
    setArtista(artistaParam);
    setScreen('story');

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('musica', titulo);
    url.searchParams.set('artista', artistaParam);
    window.history.pushState({}, '', url.toString());
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
    setMusica('');
    setArtista('');

    const url = new URL(window.location.origin + window.location.pathname);
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleNavigate = useCallback((target: Screen) => {
    if (target === 'home') goHome();
    else setScreen(target);
  }, [goHome]);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-200 grain-overlay dark-transition">
      {/* Subtle top gradient */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-cream-50/80 to-transparent dark:from-dark-300/80 dark:to-transparent pointer-events-none z-30" />

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto">
        {screen === 'home' && (
          <HomeScreen
            onOpenStory={openStory}
            recentFromCache={recentFromCache}
            darkMode={darkMode}
            onToggleDark={toggleDark}
          />
        )}

        {screen === 'story' && musica && artista && (
          <StoryScreen
            key={`${musica}_${artista}`}
            musica={musica}
            artista={artista}
            darkMode={darkMode}
            onToggleDark={toggleDark}
            onBack={goHome}
          />
        )}

        {screen === 'saved' && (
          <SavedScreen
            onOpenStory={openStory}
            darkMode={darkMode}
            onToggleDark={toggleDark}
            refreshTrigger={savedRefresh}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav current={screen} onNavigate={handleNavigate} />
    </div>
  );
}
