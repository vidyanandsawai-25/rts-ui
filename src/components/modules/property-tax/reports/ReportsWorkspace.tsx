/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Loader2, X, Download, Settings, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ReportParametersPanel } from '@/components/modules/property-tax/reports/ReportParametersPanel';
import { ReportJobsList } from '@/components/modules/property-tax/reports/ReportJobsList';
import { Card, Button, useConfirm } from '@/components/common';
import { useReportJobs } from '@/hooks/useReportJobs';
import type { ReportsWorkspaceProps, ReportDefinition } from '@/types/report.types';
import {
  CATEGORIES,
  resolveCategoryKey,
  type Step,
} from './ReportWorkspaceConfig';
import {
  Stepper,
  CategoryCard,
  EmptyState,
  ReportListPanel,
  ReportTabsPanel,
} from './ReportWorkspaceComponents';

export function ReportsWorkspace({ jobsCopy, workspaceCopy, paramsCopy, reportDefinitions, zones, financialYears, fetchWards, fetchProperties }: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs();
  const { confirm } = useConfirm();

  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportDefinition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  // Reset pdfLoading when a new request starts
  useEffect(() => {
    if (activeRequestId) setPdfLoading(true);
  }, [activeRequestId]);

  // Fail-safe: hide loader after 3.5s if onLoad doesn't fire
  useEffect(() => {
    if (activeRequestId && !isGenerating) {
      const timer = setTimeout(() => setPdfLoading(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeRequestId, isGenerating]);

  // Poll / listen for report status while generating
  useEffect(() => {
    if (!activeRequestId || !isGenerating) return;

    let timer: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const handleStatusChange = (e: Event) => {
      const { requestId, status } = (e as CustomEvent<{ requestId: string; status: string }>).detail;
      if (requestId !== activeRequestId || isCancelled) return;
      if (status === 'Completed') {
        setIsGenerating(false);
        toast.success(workspaceCopy?.toast.generatedSuccess ?? '');
        refresh();
      } else if (status === 'Failed' || status === 'Cancelled') {
        setIsGenerating(false);
        setActiveRequestId(null);
        toast.error(workspaceCopy?.toast.generationFailed ?? '');
      }
    };

    window.addEventListener('report-status-change', handleStatusChange);

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/report-status/${encodeURIComponent(activeRequestId)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        if (isCancelled) return;
        if (data.status === 'Completed') {
          setIsGenerating(false);
          toast.success(workspaceCopy?.toast.generatedSuccess ?? '');
          refresh();
        } else if (data.status === 'Failed' || data.status === 'Cancelled') {
          setIsGenerating(false);
          setActiveRequestId(null);
          toast.error(workspaceCopy?.toast.generationFailed ?? '');
        } else {
          timer = setTimeout(checkStatus, 5000);
        }
      } catch {
        if (!isCancelled) timer = setTimeout(checkStatus, 5000);
      }
    };

    timer = setTimeout(checkStatus, 5000);
    return () => {
      isCancelled = true;
      window.removeEventListener('report-status-change', handleStatusChange);
      if (timer) clearTimeout(timer);
    };
  }, [activeRequestId, isGenerating, refresh]);

  const reportsByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>(CATEGORIES.map((cat) => [cat.key, []]));
    for (const report of reportDefinitions) {
      map.get(resolveCategoryKey(report))?.push(report);
    }
    return map;
  }, [reportDefinitions]);

  const categoryCount = (key: string) => reportsByCategory.get(key)?.length ?? 0;

  const handleCategoryClick = (catKey: string) => {
    if (selectedCategory === catKey) {
      setSelectedCategory(null);
      setCurrentStep(1);
      setSelectedReport(null);
    } else {
      setSelectedCategory(catKey);
      setCurrentStep(2);
      setSelectedReport(null);
    }
  };

  const handleSelectReport = (report: ReportDefinition) => {
    setSelectedReport(report);
    setCurrentStep(3);
  };

  const handleQueued = (requestId: string) => {
    refresh();
    if (requestId && workspaceCopy) {
      confirm({
        variant: 'info',
        title: workspaceCopy.confirm.title,
        description: workspaceCopy.confirm.description,
        confirmText: workspaceCopy.confirm.btnGo,
        cancelText: workspaceCopy.confirm.btnClose,
        onConfirm: () => setActiveView('history'),
      });
    }
  };

  const activeCategoryDef = CATEGORIES.find((c) => c.key === selectedCategory);
  const activeReports = selectedCategory ? (reportsByCategory.get(selectedCategory) ?? []) : [];

  if (!workspaceCopy || !paramsCopy) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* View Switcher Tabs */}
      <div className="flex justify-center mb-2">
        <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/80 shadow-sm w-full max-w-sm gap-1">
          <button
            type="button"
            onClick={() => setActiveView('generate')}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all duration-200 w-1/2 focus:outline-none
              ${activeView === 'generate' ? 'bg-[#004c8c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            {workspaceCopy.tabs.generateReport}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all duration-200 w-1/2 focus:outline-none relative
              ${activeView === 'history' ? 'bg-[#004c8c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            {workspaceCopy.tabs.myReports}
            {jobs.some(j => j.status === 'Pending' || j.status === 'Processing') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {activeView === 'generate' ? (
        <>
          <Stepper currentStep={currentStep} copy={workspaceCopy} />

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.key}
                category={cat}
                label={workspaceCopy.categories[cat.key as keyof typeof workspaceCopy.categories]}
                count={categoryCount(cat.key)}
                isSelected={selectedCategory === cat.key}
                onClick={() => handleCategoryClick(cat.key)}
              />
            ))}
          </div>

          {currentStep === 1 && <EmptyState title={workspaceCopy.emptyState.title} subtitle={workspaceCopy.emptyState.subtitle} />}

          {currentStep === 2 && activeCategoryDef && (
            <ReportListPanel
              activeCategoryDef={activeCategoryDef}
              activeReports={activeReports}
              workspaceCopy={workspaceCopy}
              onSelectReport={handleSelectReport}
            />
          )}

          {currentStep === 3 && activeCategoryDef && selectedReport && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <ReportTabsPanel
                activeCategoryDef={activeCategoryDef}
                activeReports={activeReports}
                selectedReport={selectedReport}
                workspaceCopy={workspaceCopy}
                onSelectReport={handleSelectReport}
              />
              <Card padding="none" className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {workspaceCopy.configureParameters}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ReportParametersPanel report={selectedReport} onQueued={handleQueued} copy={paramsCopy} zones={zones} financialYears={financialYears} fetchWards={fetchWards} fetchProperties={fetchProperties} />
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        <div className="transition-all duration-300">
          <ReportJobsList jobs={jobs} loading={isLoading} copy={jobsCopy} reportDefinitions={reportDefinitions} />
        </div>
      )}

      {/* Generating overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/75 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center justify-center text-center gap-5 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100">
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-center w-24 h-24 mb-2">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 animate-pulse" />
              <div className="absolute inset-2 rounded-full border-4 border-t-[#004c8c] border-r-[#004c8c] border-b-transparent border-l-transparent animate-spin duration-1000" />
              <div className="absolute inset-4 rounded-full bg-blue-50 flex items-center justify-center shadow-inner">
                <FileText className="w-7 h-7 text-[#004c8c] animate-bounce" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-wide">{workspaceCopy.generating.title}</h3>
              <div className="text-xs text-slate-500 mt-2 space-y-1.5 font-medium">
                <p className="text-[#004c8c] font-semibold flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {workspaceCopy.toast.generatingPreview}
                </p>
                <p className="text-slate-400">{workspaceCopy.generating.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setIsGenerating(false); setActiveRequestId(null); }}
              className="w-full mt-3 py-3 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-150 shadow-sm"
            >
              {workspaceCopy.generating.cancel}
            </button>
          </div>
        </div>
      )}

      {/* PDF Preview overlay */}
      {activeRequestId && !isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/80 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-slate-50 w-full max-w-5xl h-[88vh] rounded-3xl flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.45)] border border-white/10 overflow-hidden relative transition-all duration-300">
            <div className="bg-white px-6 py-4 border-b border-slate-200/85 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-100">
                  <FileText className="w-5.5 h-5.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-wide truncate">
                    {previewReport?.reportName || workspaceCopy.preview.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                    ID: {activeRequestId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => { window.location.href = `/api/report-download/${encodeURIComponent(activeRequestId)}`; }}
                  className="rounded-xl px-4 py-2 font-bold bg-[#004c8c] hover:bg-[#003866] hover:shadow-md active:scale-95 transition-all duration-150 flex items-center gap-2"
                >
                  {workspaceCopy.preview.downloadPdf}
                </Button>
                <button
                  type="button"
                  onClick={() => { setActiveRequestId(null); setPreviewReport(null); setActiveView('history'); }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:rotate-90 active:scale-90 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200/40 p-5 relative flex items-center justify-center">
              {pdfLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-xs z-10 transition-opacity duration-300">
                  <Loader2 className="w-9 h-9 text-[#004c8c] animate-spin" />
                  <p className="text-xs font-bold text-slate-500 mt-3 tracking-wide">{workspaceCopy.toast.preparingDocument}</p>
                </div>
              )}
              <object
                data={`/api/report-download/${encodeURIComponent(activeRequestId)}?inline=true&view=pdf#toolbar=0`}
                type="application/pdf"
                className="w-full h-full rounded-2xl border border-slate-200/80 shadow-md bg-white"
                onLoad={() => setPdfLoading(false)}
              >
                <iframe
                  src={`/api/report-download/${encodeURIComponent(activeRequestId)}?inline=true&view=pdf#toolbar=0`}
                  className="w-full h-full rounded-2xl border border-slate-200/80 shadow-md bg-white"
                  title="Report Preview"
                  onLoad={() => setPdfLoading(false)}
                />
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
