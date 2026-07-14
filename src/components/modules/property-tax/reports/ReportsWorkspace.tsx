/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ReportJobsList } from './ReportJobsList';
import { useReportJobs } from '@/hooks/useReportJobs';
import { useConfirm } from '@/components/common';
import type { ReportsWorkspaceProps, ReportDefinition } from '@/types/report.types';
import { CATEGORIES, resolveCategoryKey, type Step } from './ReportWorkspaceConfig';
import { ReportGenerateView } from './ReportGenerateView';
import { ReportGeneratingOverlay } from './ReportGeneratingOverlay';
import { ReportPreviewOverlay } from './ReportPreviewOverlay';

export function ReportsWorkspace({
  jobsCopy,
  workspaceCopy,
  paramsCopy,
  reportDefinitions,
  zones,
  financialYears,
  fetchWards,
  fetchProperties,
  initialJobs,
  fetchJobs,
  createReportRequest,
}: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs(initialJobs, fetchJobs);
  const { confirm } = useConfirm();

  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportDefinition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    if (activeRequestId) setPdfLoading(true);
  }, [activeRequestId]);

  useEffect(() => {
    if (activeRequestId && !isGenerating) {
      const timer = setTimeout(() => setPdfLoading(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeRequestId, isGenerating]);

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
  }, [activeRequestId, isGenerating, refresh, workspaceCopy]);

  const reportsByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>(CATEGORIES.map((cat) => [cat.key, []]));
    for (const report of reportDefinitions) {
      map.get(resolveCategoryKey(report))?.push(report);
    }
    return map;
  }, [reportDefinitions]);

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

  if (!workspaceCopy || !paramsCopy) return null;

  const hasActiveJobs = jobs.some(
    (j) => j.status === 'Pending' || j.status === 'Processing' || j.status === 'Retrying'
  );

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
            {hasActiveJobs && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Active View */}
      {activeView === 'generate' ? (
        <ReportGenerateView
          currentStep={currentStep}
          selectedCategory={selectedCategory}
          selectedReport={selectedReport}
          reportsByCategory={reportsByCategory}
          workspaceCopy={workspaceCopy}
          paramsCopy={paramsCopy}
          zones={zones ?? []}
          financialYears={financialYears ?? []}
          fetchWards={fetchWards ?? (() => Promise.resolve([]))}
          fetchProperties={fetchProperties ?? (() => Promise.resolve([]))}
          onCategoryClick={handleCategoryClick}
          onSelectReport={handleSelectReport}
          onQueued={handleQueued}
          createReportRequest={createReportRequest}
        />
      ) : (
        <div className="transition-all duration-300">
          <ReportJobsList jobs={jobs} loading={isLoading} copy={jobsCopy} reportDefinitions={reportDefinitions} />
        </div>
      )}

      {/* Overlays */}
      {isGenerating && (
        <ReportGeneratingOverlay
          copy={workspaceCopy}
          onCancel={() => { setIsGenerating(false); setActiveRequestId(null); }}
        />
      )}

      {activeRequestId && !isGenerating && (
        <ReportPreviewOverlay
          requestId={activeRequestId}
          report={previewReport}
          pdfLoading={pdfLoading}
          copy={workspaceCopy}
          onPdfLoad={() => setPdfLoading(false)}
          onClose={() => { setActiveRequestId(null); setPreviewReport(null); setActiveView('history'); }}
        />
      )}
    </div>
  );
}
