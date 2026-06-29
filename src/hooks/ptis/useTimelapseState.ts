'use client';

import { useState, useEffect } from 'react';
import type { WaybackRelease } from '@/lib/api/wayback.service';
import { getDefaultCoordinates } from '@/lib/utils/coordinate-utils';

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
  const [waybackReleases, setWaybackReleases] = useState<WaybackRelease[]>(() => initialWaybackReleases);
  const [lat, setLat] = useState(() => initialLat ?? getDefaultCoordinates().lat);
  const [lng, setLng] = useState(() => initialLng ?? getDefaultCoordinates().lng);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [failedReleases, setFailedReleases] = useState<Set<number>>(() => new Set());
  const [speed, setSpeed] = useState(6000);

  // Re-sync server-passed props after navigation (Rule SSR-5 / Section 6)
  useEffect(() => {
    if (initialWaybackReleases) {
      setWaybackReleases(initialWaybackReleases);
    }
  }, [initialWaybackReleases]);

  useEffect(() => {
    const defaultCoords = getDefaultCoordinates();
    setLat(initialLat ?? defaultCoords.lat);
    setLng(initialLng ?? defaultCoords.lng);
  }, [initialLat, initialLng]);

  // Auto-advance past failed 2014 release
  useEffect(() => {
    if (waybackReleases.length === 0) return;
    const currentRelease = waybackReleases[activeIdx];
    if (!currentRelease) return;

    if (failedReleases.has(currentRelease.releaseId) && currentRelease.year === 2014) {
      const index2015 = waybackReleases.findIndex((r) => r.year === 2015);
      if (index2015 !== -1) {
        setActiveIdx(index2015);
      } else if (activeIdx < waybackReleases.length - 1) {
        setActiveIdx(activeIdx + 1);
      }
    }
  }, [activeIdx, failedReleases, waybackReleases]);

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
