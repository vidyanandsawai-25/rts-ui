'use client';

import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Map, Eye, EyeOff, Calendar } from 'lucide-react';
import type { WaybackRelease } from '@/lib/api/wayback.service';

interface TimelapseControlsProps {
  playing: boolean;
  onPlayToggle: () => void;
  activeIdx: number;
  totalReleases: number;
  onPrev: () => void;
  onNext: () => void;
  activeRelease: WaybackRelease | null;
  speed: number;
  onSpeedChange: (speed: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  lat: number;
  lng: number;
  loading: boolean;
}

export function TimelapseControls({
  playing,
  onPlayToggle,
  activeIdx,
  totalReleases,
  onPrev,
  onNext,
  activeRelease,
  speed,
  onSpeedChange,
  showLabels,
  onToggleLabels,
  lat,
  lng,
  loading,
}: TimelapseControlsProps): React.ReactElement {
  return (
    <div className="tl-ctrl flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/95 border-b border-slate-900 text-white text-xs select-none backdrop-blur-md">
      {/* Left Section: Playing & Navigation Controls */}
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">🛰</span>
        <span className="text-[11.5px] font-bold font-sans tracking-wide text-slate-200">Historical Satellite</span>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Navigation Arrows */}
        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800/80 rounded p-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={activeIdx === 0}
            className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer text-slate-400 border-none bg-transparent flex items-center justify-center"
            aria-label="Previous satellite release"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3 bg-slate-800" />

          <button
            type="button"
            onClick={onNext}
            disabled={activeIdx === totalReleases - 1}
            className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer text-slate-400 border-none bg-transparent flex items-center justify-center"
            aria-label="Next satellite release"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          className={`flex items-center gap-1.5 font-bold rounded text-[10.5px] px-3.5 py-1.5 cursor-pointer border-none transition-all duration-200 active:scale-95 shadow ${
            playing
              ? 'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-rose-950/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-950/20'
          }`}
          onClick={onPlayToggle}
          aria-label={playing ? 'Pause satellite timelapse' : 'Play satellite timelapse'}
        >
          {playing ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Center Section: Date Display */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded shadow-inner">
        <Calendar className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11.5px] font-bold font-mono tracking-wide text-white min-w-[90px] text-center">
          {activeRelease
            ? new Date(activeRelease.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      </div>

      {/* Right Section: Configuration & External Redirects */}
      <div className="flex items-center gap-2">
        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white select-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Speed:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-transparent text-white border-none focus:outline-none text-[10px] cursor-pointer font-bold font-sans pr-1"
            aria-label="Playback speed"
          >
            <option value={6000} className="bg-slate-900 text-white">0.5x (Slow)</option>
            <option value={4500} className="bg-slate-900 text-white">1x (Normal)</option>
            <option value={3000} className="bg-slate-900 text-white">1.5x (Medium)</option>
            <option value={2000} className="bg-slate-900 text-white">2x (Fast)</option>
          </select>
        </div>

        {/* Labels Toggle */}
        <button
          type="button"
          className={`flex items-center gap-1 text-[10px] font-bold rounded border px-3 py-1 cursor-pointer transition-all duration-200 ${
            showLabels
              ? 'bg-slate-800 border-slate-700 text-blue-400'
              : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700'
          }`}
          onClick={onToggleLabels}
          aria-label={showLabels ? 'Hide map labels' : 'Show map labels'}
        >
          {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Labels</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Redirect to Google Maps */}
        <button
          type="button"
          onClick={() => {
            if (lat && lng) {
              window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded text-[10px] px-3.5 py-1.5 cursor-pointer transition-all duration-200 border-none flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
          aria-label="Open property location on Google Maps"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Click to view on Google Map</span>
        </button>

        {loading && (
          <span className="flex items-center justify-center ml-1" aria-label="Loading satellite tiles">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        )}
      </div>
    </div>
  );
}
