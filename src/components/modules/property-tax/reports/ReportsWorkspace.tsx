/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Settings, Clock, Info, Download, X } from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel, Button } from '@/components/common';
import { toast } from 'sonner';
import { ReportJobsList } from './ReportJobsList';
import { useReportJobs } from '@/hooks/useReportJobs';

import type { ReportsWorkspaceProps, ReportDefinition } from '@/types/report.types';
import { CATEGORIES, type Step } from './ReportWorkspaceConfig';
import { ReportGenerateView } from './ReportGenerateView';
import { ReportGeneratingOverlay } from './ReportGeneratingOverlay';
import { ReportPreviewOverlay } from './ReportPreviewOverlay';

export function ReportsWorkspace({
  jobsCopy,
  workspaceCopy,
  paramsCopy,
  reportDefinitions,
  reportModules,
  zones,
  financialYears,
  fetchWards,
  fetchProperties,
  initialJobs,
  fetchJobs,
  fetchReportParameters,
  createReportRequest,
}: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs(initialJobs, fetchJobs);


  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [queuedRequestId, setQueuedRequestId] = useState<string | null>(null);
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

  const dynamicCategories = useMemo(() => {
    if (reportModules && reportModules.length > 0) {
      return reportModules.map((m) => ({
        id: m.id,
        key: m.name.toLowerCase(),
        name: m.name,
        logoContentType: m.logoContentType,
        logoBase64: m.logoBase64,
        color: 'text-[#800000]',
        bgColor: 'bg-transparent',
        borderColor: 'border-[#800000]',
        glowClass: 'shadow-[#800000]/20',
        iconBg: 'bg-transparent',
      }));
    }
    return CATEGORIES;
  }, [reportModules]);

  const reportsByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>(dynamicCategories.map((cat) => [cat.key, []]));
    const idToKey = new Map<number, string>(
      dynamicCategories.filter((cat) => cat.id != null).map((cat) => [cat.id!, cat.key])
    );

    for (const report of reportDefinitions) {
      const catKey =
        (report.moduleId != null && idToKey.get(report.moduleId)) ||
        dynamicCategories[0]?.key ||
        'assessment';
      map.get(catKey)?.push(report);
    }
    return map;
  }, [reportDefinitions, dynamicCategories]);


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
      setQueuedRequestId(requestId);
    }
  };

  if (!workspaceCopy || !paramsCopy) return null;



  return (
    <div className="flex flex-col gap-5">
      {/* View Switcher Tabs */}
      <Tabs
        variant="pills"
        size="sm"
        fullWidth
        value={activeView}
        onChange={(v) => setActiveView(v as 'generate' | 'history')}
        activeTabClassName="bg-[#004c8c] text-white shadow-sm"
        className="justify-center mb-2"
      >
        <TabList className="w-full max-w-sm mx-auto border border-gray-200/80 shadow-sm gap-1">
          <Tab value="generate" icon={Settings}>
            {workspaceCopy.tabs.generateReport}
          </Tab>
          <Tab value="history" icon={Clock}>
            {workspaceCopy.tabs.myReports}
          </Tab>
        </TabList>

        {/* Active View */}
        <TabPanel value="generate" className="mt-4">
          <ReportGenerateView
            currentStep={currentStep}
            selectedCategory={selectedCategory}
            selectedReport={selectedReport}
            reportsByCategory={reportsByCategory}
            categories={dynamicCategories}
            workspaceCopy={workspaceCopy}
            paramsCopy={paramsCopy}
            zones={zones ?? []}
            financialYears={financialYears ?? []}
            fetchWards={fetchWards ?? (() => Promise.resolve([]))}
            fetchProperties={fetchProperties ?? (() => Promise.resolve([]))}
            fetchReportParameters={fetchReportParameters}
            onCategoryClick={handleCategoryClick}
            onSelectReport={handleSelectReport}
            onQueued={handleQueued}
            createReportRequest={createReportRequest}
          />
        </TabPanel>
        <TabPanel value="history" className="mt-6">
          <div className="transition-all duration-300">
            <ReportJobsList
              jobs={jobs}
              loading={isLoading}
              copy={jobsCopy}
              reportDefinitions={reportDefinitions}
              onPreview={(requestId) => {
                setActiveRequestId(requestId);
                setPreviewReport(null);
                setPdfLoading(true);
              }}
            />
          </div>
        </TabPanel>
      </Tabs>

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

      {queuedRequestId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setQueuedRequestId(null)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-[420px] h-[420px] max-w-[92vw] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-gray-200 flex flex-col"
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-500" />
            <Button
              variant="ghost"
              onClick={() => setQueuedRequestId(null)}
              className="absolute right-3 top-3 rounded-full !p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Close"
              icon={X}
            />
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl border flex items-center justify-center bg-blue-50 border-blue-200 text-blue-700">
                <Info className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-gray-900 leading-tight">{workspaceCopy.confirm.title}</h3>
              <div className="mt-3 flex-1 overflow-y-auto w-full max-h-[140px] px-2 text-center scrollbar-thin">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap inline-block text-left max-w-[360px]">
                  {workspaceCopy.confirm.description}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 p-5 bg-gray-50/50 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setQueuedRequestId(null);
                  setActiveView('history');
                }}
                icon={Download}
              >
                {workspaceCopy.confirm.btnGo}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setQueuedRequestId(null)}
              >
                {workspaceCopy.confirm.btnClose}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
