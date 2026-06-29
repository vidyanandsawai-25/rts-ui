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
  const layersMapRef = useRef<Map<number, L.TileLayer>>(new Map());
  const lruOrderRef = useRef<number[]>([]);
  const layerLoadingStateRef = useRef<Map<number, boolean>>(new Map());
  const loopRef = useRef<number | null>(null);

  // Refs for tracking values inside async autoplay loop without restarting it
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

  const statsRef = useRef({ tileRequests: 0, tileLoads: 0, tileErrors: 0 });

  // Expose optional debugging utilities to window for monitoring performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__mapDebugStats = () => ({
        requests: statsRef.current,
        cacheSize: layersMapRef.current.size,
        cachedYears: Array.from(layersMapRef.current.keys()),
        lruOrder: [...lruOrderRef.current],
      });
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__mapDebugStats;
      }
    };
  }, []);

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
    let layer = layersMapRef.current.get(year);
    if (!layer) {
      layer = L.tileLayer(getTileUrl(year), {
        maxNativeZoom: 19,
        maxZoom: 21,
        keepBuffer: 8, // Keep tiles in memory when panning/zooming
        className: 'timelapse-tile-layer',
        attribution: '© Esri, Wayback, Maxar',
      });

      // Bind loading event listeners
      layer.on('loading', () => {
        layerLoadingStateRef.current.set(year, true);
        updateLoadingState();
      });
      layer.on('load', () => {
        layerLoadingStateRef.current.set(year, false);
        updateLoadingState();
      });
      layer.on('tileerror', () => {
        layerLoadingStateRef.current.set(year, false);
        updateLoadingState();
      });

      // Performance stats tracking
      layer.on('tileloadstart', () => statsRef.current.tileRequests++);
      layer.on('tileload', () => statsRef.current.tileLoads++);
      layer.on('tileerror', () => statsRef.current.tileErrors++);

      layersMapRef.current.set(year, layer);
    }

    if (map && (map as any)._container) {
      try {
        if (!map.hasLayer(layer)) {
          layer.addTo(map);
        }
      } catch (e) {
        // Safe fallback
      }
    }
    return layer;
  };

  // Sync activeYear and preload nextYear
  useEffect(() => {
    if (!map || !(map as any)._container || years.length === 0) return;
    const activeIndex = years.indexOf(activeYear);
    if (activeIndex === -1) return;
    const nextYear = years[(activeIndex + 1) % years.length];

    try {
      const activeLayer = getOrCreateLayer(activeYear);
      activeLayer.setOpacity(1.0).setZIndex(10);

      if (nextYear !== undefined && nextYear !== activeYear) {
        const nextLayer = getOrCreateLayer(nextYear);
        nextLayer.setOpacity(0.0).setZIndex(5);
      }

      // Hide all other cached layers; abort loading if they are still downloading
      layersMapRef.current.forEach((layer, y) => {
        if (y !== activeYear && y !== nextYear) {
          layer.setOpacity(0.0).setZIndex(1);
          if (layerLoadingStateRef.current.get(y)) {
            if (map && (map as any)._container) {
              try {
                layer.remove();
              } catch (e) {
                // Safe fallback
              }
            }
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
          const oldLayer = layersMapRef.current.get(oldest);
          if (oldLayer) {
            oldLayer.off();
            if (map && (map as any)._container) {
              try {
                oldLayer.remove();
              } catch (e) {
                // Safe fallback
              }
            }
            layersMapRef.current.delete(oldest);
            layerLoadingStateRef.current.delete(oldest);
          }
        }
      }
      updateLoadingState();
    } catch (err) {
      logger.error('Error updating map layers in controller', { error: err as Error });
    }
  }, [map, activeYear, years]);

  // Controlled autoplay loop
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

      // 1. Wait for speed duration
      await new Promise((resolve) => {
        loopRef.current = setTimeout(resolve, speedRef.current) as any;
      });

      if (!active || !playingRef.current) return;

      // 2. Wait until current year's tiles finish loading before moving forward
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

      // 3. Advance to the next year
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

  // Clean up all layers and events on unmount
  useEffect(() => {
    return () => {
      layersMapRef.current.forEach((layer) => {
        layer.off();
        if (map && (map as any)._container) {
          try {
            layer.remove();
          } catch (e) {
            // Safe fallback
          }
        }
      });
      layersMapRef.current.clear();
      lruOrderRef.current = [];
      layerLoadingStateRef.current.clear();
    };
  }, []);

  return null;
}
