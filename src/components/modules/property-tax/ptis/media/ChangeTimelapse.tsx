'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTimelapseState } from '@/hooks/ptis/useTimelapseState';
import { TimelapseControls } from './TimelapseControls';
import { TimelineTrack } from './TimelineTrack';

import type { WaybackRelease } from '@/lib/api/wayback.service';

const DynamicTimelapseMap = dynamic(
  () => import('./TimelapseMap').then((mod) => mod.TimelapseMap),
  { ssr: false }
);

interface ChangeTimelapseProps {
  initialLat?: number;
  initialLng?: number;
  initialWaybackReleases?: WaybackRelease[];
}

export function ChangeTimelapse({
  initialLat,
  initialLng,
  initialWaybackReleases,
}: ChangeTimelapseProps): React.ReactElement {
  const t = useTranslations('ptis');
  const {
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
    setFailedReleases,
  } = useTimelapseState({ initialLat, initialLng, initialWaybackReleases });

  const handlePlayToggle = React.useCallback(() => {
    setPlaying((p) => {
      if (!p && activeIdx >= waybackReleases.length - 1) setActiveIdx(0);
      return !p;
    });
  }, [activeIdx, waybackReleases.length, setActiveIdx, setPlaying]);

  const handlePrev = React.useCallback(() => {
    setActiveIdx((i) => Math.max(0, i - 1));
    setPlaying(false);
  }, [setActiveIdx, setPlaying]);

  const handleNext = React.useCallback(() => {
    setActiveIdx((i) => Math.min(waybackReleases.length - 1, i + 1));
    setPlaying(false);
  }, [waybackReleases.length, setActiveIdx, setPlaying]);

  const handleSelectYear = React.useCallback((i: number) => {
    setActiveIdx(i);
    setPlaying(false);
  }, [setActiveIdx, setPlaying]);

  const handleActiveYearChange = React.useCallback((year: number) => {
    setActiveIdx((prevIdx) => {
      const idx = waybackReleases.findIndex((r) => r.year === year);
      return idx !== -1 ? idx : prevIdx;
    });
  }, [waybackReleases, setActiveIdx]);

  const handleReleaseError = React.useCallback((releaseId: number) => {
    setFailedReleases((prev) => {
      if (prev.has(releaseId)) return prev;
      const next = new Set(prev);
      next.add(releaseId);
      return next;
    });
  }, [setFailedReleases]);

  const handleToggleLabels = React.useCallback(() => {
    setShowLabels((v) => !v);
  }, [setShowLabels]);

  return (
    <div className="tl-wrap flex flex-col h-full bg-slate-900 border border-slate-800 overflow-hidden select-none">
      <TimelapseControls
        playing={playing}
        onPlayToggle={handlePlayToggle}
        activeIdx={activeIdx}
        totalReleases={waybackReleases.length}
        onPrev={handlePrev}
        onNext={handleNext}
        activeRelease={activeRelease}
        speed={speed}
        onSpeedChange={setSpeed}
        showLabels={showLabels}
        onToggleLabels={handleToggleLabels}
        lat={lat}
        lng={lng}
        loading={loading}
      />

      <TimelineTrack
        releases={waybackReleases}
        activeIdx={activeIdx}
        onSelectYear={handleSelectYear}
      />

      {/* Map component */}
      <div className="flex-1 relative min-h-[300px] flex flex-col">
        {waybackReleases.length > 0 ? (
          <DynamicTimelapseMap
            lat={lat}
            lng={lng}
            activeRelease={activeRelease}
            showLabels={showLabels}
            playing={playing}
            speed={speed}
            waybackReleases={waybackReleases}
            onLoadChange={setLoading}
            onActiveYearChange={handleActiveYearChange}
            onReleaseError={handleReleaseError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            {t('media.fetchingCatalog')}
          </div>
        )}
      </div>

      <div className="p-2 px-4 bg-slate-950 text-slate-500 text-[10px] flex justify-between select-none">
        <span>{t('media.interactionGuide')}</span>
        <span>{t('media.attribution')}</span>
      </div>
    </div>
  );
}
