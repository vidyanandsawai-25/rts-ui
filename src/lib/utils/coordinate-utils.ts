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
  const maxLat = 85.05112878;
  const clampedLat = Math.max(-maxLat, Math.min(maxLat, lat));
  const wrappedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
  const latRad = (clampedLat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.min(n - 1, Math.max(0, Math.floor(((wrappedLng + 180) / 360) * n)));
  const y = Math.min(
    n - 1,
    Math.max(
      0,
      Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n)
    )
  );
  return { x, y, z: zoom };
}
