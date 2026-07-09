/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';

interface PlotAreaCalculatorProps {
  t: (key: string) => string;
  onApply?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  onLoad?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  layout?: 'single-row' | 'double-row';
  propertyId?: string | number;
  initialPlotArea?: {
    length?: number | string | null;
    width?: number | string | null;
    totalPlotArea?: number | string | null;
  } | null;
  onChange?: (sqFt: string, sqM: string, len?: string, wid?: string) => void;
  isLoading?: boolean;
  buttonText?: string;
}

export const PlotAreaCalculator: React.FC<PlotAreaCalculatorProps> = ({
  t,
  onApply,
  onLoad,
  onChange,
  layout = 'single-row',
  initialPlotArea,
  isLoading = false,
  buttonText,
}) => {
  const [length, setLength] = React.useState<string>(() => {
    if (initialPlotArea?.length !== null && initialPlotArea?.length !== undefined) {
      return String(initialPlotArea.length);
    }
    return '';
  });
  const [width, setWidth] = React.useState<string>(() => {
    if (initialPlotArea?.width !== null && initialPlotArea?.width !== undefined) {
      return String(initialPlotArea.width);
    }
    return '';
  });

  // Store onLoad in a ref to avoid dependency changes triggering useEffect multiple times
  const onLoadRef = React.useRef(onLoad);
  React.useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  // Store onChange in a ref to avoid dependency changes triggering useEffect multiple times
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Store t in a ref to avoid translation function reference changes triggering useEffect multiple times
  const tRef = React.useRef(t);
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

  React.useEffect(() => {
    if (initialPlotArea) {
      const lenVal = initialPlotArea.length;
      const widVal = initialPlotArea.width;
      const totalVal = initialPlotArea.totalPlotArea;

      // Default null or undefined values to 0 as per instructions
      const len = lenVal !== null && lenVal !== undefined ? String(lenVal) : '0';
      const wid = widVal !== null && widVal !== undefined ? String(widVal) : '0';
      const totalArea = totalVal !== null && totalVal !== undefined ? Number(totalVal) : 0;

      setLength(len);
      setWidth(wid);

      // Calculate sq ft from the total area (which is in sq meters)
      const sqFt = convertSqMToSqFt(totalArea);

      if (onLoadRef.current) {
        onLoadRef.current(
          sqFt > 0 ? sqFt.toFixed(2) : '0.00',
          totalArea > 0 ? totalArea.toFixed(2) : '0.00',
          len,
          wid
        );
      }
    }
  }, [initialPlotArea]);

  const { totalSqFt, totalSqM, numericSqM } = React.useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const sqM = l * w;
    const sqFt = convertSqMToSqFt(sqM);

    return {
      totalSqFt: sqFt > 0 ? sqFt.toFixed(2) : '0.00',
      totalSqM: sqM > 0 ? sqM.toFixed(2) : '0.00',
      numericSqM: sqM,
    };
  }, [length, width]);

  React.useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current(totalSqFt, totalSqM, length, width);
    }
  }, [totalSqFt, totalSqM, length, width]);

  const handleApply = React.useCallback(() => {
    if (onApply && numericSqM > 0) {
      onApply(totalSqFt, totalSqM, length, width);
    }
  }, [onApply, numericSqM, totalSqFt, totalSqM, length, width]);

  const handleInputChange = React.useCallback((val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Keep only numbers and a single decimal point
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');

    let beforeDecimal = parts[0] || '';
    if (beforeDecimal.length > 4) {
      beforeDecimal = beforeDecimal.slice(0, 4);
    }

    if (parts.length > 1) {
      const afterDecimal = parts.slice(1).join('').slice(0, 2);
      setter(`${beforeDecimal}.${afterDecimal}`);
    } else {
      setter(beforeDecimal);
    }
  }, []);

  if (layout === 'single-row') {
    return (
      <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 flex flex-row items-center justify-between gap-4 shadow-sm w-full relative">
        {/* Left side: Icon & Title info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200/50">
            {isLoading ? (
              <Loader2 className="h-5 w-5 stroke-[2] animate-spin" />
            ) : (
              <Calculator className="h-5 w-5 stroke-[2]" />
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 tracking-wide uppercase leading-tight">
              {t('floor.plotAreaCalculator') || 'Plot Area Calculator'}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {t('floor.plotAreaCalcDesc') || 'Quickly calculate plot area using length and width'}
            </p>
          </div>
        </div>

        {/* Right side: Input calculator form in one row */}
        <div className="flex flex-row items-center gap-3 shrink-0">
          {/* Length Input (Meters) */}
          <div className="flex items-center gap-2">
            <label htmlFor="plot-length" className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {t('floor.lengthShort') || 'L:'}
            </label>
            <input
              id="plot-length"
              type="text"
              placeholder="0.00"
              value={length}
              disabled={isLoading}
              onChange={(e) => handleInputChange(e.target.value, setLength)}
              className="w-16 h-8 px-2 text-slate-700 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Multiplier sign */}
          <span className="text-slate-400 font-semibold text-xs">×</span>

          {/* Width Input (Meters) */}
          <div className="flex items-center gap-2">
            <label htmlFor="plot-width" className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {t('floor.widthShort') || 'W:'}
            </label>
            <input
              id="plot-width"
              type="text"
              placeholder="0.00"
              value={width}
              disabled={isLoading}
              onChange={(e) => handleInputChange(e.target.value, setWidth)}
              className="w-16 h-8 px-2 text-slate-700 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Calculated Output Box */}
          <div className="flex items-center bg-[#f0f7ff] border border-blue-100 rounded-lg px-3 h-8 text-xs font-semibold shrink-0">
            <span className="text-slate-500 mr-1.5">{t('floor.areaColon') || 'Area:'}</span>
            <span className="text-emerald-600 font-bold">{totalSqM} {t('floor.sqM') || 'Sq.M'}</span>
            <span className="text-slate-300 font-light mx-2">/</span>
            <span className="text-blue-600 font-bold">{totalSqFt} {t('floor.sqFt') || 'Sq.Ft'}</span>
          </div>

          {/* Apply Area Button */}
          <button
            type="button"
            onClick={handleApply}
            disabled={!length || !width || parseFloat(length) <= 0 || parseFloat(width) <= 0 || isLoading}
            className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shrink-0 active:scale-[0.98]"
          >
            {buttonText || t('floor.applyArea') || 'Add Area'}
          </button>
        </div>
      </div>
    );
  }

  // Otherwise return the double-row layout (for drawer/compact layout)
  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm w-full relative">
      {/* Row 1: Header Info & Inputs */}
      <div className="flex flex-row items-center justify-between gap-3 w-full">
        {/* Left side: Icon & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-100">
            {isLoading ? (
              <Loader2 className="h-5 w-5 stroke-[2] animate-spin" />
            ) : (
              <Calculator className="h-5 w-5 stroke-[2]" />
            )}
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-slate-800 uppercase tracking-wide leading-tight">
              {t('floor.plotAreaCalculator') || 'Plot Calc'}
            </h4>
            <p className="text-[9px] text-slate-400 font-medium">
              {t('floor.lengthWidth') || 'Length × Width'}
            </p>
          </div>
        </div>

        {/* Right side: Inputs */}
        <div className="flex items-center gap-2">
          {/* Length */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="plot-length" className="text-[11px] font-bold text-slate-500">
              {t('floor.lengthShort') || 'L:'}
            </label>
            <input
              id="plot-length"
              type="text"
              placeholder="0.00"
              value={length}
              disabled={isLoading}
              onChange={(e) => handleInputChange(e.target.value, setLength)}
              className="w-16 h-8 px-2 text-slate-700 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <span className="text-slate-400 font-semibold text-xs">×</span>

          {/* Width */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="plot-width" className="text-[11px] font-bold text-slate-500">
              {t('floor.widthShort') || 'W:'}
            </label>
            <input
              id="plot-width"
              type="text"
              placeholder="0.00"
              value={width}
              disabled={isLoading}
              onChange={(e) => handleInputChange(e.target.value, setWidth)}
              className="w-16 h-8 px-2 text-slate-700 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Calculated Area & Action Button */}
      <div className="flex flex-row items-center justify-between border-t border-slate-100 pt-3 w-full">
        {/* Left: Calculated Output Box */}
        <div className="flex items-center bg-[#f0f7ff] border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-semibold">
          <span className="text-slate-500 mr-1.5">{t('floor.areaColon') || 'Area:'}</span>
          <span className="text-emerald-600 font-bold">{totalSqM} {t('floor.sqM') || 'Sq.M'}</span>
          <span className="text-slate-300 font-light mx-2">/</span>
          <span className="text-blue-600 font-bold">{totalSqFt} {t('floor.sqFt') || 'Sq.Ft'}</span>
        </div>

        {/* Right: Add Area Button */}
        <button
          type="button"
          onClick={handleApply}
          disabled={!length || !width || parseFloat(length) <= 0 || parseFloat(width) <= 0 || isLoading}
          className="h-8.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shrink-0 active:scale-[0.97]"
        >
          {buttonText || t('floor.applyArea') || 'Add Area'}
        </button>
      </div>
    </div>
  );
};
