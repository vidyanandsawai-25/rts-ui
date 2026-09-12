/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { FileText, Clock, CreditCard, AlertCircle } from 'lucide-react';
import type { PropertyPerformanceData } from '@/types/property-tax/apartment';

interface PropertyMasterRevenueStatsProps {
  performance?: PropertyPerformanceData;
}

export const PropertyMasterRevenueStats: React.FC<PropertyMasterRevenueStatsProps> = ({
  performance,
}) => {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {/* 1. Current Tax */}
      <div className="relative group p-1 rounded-md border border-[#93c5fd] bg-[#eff6ff] hover:bg-blue-100/70 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center gap-1 text-blue-600">
          <FileText className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-bold leading-none">Current Tax</span>
        </div>
        <span className="text-xs font-black text-slate-900 leading-tight mt-0.5 truncate">
          {performance?.currentTax || '-'}
        </span>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-44 p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-400 pb-0.5 border-b border-slate-700/80">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">Current Tax</span>
          </div>
          <div className="text-xs font-bold text-white pt-0.5">
            {performance?.currentTax || '-'}
          </div>
          <div className="absolute top-full left-6 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* 2. Retro Tax */}
      <div className="relative group p-1 rounded-md border border-[#93c5fd] bg-[#eff6ff] hover:bg-blue-100/70 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center gap-1 text-blue-600">
          <FileText className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-bold leading-none">Retro Tax</span>
        </div>
        <span className="text-xs font-black text-slate-900 leading-tight mt-0.5 truncate">
          {performance?.retroTax || '-'}
        </span>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-44 p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-400 pb-0.5 border-b border-slate-700/80">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">Retro Tax (Arrears)</span>
          </div>
          <div className="text-xs font-bold text-white pt-0.5">
            {performance?.retroTax || '-'}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* 3. Total Tax */}
      <div className="relative group p-1 rounded-md border border-[#93c5fd] bg-[#eff6ff] hover:bg-blue-100/70 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center gap-1 text-blue-600">
          <FileText className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-bold leading-none">Total Tax</span>
        </div>
        <span className="text-xs font-black text-slate-900 leading-tight mt-0.5 truncate">
          {performance?.totalTax || '-'}
        </span>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] right-0 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-44 p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-400 pb-0.5 border-b border-slate-700/80">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">Total Tax</span>
          </div>
          <div className="text-xs font-bold text-white pt-0.5">
            {performance?.totalTax || '-'}
          </div>
          <div className="absolute top-full right-6 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* 4. Demand: Total Demand with Current & Pending Branches */}
      <div className="relative group p-1 rounded-md border border-[#fde047] bg-[#fffbeb] hover:bg-amber-100/70 hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        {/* Top: Total Demand Header */}
        <div className="flex items-center justify-between gap-1 text-amber-700 pb-0.5 border-b border-amber-200/80">
          <div className="flex items-center gap-1 min-w-0">
            <Clock className="w-2.5 h-2.5 shrink-0 text-amber-600" />
            <span className="text-[9px] font-bold leading-none truncate">Total Demand</span>
          </div>
          <span
            className="text-[10px] font-black text-slate-900 leading-none shrink-0"
            title={performance?.totalDemand || performance?.totalTax || '-'}
          >
            {performance?.totalDemand || performance?.totalTax || '-'}
          </span>
        </div>

        {/* Bottom: Left & Right Branches (Current | Pending) */}
        <div className="grid grid-cols-2 divide-x divide-amber-300/80 pt-0.5">
          {/* Current (Left branch) */}
          <div className="flex flex-col justify-between pr-1 min-w-0 hover:bg-amber-200/30 rounded-xs px-0.5 transition-colors duration-150">
            <span className="text-[8px] font-bold text-amber-800/90 leading-tight">Current</span>
            <span
              className="text-[10px] font-black text-slate-900 leading-tight truncate"
              title={performance?.currentDemand || performance?.currentTax || '-'}
            >
              {performance?.currentDemand || performance?.currentTax || '-'}
            </span>
          </div>

          {/* Pending (Right branch) */}
          <div className="flex flex-col justify-between pl-1 min-w-0 hover:bg-amber-200/30 rounded-xs px-0.5 transition-colors duration-150">
            <span className="text-[8px] font-bold text-amber-800/90 leading-tight">Pending</span>
            <span
              className="text-[10px] font-black text-slate-900 leading-tight truncate"
              title={performance?.pendingDemand || performance?.retroTax || '-'}
            >
              {performance?.pendingDemand || performance?.retroTax || '-'}
            </span>
          </div>
        </div>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-56 p-2.5 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-700/80">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-bold">Demand Details</span>
            </div>
            <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-1.5 py-0.5 rounded">
              Total: {performance?.totalDemand || '-'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div className="bg-slate-800/90 rounded p-1.5 border border-slate-700/50 flex flex-col">
              <span className="text-[9px] text-slate-400 font-medium leading-none">Current Demand</span>
              <span className="text-xs font-bold text-white mt-1 truncate">
                {performance?.currentDemand || performance?.currentTax || '-'}
              </span>
            </div>
            <div className="bg-slate-800/90 rounded p-1.5 border border-slate-700/50 flex flex-col">
              <span className="text-[9px] text-slate-400 font-medium leading-none">Pending Demand</span>
              <span className="text-xs font-bold text-amber-300 mt-1 truncate">
                {performance?.pendingDemand || performance?.retroTax || '-'}
              </span>
            </div>
          </div>

          {/* Down Arrow Indicator */}
          <div className="absolute top-full left-6 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* 5. Collection */}
      <div className="relative group p-1 rounded-md border border-[#86efac] bg-[#f0fdf4] hover:bg-emerald-100/70 hover:border-emerald-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center justify-between gap-0.5 text-emerald-700">
          <div className="flex items-center gap-1 min-w-0 overflow-hidden">
            <CreditCard className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-bold leading-none truncate">Collection</span>
          </div>
          <span className="text-[8px] font-bold px-1 py-0.5 rounded-full border border-emerald-500 bg-emerald-50 text-emerald-700 leading-none shrink-0">
            {performance?.collectionPercent || '0%'}
          </span>
        </div>
        <span className="text-xs font-black text-slate-900 leading-tight mt-0.5 truncate">
          {performance?.collectionAmount || '-'}
        </span>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-48 p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1">
          <div className="flex items-center justify-between pb-0.5 border-b border-slate-700/80">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-bold">Collection</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-1 py-0.2 rounded">
              {performance?.collectionPercent || '0%'}
            </span>
          </div>
          <div className="text-xs font-bold text-white pt-0.5">
            {performance?.collectionAmount || '-'}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>

      {/* 6. Total Balance */}
      <div className="relative group p-1 rounded-md border border-[#fda4af] bg-[#fff1f2] hover:bg-rose-100/70 hover:border-rose-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between">
        <div className="flex items-center gap-1 text-rose-600">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-bold leading-none truncate">Total Balance</span>
        </div>
        <span className="text-xs font-black text-rose-600 leading-tight mt-0.5 truncate">
          {performance?.totalBalance || '-'}
        </span>

        {/* Expanded Tooltip on Hover */}
        <div className="absolute bottom-[calc(100%+8px)] right-0 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none w-44 p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-left flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-rose-400 pb-0.5 border-b border-slate-700/80">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">Total Balance</span>
          </div>
          <div className="text-xs font-bold text-rose-300 pt-0.5">
            {performance?.totalBalance || '-'}
          </div>
          <div className="absolute top-full right-6 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      </div>
    </div>
  );
};
