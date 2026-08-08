import type { Historia } from '../types';

const STORAGE_KEY = 'origem_historias';

function readAll(): Historia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Historia[];
  } catch {
    return [];
  }
}

function writeAll(items: Historia[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

function makeKey(musica: string, artista: string): string {
  return `${musica}::${artista}`;
}

export function getCachedHistoria(musica: string, artista: string): Historia | null {
  const items = readAll();
  const key = makeKey(musica, artista);
  return items.find((h) => makeKey(h.titulo, h.artista) === key) || null;
}

export function saveHistoria(musica: string, artista: string, data: Historia): void {
  const items = readAll();
  const key = makeKey(musica, artista);
  const idx = items.findIndex((h) => makeKey(h.titulo, h.artista) === key);
  const entry: Historia = { ...data, titulo: musica, artista, timestamp: Date.now() };

  if (idx >= 0) {
    items[idx] = { ...items[idx], ...entry };
  } else {
    items.unshift(entry);
  }
  writeAll(items);
}

export function getAllRecent(): Historia[] {
  return readAll().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export function getAllSaved(): Historia[] {
  return readAll()
    .filter((h) => h.salvo)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export function toggleSalvo(musica: string, artista: string): void {
  const items = readAll();
  const key = makeKey(musica, artista);
  const idx = items.findIndex((h) => makeKey(h.titulo, h.artista) === key);
  if (idx >= 0) {
    items[idx].salvo = !items[idx].salvo;
    writeAll(items);
  }
}

export function deleteHistoria(musica: string, artista: string): void {
  const items = readAll();
  const key = makeKey(musica, artista);
  writeAll(items.filter((h) => makeKey(h.titulo, h.artista) !== key));
}

export function searchCache(query: string): Historia[] {
  if (!query.trim()) return [];
  const norm = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return readAll().filter((h) => {
    const t = h.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const a = h.artista.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return t.includes(norm) || a.includes(norm);
  }).slice(0, 5);
}
