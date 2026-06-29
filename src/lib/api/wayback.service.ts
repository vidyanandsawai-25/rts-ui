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
export const WAYBACK_STATIC_TILE_URL = (releaseId: number, x: number, y: number, z: number): string =>
  `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${releaseId}/${z}/${y}/${x}`;

export async function fetchWaybackReleases(): Promise<WaybackRelease[]> {
  try {
    const res = await fetch(
      'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json',
      { cache: 'force-cache' }
    );
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
      if (isNaN(year) || year < 2014) return;
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
