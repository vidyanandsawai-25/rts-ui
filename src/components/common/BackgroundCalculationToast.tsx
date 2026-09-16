'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, X, Calculator, Clock, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useTaxCalculationNotifications } from '@/hooks/useTaxCalculationNotifications';
import { cn } from '@/lib/utils/cn';

export function BackgroundCalculationToast(): React.ReactElement | null {
  const pathname = usePathname();
  const t = useTranslations('common');
  const { jobsList, dismissJob } = useTaxCalculationNotifications();

  if (pathname?.includes('/login') || jobsList.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={t('taxCalculation.backgroundTitle')}
      className="fixed bottom-20 right-4 sm:right-6 md:bottom-22 z-[99999] flex flex-col gap-3 max-w-[420px] w-[calc(100vw-2rem)] sm:w-full pointer-events-none select-none transition-all duration-300"
    >
      {jobsList.map((job) => {
        const isFinished = job.isCompleted;
        const hasFailed = job.isCompleted && !job.isSuccess;
        const total = job.totalUnits || 0;
        const processed = job.processedUnits || 0;
        const percent = Math.min(100, Math.max(0, job.percentComplete || 0));

        return (
          <div
            key={job.jobId}
            className={cn(
              'pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl border transition-all duration-300 backdrop-blur-xl',
              hasFailed
                ? 'bg-slate-900/95 border-rose-500/50 shadow-[0_20px_50px_rgba(244,63,94,0.25),0_0_0_1px_rgba(244,63,94,0.15)] text-white'
                : isFinished
                ? 'bg-slate-900/95 border-emerald-500/50 shadow-[0_20px_50px_rgba(16,185,129,0.25),0_0_0_1px_rgba(16,185,129,0.15)] text-white'
                : 'bg-slate-900/95 border-blue-500/40 shadow-[0_20px_50px_rgba(14,165,233,0.2),0_0_0_1px_rgba(255,255,255,0.08)] text-white'
            )}
          >
            {/* Ambient top glowing line */}
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-[2px]',
                hasFailed
                  ? 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600'
                  : isFinished
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse'
              )}
            />

            {/* Header row with badges & dismiss */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Status Badge */}
                {hasFailed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    {t('taxCalculation.failed')}
                  </span>
                ) : isFinished ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t('taxCalculation.completed')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    {t('taxCalculation.inProgress')}
                  </span>
                )}

                {/* Units counter badge */}
                {total > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60">
                    {isFinished
                      ? `${job.succeededCount ?? total} ${t('taxCalculation.units')}`
                      : `${processed}/${total} ${t('taxCalculation.units')}`}
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissJob(job.jobId)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-hidden focus:ring-1 focus:ring-white/20"
                aria-label={t('taxCalculation.dismiss')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Body */}
            <div className="mt-2.5 flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {hasFailed ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : isFinished ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 relative">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <Calculator className="w-2.5 h-2.5 absolute text-blue-300" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-tight">
                  {hasFailed
                    ? t('taxCalculation.failedTitle')
                    : isFinished
                    ? t('taxCalculation.completedTitle')
                    : t('taxCalculation.backgroundTitle')}
                </h4>
                <p className="text-xs text-slate-300 font-normal leading-relaxed mt-1 line-clamp-2">
                  {job.message ||
                    (isFinished
                      ? t('taxCalculation.recalculatedUnits', { count: job.succeededCount || total })
                      : t('taxCalculation.processingUnits', { processed, total }))}
                </p>
              </div>
            </div>

            {/* Progress Section when In-Progress */}
            {!isFinished && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span className="text-slate-400">{t('taxCalculation.progress')}</span>
                  <span className="font-mono font-bold text-blue-400">{`${percent}%`}</span>
                </div>
                <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden ring-1 ring-white/10 p-[1px]">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Finished metadata duration if available */}
            {isFinished && job.durationMs ? (
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {`${(job.durationMs / 1000).toFixed(1)}s`}
                </span>
                <span className="text-emerald-400 font-medium">{t('taxCalculation.ready')}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

