export interface WaybackRelease {
  releaseId: number;
  date: string;
  year: number;
}

/**
 * Leaflet-compatible URL template for Wayback satellite tiles.
 * Uses `{z}`, `{y}`, `{x}` placeholders that Leaflet substitutes automatically.
 */
export const WAYBACK_MAP_TILE_URL = (releaseId: number): string =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${releaseId}/{z}/{y}/{x}`;

/**
 * Direct tile URL for static image previews (e.g. Change Detection card thumbnails).
 * Requires pre-computed tile coordinates (x, y, z).
 */
export const WAYBACK_STATIC_TILE_URL = (
  releaseId: number,
  x: number,
  y: number,
  z: number
): string =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${releaseId}/${z}/${y}/${x}`;

export async function fetchWaybackReleases(): Promise<WaybackRelease[]> {
  try {
    const { getWaybackItems } = await import('@esri/wayback-core');
    const items = await getWaybackItems();

    interface IWaybackItem {
      itemTitle?: string;
      releaseDatetime: string | number | Date;
      releaseNum: number;
    }

    const byYear: Record<number, WaybackRelease> = {};
    items.forEach((i: IWaybackItem) => {
      const match = /(\d{4}-\d{2}-\d{2})/.exec(i.itemTitle ?? '');
      const dateStr = match ? match[1] : new Date(i.releaseDatetime).toISOString().split('T')[0];
      const year = parseInt(dateStr.slice(0, 4), 10);
      if (isNaN(year)) return;

      if (!byYear[year] || dateStr > byYear[year].date) {
        byYear[year] = {
          releaseId: i.releaseNum,
          date: dateStr,
          year,
        };
      }
    });

    return Object.values(byYear).sort((a, b) => a.year - b.year);
  } catch {
    return [];
  }
}

const localChangesPromises = new Map<string, Promise<WaybackRelease[]>>();
const localChangesCache = new Map<string, WaybackRelease[]>();

// Prefetch @esri/wayback-core during idle time so the module is cached
// before the user opens Change Detection, eliminating dynamic import latency.
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
    import('@esri/wayback-core').catch(() => {/* ignore prefetch errors */});
  });
} else if (typeof window !== 'undefined') {
  setTimeout(() => {
    import('@esri/wayback-core').catch(() => {/* ignore prefetch errors */});
  }, 2000);
}

/**
 * Fetches only the sparse Wayback releases where actual imagery changes occurred for the given coordinates.
 */
export async function fetchLocalChanges(lat: number, lng: number): Promise<WaybackRelease[]> {
  if (!lat || !lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return [];
  }

  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

  // 1. Check in-memory results cache
  if (localChangesCache.has(cacheKey)) {
    return localChangesCache.get(cacheKey)!;
  }

  // 2. Check if a request is already in progress for these coordinates
  if (localChangesPromises.has(cacheKey)) {
    return localChangesPromises.get(cacheKey)!;
  }

  // 3. Check sessionStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(`wayback_local_${cacheKey}`);
      if (cached) {
        const parsed = JSON.parse(cached) as WaybackRelease[];
        localChangesCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // Ignore sessionStorage read errors
    }
  }

  // 4. Create and cache the promise to deduplicate active requests
  const promise = (async () => {
    try {
      const { getWaybackItems, long2tile, lat2tile } = await import('@esri/wayback-core');
      const allItems = await getWaybackItems();

      const level = 16;
      const column = long2tile(lng, level);
      const row = lat2tile(lat, level);

      const tilemapUrl = `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap/${level}/${row}/${column}`;
      const res = await fetch(tilemapUrl);
      if (!res.ok) throw new Error(`Tilemap fetch failed with status ${res.status}`);

      const tilemapData = await res.json();
      const selectReleases = new Set<number>(
        Array.isArray(tilemapData.select) ? tilemapData.select.map((n: unknown) => Number(n)) : []
      );

      const matchedItems = selectReleases.size > 0
        ? allItems.filter((item: { releaseNum: number }) => selectReleases.has(item.releaseNum))
        : allItems;

      interface IWaybackItem {
        itemTitle?: string;
        releaseDatetime: string | number | Date;
        releaseNum: number;
      }

      const byYear: Record<number, WaybackRelease> = {};
      matchedItems.forEach((i: IWaybackItem) => {
        const match = /(\d{4}-\d{2}-\d{2})/.exec(i.itemTitle ?? '');
        const dateStr = match ? match[1] : new Date(i.releaseDatetime).toISOString().split('T')[0];
        const year = parseInt(dateStr.slice(0, 4), 10);
        if (isNaN(year)) return;

        if (!byYear[year] || dateStr > byYear[year].date) {
          byYear[year] = {
            releaseId: i.releaseNum,
            date: dateStr,
            year,
          };
        }
      });

      const result = Object.values(byYear).sort((a, b) => a.year - b.year);

      // Save to results cache
      localChangesCache.set(cacheKey, result);

      // Limit memory cache size to prevent leaks (FIFO eviction)
      if (localChangesCache.size > 100) {
        const oldestKey = localChangesCache.keys().next().value;
        if (oldestKey !== undefined) {
          localChangesCache.delete(oldestKey);
        }
      }

      if (typeof window !== 'undefined' && result.length > 0) {
        try {
          sessionStorage.setItem(`wayback_local_${cacheKey}`, JSON.stringify(result));
        } catch {
          // Ignore sessionStorage write errors
        }
      }

      return result;
    } catch {
      // Ignore fetching errors
      return [];
    } finally {
      // Clean up the promise once resolved/completed
      localChangesPromises.delete(cacheKey);
    }
  })();

  localChangesPromises.set(cacheKey, promise);
  return promise;
}
