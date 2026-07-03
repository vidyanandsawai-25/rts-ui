'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { logger } from '@/lib/utils/logger';
import { WAYBACK_MAP_TILE_URL, type WaybackRelease } from '@/lib/api/wayback.service';

interface HistoricalPingPongControllerProps {
  map: L.Map | null;
  releases: WaybackRelease[];
  activeYear: number;
  lat?: number;
  lng?: number;
  onLoadChange?: (loading: boolean) => void;
  playing: boolean;
  speed: number;
  onActiveYearChange?: (year: number) => void;
  onStopPlaying?: () => void;
  onReleaseError?: (releaseId: number) => void;
}
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
  releases,
  activeYear,
  lat,
  lng,
  onLoadChange,
  playing,
  speed,
  onActiveYearChange,
  onStopPlaying,
  onReleaseError,
}: HistoricalPingPongControllerProps): null {
  const years = useMemo(() => releases.map((r) => r.year), [releases]);
  const lruOrderRef = useRef<number[]>([]);
  const layerLoadingStateRef = useRef<Map<number, boolean>>(new Map());
  const loopRef = useRef<number | null>(null);
  const stateRef = useRef({ playing, speed, years, activeYear, onActiveYearChange, onStopPlaying, onReleaseError });
  useEffect(() => {
    stateRef.current = { playing, speed, years, activeYear, onActiveYearChange, onStopPlaying, onReleaseError };
  }, [playing, speed, years, activeYear, onActiveYearChange, onStopPlaying, onReleaseError]);
  useEffect(() => {
    if (!map) return;
    const cache = getMapCache(map);
    cache.forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    cache.clear();
    lruOrderRef.current = [];
    layerLoadingStateRef.current.clear();
  }, [map, lat, lng]);
  const updateLoadingState = useCallback(() => {
    if (!onLoadChange || stateRef.current.years.length === 0) return;
    const active = stateRef.current.activeYear;
    const activeIdx = stateRef.current.years.indexOf(active);
    if (activeIdx === -1) return;
    const nextYear = activeIdx < stateRef.current.years.length - 1 ? stateRef.current.years[activeIdx + 1] : null;
    const isActiveLoading = layerLoadingStateRef.current.get(active) || false;
    const isNextLoading = (nextYear !== null && layerLoadingStateRef.current.get(nextYear)) || false;
    onLoadChange(isActiveLoading || isNextLoading);
  }, [onLoadChange]);

  const getOrCreateLayer = useCallback((year: number): L.TileLayer => {
    if (!map) return L.tileLayer('');
    const cache = getMapCache(map);
    let layer = cache.get(year);
    if (!layer) {
      const release = releases.find((r) => r.year === year);
      const releaseId = release?.releaseId ?? 0;
      layer = L.tileLayer(WAYBACK_MAP_TILE_URL(releaseId), {
        maxNativeZoom: 18,
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
      layer.on('tileerror', () => {
        setLoad(false);
        if (stateRef.current.onReleaseError && releaseId) stateRef.current.onReleaseError(releaseId);
      });
      cache.set(year, layer);
    }
    if (map.getContainer() && !map.hasLayer(layer)) layer.addTo(map);
    return layer;
  }, [map, releases, updateLoadingState]);

  useEffect(() => {
    if (!map || !map.getContainer() || years.length === 0) return;
    const activeIdx = years.indexOf(activeYear);
    if (activeIdx === -1) return;

    const prevYear = activeIdx > 0 ? years[activeIdx - 1] : null;
    const nextYear = activeIdx < years.length - 1 ? years[activeIdx + 1] : null;

    try {
      getOrCreateLayer(activeYear).setOpacity(1.0).setZIndex(10);
      if (prevYear !== null) getOrCreateLayer(prevYear).setOpacity(0.0).setZIndex(5);
      if (nextYear !== null) getOrCreateLayer(nextYear).setOpacity(0.0).setZIndex(5);

      const cache = getMapCache(map);
      cache.forEach((layer, y) => {
        if (y !== activeYear && y !== prevYear && y !== nextYear) {
          if (map.hasLayer(layer)) layer.setOpacity(0.0).setZIndex(1);
          if (layerLoadingStateRef.current.get(y)) layerLoadingStateRef.current.set(y, false);
        }
      });

      const idx = lruOrderRef.current.indexOf(activeYear);
      if (idx !== -1) lruOrderRef.current.splice(idx, 1);
      lruOrderRef.current.push(activeYear);

      while (lruOrderRef.current.length > 25) {
        const oldest = lruOrderRef.current.shift();
        if (oldest !== undefined && oldest !== stateRef.current.activeYear) {
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
  }, [map, activeYear, years, getOrCreateLayer, updateLoadingState]);

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
      if (!active || !stateRef.current.playing) return;
      const currentYear = stateRef.current.activeYear;
      const currentIdx = stateRef.current.years.indexOf(currentYear);
      if (currentIdx === -1) return;

      await new Promise((resolve) => {
        loopRef.current = setTimeout(resolve, stateRef.current.speed) as unknown as number;
      });

      if (!active || !stateRef.current.playing) return;

      if (stateRef.current.activeYear !== currentYear) {
        run();
        return;
      }

      if (layerLoadingStateRef.current.get(currentYear)) {
        await new Promise<void>((resolve) => {
          const startTime = Date.now();
          const check = () => {
            const timePassed = Date.now() - startTime;
            if (!active || !stateRef.current.playing || !layerLoadingStateRef.current.get(currentYear) || timePassed > 3000) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      }

      if (!active || !stateRef.current.playing) return;

      if (stateRef.current.activeYear !== currentYear) {
        run();
        return;
      }

      const nextIdx = currentIdx + 1;
      if (nextIdx >= stateRef.current.years.length) {
        stateRef.current.onStopPlaying?.();
        return;
      }
      stateRef.current.onActiveYearChange?.(stateRef.current.years[nextIdx]);
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
