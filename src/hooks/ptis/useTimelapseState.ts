/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import type { WaybackRelease } from '@/lib/api/wayback.service';

interface UseTimelapseStateOptions {
  initialLat?: number;
  initialLng?: number;
  initialWaybackReleases?: WaybackRelease[];
}

interface UseTimelapseStateReturn {
  waybackReleases: WaybackRelease[];
  lat: number;
  lng: number;
  activeIdx: number;
  setActiveIdx: React.Dispatch<React.SetStateAction<number>>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showLabels: boolean;
  setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  activeRelease: WaybackRelease | null;
  failedReleases: Set<number>;
  setFailedReleases: React.Dispatch<React.SetStateAction<Set<number>>>;
}

/**
 * Custom hook encapsulating all state management and side-effects for the
 * satellite timelapse component: wayback catalog fetching, coordinate loading,
 * autoplay interval management, and failed release tracking.
 */
export function useTimelapseState({
  initialLat,
  initialLng,
  initialWaybackReleases = [],
}: UseTimelapseStateOptions): UseTimelapseStateReturn {
  const [waybackReleases, setWaybackReleases] = useState<WaybackRelease[]>(() => initialWaybackReleases || []);
  const [lat, setLat] = useState(() => initialLat ?? 0);
  const [lng, setLng] = useState(() => initialLng ?? 0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(!initialWaybackReleases || initialWaybackReleases.length === 0);
  const [showLabels, setShowLabels] = useState(true);
  const [failedReleases, setFailedReleases] = useState<Set<number>>(() => new Set());
  const [speed, setSpeed] = useState(6000);

  useEffect(() => {
    setLat(initialLat ?? 0);
    setLng(initialLng ?? 0);
  }, [initialLat, initialLng]);

  // Re-sync server-passed props after navigation
  useEffect(() => {
    if (initialWaybackReleases && initialWaybackReleases.length > 0) {
      setWaybackReleases(initialWaybackReleases);
      setLoading(false);
    }
  }, [initialWaybackReleases]);

  // Fetch sparse local changes dynamically when coordinates are available
  useEffect(() => {
    if (!lat || !lng) {
      setLoading(false);
      return;
    }

    // We always want to fetch the sparse local changes when in the map modal.
    // The initialWaybackReleases are just for the static preview card fallback.

    let isMounted = true;
    const loadLocalChanges = async () => {
      setLoading(true);
      try {
        const { fetchLocalChanges } = await import('@/lib/api/wayback.service');
        const localReleases = await fetchLocalChanges(lat, lng);
        
        if (isMounted && localReleases.length > 0) {
          setWaybackReleases(localReleases);
          // If the currently active index is out of bounds, reset to 0
          setActiveIdx((current) => current >= localReleases.length ? 0 : current);
        }
      } catch (error) {
        console.error("Failed to load local changes", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLocalChanges();

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  const activeRelease = waybackReleases[activeIdx] ?? null;

  return {
    waybackReleases,
    lat,
    lng,
    activeIdx,
    setActiveIdx,
    playing,
    setPlaying,
    loading,
    setLoading,
    showLabels,
    setShowLabels,
    speed,
    setSpeed,
    activeRelease,
    failedReleases,
    setFailedReleases,
  };
}
