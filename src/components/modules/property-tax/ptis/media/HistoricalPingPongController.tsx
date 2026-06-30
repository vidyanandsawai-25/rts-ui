'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { logger } from '@/lib/utils/logger';

interface HistoricalPingPongControllerProps {
  map: L.Map | null;
  years: number[];
  activeYear: number;
  getTileUrl: (year: number) => string;
  onLoadChange?: (loading: boolean) => void;
  playing: boolean;
  speed: number;
  onActiveYearChange?: (year: number) => void;
}

// WeakMap to cache layers per L.Map instance without mutating the map object itself
const mapTileLayersCache = new WeakMap<L.Map, Map<number, L.TileLayer>>();

function getMapCache(map: L.Map): Map<number, L.TileLayer> {
  let cache = mapTileLayersCache.get(map);
  if (!cache) {
    cache = new Map<number, L.TileLayer>();
    mapTileLayersCache.set(map, cache);
  }
  return cache;
}

export function HistoricalPingPongController({
  map,
  years,
  activeYear,
  getTileUrl,
  onLoadChange,
  playing,
  speed,
  onActiveYearChange,
}: HistoricalPingPongControllerProps): null {
  const lruOrderRef = useRef<number[]>([]);
  const layerLoadingStateRef = useRef<Map<number, boolean>>(new Map());
  const loopRef = useRef<number | null>(null);

  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const yearsRef = useRef(years);
  yearsRef.current = years;
  const activeYearRef = useRef(activeYear);
  activeYearRef.current = activeYear;
  const onActiveYearChangeRef = useRef(onActiveYearChange);
  onActiveYearChangeRef.current = onActiveYearChange;

  const updateLoadingState = () => {
    if (!onLoadChange || yearsRef.current.length === 0) return;
    const active = activeYearRef.current;
    const activeIdx = yearsRef.current.indexOf(active);
    if (activeIdx === -1) return;

    const nextYear = yearsRef.current[(activeIdx + 1) % yearsRef.current.length];
    const isActiveLoading = layerLoadingStateRef.current.get(active) || false;
    const isNextLoading = (nextYear !== undefined && layerLoadingStateRef.current.get(nextYear)) || false;

    onLoadChange(isActiveLoading || isNextLoading);
  };

  const getOrCreateLayer = (year: number): L.TileLayer => {
    if (!map) return L.tileLayer('');

    const cache = getMapCache(map);
    let layer = cache.get(year);
    if (!layer) {
      layer = L.tileLayer(getTileUrl(year), {
        maxNativeZoom: 19,
        maxZoom: 21,
        keepBuffer: 12,
        updateWhenIdle: true,
        updateWhenZooming: false,
        className: 'timelapse-tile-layer',
        attribution: '© Esri, Wayback, Maxar',
      });

      const setLoad = (loading: boolean) => {
        layerLoadingStateRef.current.set(year, loading);
        updateLoadingState();
      };
      layer.on('loading', () => setLoad(true));
      layer.on('load', () => setLoad(false));
      layer.on('tileerror', () => setLoad(false));

      cache.set(year, layer);
    }

    if (map.getContainer() && !map.hasLayer(layer)) {
      layer.addTo(map);
    }
    return layer;
  };

  // Sync activeYear and preload prev/next
  useEffect(() => {
    if (!map || !map.getContainer() || years.length === 0) return;
    const activeIdx = years.indexOf(activeYear);
    if (activeIdx === -1) return;

    const prevYear = activeIdx > 0 ? years[activeIdx - 1] : null;
    const nextYear = activeIdx < years.length - 1 ? years[activeIdx + 1] : null;

    try {
      const activeLayer = getOrCreateLayer(activeYear);
      activeLayer.setOpacity(1.0).setZIndex(10);

      if (prevYear !== null) getOrCreateLayer(prevYear).setOpacity(0.0).setZIndex(5);
      if (nextYear !== null) getOrCreateLayer(nextYear).setOpacity(0.0).setZIndex(5);

      // Hide and remove other cached layers from Leaflet map
      const cache = getMapCache(map);
      cache.forEach((layer, y) => {
        if (y !== activeYear && y !== prevYear && y !== nextYear) {
          if (map.hasLayer(layer)) {
            layer.setOpacity(0.0);
            map.removeLayer(layer);
          }
          if (layerLoadingStateRef.current.get(y)) {
            layerLoadingStateRef.current.set(y, false);
          }
        }
      });

      // Update LRU Cache order
      const idx = lruOrderRef.current.indexOf(activeYear);
      if (idx !== -1) lruOrderRef.current.splice(idx, 1);
      lruOrderRef.current.push(activeYear);

      // Evict oldest if cache exceeds size 25
      while (lruOrderRef.current.length > 25) {
        const oldest = lruOrderRef.current.shift();
        if (oldest !== undefined && oldest !== activeYearRef.current) {
          const oldLayer = cache.get(oldest);
          if (oldLayer) {
            oldLayer.off();
            if (map.hasLayer(oldLayer)) map.removeLayer(oldLayer);
            cache.delete(oldest);
            layerLoadingStateRef.current.delete(oldest);
          }
        }
      }
      updateLoadingState();
    } catch (err) {
      logger.error('Error updating map layers in controller', { error: err as Error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeYear, years]);

  // Autoplay loop
  useEffect(() => {
    if (!playing) {
      if (loopRef.current) {
        clearTimeout(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    let active = true;
    const run = async () => {
      if (!active || !playingRef.current) return;
      const currentYear = activeYearRef.current;
      const currentIdx = yearsRef.current.indexOf(currentYear);
      if (currentIdx === -1) return;

      await new Promise((resolve) => {
        loopRef.current = setTimeout(resolve, speedRef.current) as unknown as number;
      });

      if (!active || !playingRef.current) return;

      if (layerLoadingStateRef.current.get(currentYear)) {
        await new Promise<void>((resolve) => {
          const check = () => {
            if (!active || !playingRef.current) return resolve();
            if (!layerLoadingStateRef.current.get(currentYear)) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }

      if (!active || !playingRef.current) return;

      const nextIdx = (currentIdx + 1) % yearsRef.current.length;
      onActiveYearChangeRef.current?.(yearsRef.current[nextIdx]);
      run();
    };

    run();

    return () => {
      active = false;
      if (loopRef.current) {
        clearTimeout(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [playing]);

  return null;
}
