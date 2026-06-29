'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WAYBACK_MAP_TILE_URL, type WaybackRelease } from '@/lib/api/wayback.service';
import { HistoricalPingPongController } from './HistoricalPingPongController';

interface LeafletDefaultIconPrototype {
  _getIconUrl?: () => string;
}

interface LeafletElement extends HTMLDivElement {
  _leaflet_id?: number;
}

interface TimelapseMapProps {
  lat: number;
  lng: number;
  activeRelease: WaybackRelease | null;
  showLabels: boolean;
  playing: boolean;
  speed: number;
  waybackReleases: WaybackRelease[];
  onLoadChange: (loading: boolean) => void;
  onActiveYearChange: (year: number) => void;
  onReleaseError?: (releaseId: number) => void;
}

const LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

export const TimelapseMap = React.memo(function TimelapseMap({
  lat,
  lng,
  activeRelease,
  showLabels,
  playing,
  speed,
  waybackReleases,
  onLoadChange,
  onActiveYearChange,
}: TimelapseMapProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const highlightRef = useRef<L.Rectangle | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const DefaultIcon = L.Icon.Default as unknown as { prototype: LeafletDefaultIconPrototype };
    delete DefaultIcon.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, {
      zoomControl: true,
      zoomAnimation: false,
      fadeAnimation: false,
      minZoom: 15,
      maxZoom: 21,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView([lat, lng], 17);

    // Explicitly disable all non-button zoom interactions
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    if ((map as any).tap) {
      (map as any).tap.disable();
    }

    mapRef.current = map;
    setMapInstance(map);

    const resizeObserver = new ResizeObserver(() => {
      try {
        if (mapRef.current && (mapRef.current as any)._container) {
          mapRef.current.invalidateSize();
        }
      } catch (err) {
        // Safe fallback for DOM teardown
      }
    });
    resizeObserver.observe(containerRef.current);

    const labelsLayer = L.tileLayer(LABELS_URL, {
      maxNativeZoom: 19,
      maxZoom: 21,
      opacity: 0.9,
      attribution: 'Labels © Esri',
      keepBuffer: 8,
    });
    if (showLabels) labelsLayer.addTo(map);
    labelsLayerRef.current = labelsLayer;

    markerRef.current = L.circleMarker([lat, lng], {
      radius: 6,
      color: '#ff2200',
      fillColor: '#ff3300',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);

    const delta = 0.0005;
    highlightRef.current = L.rectangle(
      [
        [lat - delta, lng - delta],
        [lat + delta, lng + delta],
      ],
      {
        color: '#ff2200',
        weight: 2.5,
        opacity: 0.9,
        fillColor: '#ff5500',
        fillOpacity: 0.07,
        className: 'property-highlight',
      }
    ).addTo(map);

    if (labelsLayerRef.current) labelsLayerRef.current.bringToFront();
    if (highlightRef.current) highlightRef.current.bringToFront();

    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      
      const mapToClean = mapRef.current;
      mapRef.current = null;
      setMapInstance(null);

      if (mapToClean) {
        try {
          mapToClean.stop();
          mapToClean.remove();
        } catch (e) {
          // Safe fallback for double destroy
        }
      }

      if (containerRef.current) {
        delete (containerRef.current as LeafletElement)._leaflet_id;
        containerRef.current.innerHTML = '';
      }
      labelsLayerRef.current = null;
      highlightRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update Coordinates, Bounds and restrict panning
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as any)._container) return;

    try {
      map.setView([lat, lng], 17);

      // Restrict map dragging to property bounds to limit unnecessary tile loads
      const boundsPadding = 0.003;
      const maxBounds = L.latLngBounds(
        [lat - boundsPadding, lng - boundsPadding],
        [lat + boundsPadding, lng + boundsPadding]
      );
      map.setMaxBounds(maxBounds);

      const marker = markerRef.current;
      if (marker && (marker as any)._map && (marker as any)._map._container) {
        marker.setLatLng([lat, lng]);
      }
      const highlight = highlightRef.current;
      if (highlight && (highlight as any)._map && (highlight as any)._map._container) {
        const delta = 0.0005;
        highlight.setBounds([
          [lat - delta, lng - delta],
          [lat + delta, lng + delta],
        ]);
      }
    } catch (e) {
      // Safe fallback
    }
  }, [lat, lng]);

  // Update Labels visibility
  useEffect(() => {
    const map = mapRef.current;
    const layer = labelsLayerRef.current;
    if (!map || !(map as any)._container || !layer) return;

    try {
      if (showLabels && !playing) {
        if (!map.hasLayer(layer)) {
          layer.addTo(map);
        }
        layer.bringToFront();
      } else {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      }
    } catch (e) {
      // Safe fallback
    }
  }, [showLabels, playing]);

  return (
    <>
      <style>{`.timelapse-tile-layer { transition: opacity 0.5s ease-in-out !important; }`}</style>
      <div ref={containerRef} className="absolute inset-0 w-full h-full border border-slate-700 rounded-lg overflow-hidden bg-slate-950" />
      <HistoricalPingPongController
        map={mapInstance}
        years={waybackReleases.map((r) => r.year)}
        activeYear={activeRelease?.year ?? 0}
        getTileUrl={(year) => {
          const release = waybackReleases.find((r) => r.year === year);
          return release ? WAYBACK_MAP_TILE_URL(release.releaseId) : '';
        }}
        onLoadChange={onLoadChange}
        playing={playing}
        speed={speed}
        onActiveYearChange={onActiveYearChange}
      />
    </>
  );
});
