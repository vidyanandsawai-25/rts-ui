"use client";
// @ts-nocheck
/* eslint-disable i18next/no-literal-string, @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ChangeDetectionMapProps {
  propertyId?: number;
  apiBaseUrl?: string;
  latitude?: number;
  longitude?: number;
}

// TileLayer Updater to force map refresh when URL changes
const TileLayerUpdater = ({ url }: { url: string }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map, url]);
  return <TileLayer url={url} maxZoom={20} />;
};

export default function ChangeDetectionMap({ latitude, longitude }: ChangeDetectionMapProps) {
  // Esri Wayback state
  const [waybackReleases, setWaybackReleases] = useState<{year: string, releaseNum: string, date: string}[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<{year: string, releaseNum: string, date: string} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Fetch Esri Wayback Config dynamically for ALL years
  useEffect(() => {
    const fetchWaybackConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json');
        if (!response.ok) {
          throw new Error(`Wayback config request failed: ${response.status}`);
        }
        const data = await response.json();
        
        const yearsMap: Record<string, { year: string, releaseNum: string, date: string }> = {};

        // Iterate through all releases in the config safely
        Object.values(data as Record<string, any>).forEach((r) => {
          const title = typeof r?.itemTitle === 'string' ? r.itemTitle : '';
          const match = /Wayback (\d{4})-(\d{2})-(\d{2})/.exec(title);
          if (!match) return;
          
          const itemUrl = typeof r?.itemURL === 'string' ? r.itemURL : '';
          const tilePart = itemUrl.split('/tile/')[1];
          if (!tilePart) return;
          
          const year = match[1];
          const date = `${match[1]}-${match[2]}-${match[3]}`;
          const releaseNum = tilePart.split('/')[0];
          if (!/^[0-9]+$/.test(releaseNum)) return;
          
          // Keep the release with the highest ID for each year
          if (!yearsMap[year] || Number(releaseNum) > Number(yearsMap[year].releaseNum)) {
            yearsMap[year] = { year, releaseNum, date };
          }
        });

        const mappedReleases = Object.values(yearsMap);

        // Sort chronologically
        mappedReleases.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        setWaybackReleases(mappedReleases);
        
        // Select the earliest available year by default
        if (mappedReleases.length > 0) {
          setSelectedRelease(mappedReleases[0]);
        }
      } catch (error) {
        console.error("Error fetching Wayback config:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWaybackConfig();
  }, []);

  if (latitude === undefined || longitude === undefined || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-950 text-slate-400 p-8 select-none">
        Location coordinates are not available for this property.
      </div>
    );
  }

  const center: [number, number] = [latitude, longitude];
  
  const boundsOffset = 0.001;
  const bounds: [[number, number], [number, number]] = [
    [latitude - boundsOffset, longitude - boundsOffset],
    [latitude + boundsOffset, longitude + boundsOffset],
  ];

  // Esri XYZ URL format
  const tileUrl = selectedRelease 
    ? `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${selectedRelease.releaseNum}/{z}/{y}/{x}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="w-full flex flex-col gap-4 bg-white p-4 rounded shadow">
      {/* Header and Sparse Timeline Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Change Detection (High-Res Historical)</h2>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <span className="font-semibold text-sm text-gray-600 mr-2">Available Data:</span>
            {isLoading ? (
               <span className="text-sm text-gray-500">Querying historical archive...</span>
            ) : (
              waybackReleases.map((release) => (
                <button
                  key={release.year}
                  onClick={() => setSelectedRelease(release)}
                  title={`Imagery from ${release.date}`}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedRelease?.year === release.year
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {release.year}
                </button>
              ))
            )}
          </div>
        </div>
        
        {selectedRelease && (
          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded text-sm text-gray-600">
            Currently viewing: <strong>{selectedRelease.date}</strong>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[600px] border border-gray-300 rounded overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-[1000] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        )}

        <MapContainer 
          center={center} 
          zoom={18} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayerUpdater url={tileUrl} />
          
          <Marker position={center} />
          <Rectangle bounds={bounds} pathOptions={{ color: '#FF0000', weight: 2, fillOpacity: 0 }} />
        </MapContainer>
      </div>
      <div className="text-xs text-gray-500 text-right">
        Imagery © Esri World Imagery Wayback
      </div>
    </div>
  );
}
