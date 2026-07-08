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
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${releaseId}/{z}/{y}/{x}`;

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json',
      { cache: 'force-cache', signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const config: Record<string, { itemTitle?: string }> = await res.json();
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

    return Object.entries(byYear)
      .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
      .map(([year, { releaseId, date }]) => ({
        releaseId,
        date,
        year: parseInt(year, 10),
      }));
  } catch {
    return [];
  }
}

/**
 * Fetches only the sparse Wayback releases where actual imagery changes occurred for the given coordinates.
 */
export async function fetchLocalChanges(lat: number, lng: number): Promise<WaybackRelease[]> {
  try {
    // Dynamic import to avoid SSR issues with the esri library
    const { getWaybackItemsWithLocalChanges } = await import('@esri/wayback-core');
    const items = await getWaybackItemsWithLocalChanges(
      { latitude: lat, longitude: lng },
      18
    );

    interface IWaybackItem {
      itemTitle?: string;
      releaseDatetime: string | number | Date;
      releaseNum: number;
    }

    const mapped = items.map((i: IWaybackItem) => {
      const match = /(\d{4}-\d{2}-\d{2})/.exec(i.itemTitle ?? '');
      const dateStr = match ? match[1] : new Date(i.releaseDatetime).toISOString().split('T')[0];
      const year = parseInt(dateStr.slice(0, 4), 10);
      return {
        releaseId: i.releaseNum,
        date: dateStr,
        year
      };
    });

    // Deduplicate by year, keeping the latest release per year, and sort chronologically
    const byYear: Record<number, WaybackRelease> = {};
    mapped.forEach((rel: WaybackRelease) => {
      if (!byYear[rel.year] || rel.date > byYear[rel.year].date) {
        byYear[rel.year] = rel;
      }
    });

    return Object.values(byYear).sort((a, b) => a.year - b.year);
  } catch (error) {
    console.error('Error fetching local changes from Esri:', error);
    return [];
  }
}
