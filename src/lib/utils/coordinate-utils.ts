interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts Latitude and Longitude to slippy map tile coordinates at a given zoom level.
 * Used to construct tile URLs for static map previews.
 */
export function latLngToTile(lat: number, lng: number, zoom: number): TileCoordinates {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}
