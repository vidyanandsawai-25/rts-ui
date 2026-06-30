import { NextRequest, NextResponse } from 'next/server';

interface CachedTile {
  data: Buffer;
  contentType: string;
}

const tileCache = new Map<string, CachedTile>();
const pendingRequests = new Map<string, Promise<CachedTile | null>>();

let yearToReleaseIdMap: Record<number, number> | null = null;
let mapFetchPromise: Promise<Record<number, number>> | null = null;

async function getYearToReleaseIdMap(): Promise<Record<number, number>> {
  if (yearToReleaseIdMap) return yearToReleaseIdMap;
  if (mapFetchPromise) return mapFetchPromise;

  mapFetchPromise = (async () => {
    try {
      const res = await fetch('https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json', {
        next: { revalidate: 86400 } // cache configuration for 24 hours
      });
      if (!res.ok) throw new Error('Failed to fetch wayback config');
      const config = (await res.json()) as Record<string, { itemTitle?: string }>;
      const dateRx = /(\d{4}-\d{2}-\d{2})/;
      const byYear: Record<number, { releaseId: number; date: string }> = {};

      Object.entries(config).forEach(([key, value]) => {
        const releaseId = parseInt(key, 10);
        if (isNaN(releaseId)) return;
        const match = dateRx.exec(value.itemTitle ?? '');
        if (!match) return;
        const date = match[1];
        const year = parseInt(date.slice(0, 4), 10);
        if (isNaN(year) || year < 2015) return;
        if (!byYear[year] || date > byYear[year].date) {
          byYear[year] = { releaseId, date };
        }
      });

      const resultMap: Record<number, number> = {};
      Object.entries(byYear).forEach(([year, { releaseId }]) => {
        resultMap[parseInt(year, 10)] = releaseId;
      });

      yearToReleaseIdMap = resultMap;
      return resultMap;
    } catch (error) {
      mapFetchPromise = null;
      throw error;
    }
  })();

  return mapFetchPromise;
}

async function fetchTile(releaseId: number, z: string, x: string, y: string): Promise<CachedTile | null> {
  const url = `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${releaseId}/${z}/${y}/${x}`;
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch tile from ArcGIS: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const data = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return { data, contentType };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string; z: string; x: string; y: string }> }
) {
  try {
    const { year, z, x, y } = await params;
    const yearNum = parseInt(year, 10);
    const cacheKey = `${year}/${z}/${x}/${y}`;

    // 1. Check in-memory cache
    const cached = tileCache.get(cacheKey);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.data), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Check pending requests for deduplication
    let fetchPromise = pendingRequests.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const mapping = await getYearToReleaseIdMap();
          const releaseId = mapping[yearNum];
          if (!releaseId) {
            throw new Error(`No release ID found for year ${year}`);
          }
          const result = await fetchTile(releaseId, z, x, y);
          if (result) {
            tileCache.set(cacheKey, result);
          }
          return result;
        } finally {
          pendingRequests.delete(cacheKey);
        }
      })();
      pendingRequests.set(cacheKey, fetchPromise);
    }

    const tile = await fetchPromise;
    if (!tile) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Uint8Array(tile.data), {
      headers: {
        'Content-Type': tile.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
