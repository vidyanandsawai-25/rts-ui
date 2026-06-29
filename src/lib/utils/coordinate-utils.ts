import { getUlbDataFromCookies } from '@/lib/utils/cookie';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Returns the default centre-point coordinates based on the active ULB (Urban Local Body).
 * Falls back to Thane if no match is found.
 */
export function getDefaultCoordinates(): Coordinates {
  const ulb = getUlbDataFromCookies();
  const name = (ulb.ulbName || '').toLowerCase();
  const code = (ulb.ulbCode || '').toLowerCase();

  if (name.includes('mumbai') || code.includes('mcgm') || code.includes('bmc')) {
    return { lat: 19.076, lng: 72.8777 };
  }
  if (name.includes('amravati') || code.includes('amc') || code.includes('amt')) {
    return { lat: 20.932, lng: 77.7523 };
  }
  if (name.includes('pune') || code.includes('pmc')) {
    return { lat: 18.5204, lng: 73.8567 };
  }

  return { lat: 19.2183, lng: 72.9781 };
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
