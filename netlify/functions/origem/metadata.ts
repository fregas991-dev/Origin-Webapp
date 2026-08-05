interface MusicBrainzResult {
  titulo: string;
  artista: string;
  album?: string;
  ano?: string;
  compositores?: string[];
  isrc?: string;
  pais?: string;
}

interface WikipediaResult {
  titulo: string;
  resumo: string;
  url?: string;
}

// ── MusicBrainz ──
async function buscarMusicBrainz(
  titulo: string,
  artista: string
): Promise<MusicBrainzResult | null> {
  try {
    const query = encodeURIComponent(
      `recording:"${titulo}" AND artist:"${artista}"`
    );
    const url = `https://musicbrainz.org/ws/2/recording/?query=${query}&fmt=json&limit=3`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OrigemApp/1.0 (contato@origem.app)',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const recording = data.recordings?.[0];
    if (!recording) return null;

    const compositores: string[] = [];
    if (recording['artist-credit']) {
      for (const credit of recording['artist-credit']) {
        if (credit.name) compositores.push(credit.name);
      }
    }

    return {
      titulo: recording.title || titulo,
      artista: recording['artist-credit']?.[0]?.name || artista,
      album: recording.releases?.[0]?.title,
      ano: recording['first-release-date']?.substring(0, 4),
      compositores: compositores.length > 0 ? compositores : undefined,
      isrc: recording.isrcs?.[0],
      pais: recording.releases?.[0]?.country,
    };
  } catch {
    return null;
  }
}

// ── Wikipedia (PT) ──
async function buscarWikipedia(
  titulo: string,
  artista: string
): Promise<WikipediaResult | null> {
  try {
    const searchQuery = encodeURIComponent(`${titulo} ${artista} canção`);
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${searchQuery}&limit=3&format=json`;

    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(3000),
    });
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const pageTitles: string[] = searchData[1] || [];
    if (pageTitles.length === 0) return null;

    const pageTitle = encodeURIComponent(pageTitles[0]);
    const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;

    const summaryRes = await fetch(summaryUrl, {
      signal: AbortSignal.timeout(3000),
    });
    if (!summaryRes.ok) return null;

    const summaryData = await summaryRes.json();

    return {
      titulo: summaryData.title || pageTitles[0],
      resumo: summaryData.extract || '',
      url: summaryData.content_urls?.desktop?.page,
    };
  } catch {
    return null;
  }
}

// ── Deezer (capa do álbum + foto do artista) ──
// Gratuito, sem API key
async function buscarImagemDeezer(
  titulo: string,
  artista: string
): Promise<{ albumCover?: string; artistPhoto?: string } | null> {
  try {
    const query = encodeURIComponent(`artist:"${artista}" track:"${titulo}"`);
    const url = `https://api.deezer.com/search?q=${query}&limit=1`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const track = data.data?.[0];
    if (!track) return null;

    return {
      // Deezer retorna capa em 4 tamanhos: small, medium, big, xl
      albumCover: track.album?.cover_big || track.album?.cover_medium || undefined,
      artistPhoto: track.artist?.picture_medium || undefined,
    };
  } catch {
    return null;
  }
}

// ── iTunes (fallback — capa em alta resolução) ──
// Gratuito, sem API key
async function buscarImagemiTunes(
  titulo: string,
  artista: string
): Promise<string | null> {
  try {
    const term = encodeURIComponent(`${artista} ${titulo}`);
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const track = data.results?.[0];
    if (!track?.artworkUrl100) return null;

    // iTunes retorna 100x100 por padrão, mas podemos trocar para 600x600
    // O URL segue o padrão: .../source/100x100bb.jpg
    return track.artworkUrl100.replace('100x100', '600x600');
  } catch {
    return null;
  }
}

// ── Orchestrator ──
export interface MetadadosCompletos {
  musicBrainz: MusicBrainzResult | null;
  wikipedia: WikipediaResult | null;
  capaUrl: string | null;
  artistaFotoUrl: string | null;
}

export async function buscarMetadados(
  titulo: string,
  artista: string
): Promise<MetadadosCompletos> {
  const [musicBrainzResult, wikipediaResult, deezerResult] = await Promise.allSettled([
    buscarMusicBrainz(titulo, artista),
    buscarWikipedia(titulo, artista),
    buscarImagemDeezer(titulo, artista),
  ]);

  const mb = musicBrainzResult.status === 'fulfilled' ? musicBrainzResult.value : null;
  const wiki = wikipediaResult.status === 'fulfilled' ? wikipediaResult.value : null;
  const deezer = deezerResult.status === 'fulfilled' ? deezerResult.value : null;

  // Capa do álbum: Deezer → iTunes fallback
  let capaUrl: string | null = deezer?.albumCover || null;
  let artistaFotoUrl: string | null = deezer?.artistPhoto || null;

  if (!capaUrl) {
    const itunesCover = await buscarImagemiTunes(titulo, artista).catch(() => null);
    capaUrl = itunesCover;
  }

  return {
    musicBrainz: mb,
    wikipedia: wiki,
    capaUrl,
    artistaFotoUrl,
  };
}
