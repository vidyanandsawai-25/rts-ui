'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { ReportExportFormat } from '@/lib/utils/rts/report-engine/rtsDomainReports';

export interface RtsExportDropdownProps {
  onExport: (format: ReportExportFormat, scope: 'page' | 'all') => Promise<void> | void;
  currentPageCount?: number;
  totalFilteredCount?: number;
  isLoading?: boolean;
  buttonLabel?: string;
  className?: string;
}

export default function RtsExportDropdown({
  onExport,
  currentPageCount,
  totalFilteredCount,
  isLoading = false,
  buttonLabel = 'Export Report',
  className = '',
}: RtsExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (format: ReportExportFormat, scope: 'page' | 'all') => {
    setIsOpen(false);
    setExportingFormat(`${format}-${scope}`);
    try {
      await onExport(format, scope);
    } finally {
      setExportingFormat(null);
    }
  };

  const isWorking = isLoading || Boolean(exportingFormat);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={isWorking}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isWorking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
        ) : (
          <Download className="h-3.5 w-3.5 text-blue-600" />
        )}
        <span>{buttonLabel}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Export Format
            </p>
            {totalFilteredCount !== undefined && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Total matching records: <strong className="text-slate-800">{totalFilteredCount.toLocaleString()}</strong>
              </p>
            )}
          </div>

          <div className="py-1">
            {/* 1. Excel */}
            <div className="group rounded-lg p-1.5 transition hover:bg-emerald-50/70">
              <div className="flex items-center gap-2 px-1.5 py-1 text-xs font-bold text-slate-700">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Excel Spreadsheet (.xlsx)</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 pl-6">
                <button
                  type="button"
                  onClick={() => handleSelect('excel', 'page')}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-emerald-600 hover:text-white transition"
                >
                  Current Page {currentPageCount ? `(${currentPageCount})` : ''}
                </button>
                {totalFilteredCount && totalFilteredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSelect('excel', 'all')}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                  >
                    All Filtered ({totalFilteredCount})
                  </button>
                )}
              </div>
            </div>

            {/* 2. CSV */}
            <div className="group rounded-lg p-1.5 transition hover:bg-blue-50/70 mt-0.5">
              <div className="flex items-center gap-2 px-1.5 py-1 text-xs font-bold text-slate-700">
                <FileCode className="h-4 w-4 text-blue-600" />
                <span>CSV File (.csv)</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 pl-6">
                <button
                  type="button"
                  onClick={() => handleSelect('csv', 'page')}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-blue-600 hover:text-white transition"
                >
                  Current Page {currentPageCount ? `(${currentPageCount})` : ''}
                </button>
                {totalFilteredCount && totalFilteredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSelect('csv', 'all')}
                    className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                  >
                    All Filtered ({totalFilteredCount})
                  </button>
                )}
              </div>
            </div>

            {/* 3. PDF */}
            <div className="group rounded-lg p-1.5 transition hover:bg-rose-50/70 mt-0.5">
              <div className="flex items-center gap-2 px-1.5 py-1 text-xs font-bold text-slate-700">
                <FileText className="h-4 w-4 text-rose-600" />
                <span>Printable Report / PDF (.pdf)</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 pl-6">
                <button
                  type="button"
                  onClick={() => handleSelect('pdf', 'page')}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-rose-600 hover:text-white transition"
                >
                  Current Page {currentPageCount ? `(${currentPageCount})` : ''}
                </button>
                {totalFilteredCount && totalFilteredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSelect('pdf', 'all')}
                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                  >
                    All Filtered ({totalFilteredCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
