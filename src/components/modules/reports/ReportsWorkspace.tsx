'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Home,
  BarChart2,
  CreditCard,
  CheckCircle,
  Tag,
  MoreHorizontal,
  FileText,
  Check,
  Loader2,
  X,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReportParametersPanel } from '@/components/modules/reports/ReportParametersPanel';
import { ReportJobsList } from '@/components/modules/reports/ReportJobsList';
import { Card, Tabs, TabList, Tab, Button } from '@/components/common';
import { useReportJobs } from '@/hooks/useReportJobs';
import type { ReportsWorkspaceProps, ReportDefinition, ReportWorkspaceCopy } from '@/types/report.types';

// Sirf non-assessment reports yahan specifically map karo.
// Assessment DEFAULT hai — jo bhi yahan nahi hai woh automatically Assessment mein jayega.
// Example: AMC reports add karne ho to: amc: ['AmcSlip', 'AmcDemand']
const REPORT_CODES_BY_CATEGORY: Record<string, string[]> = {
  amc: [],
  transaction: [],
  approval: [],
  discount: [],
};

type Step = 1 | 2 | 3;

interface Category {
  key: string;
  icon: React.ElementType;
  color: string;      // text class e.g. text-blue-600
  bgColor: string;    // background class e.g. bg-blue-50
  borderColor: string;// border class e.g. border-blue-500
  glowClass: string;  // shadow class e.g. shadow-blue-100
  iconBg: string;     // icon wrapper bg e.g. bg-blue-100
}

const CATEGORIES: Category[] = [
  { key: 'assessment', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50/70', borderColor: 'border-blue-500', glowClass: 'shadow-blue-100/70', iconBg: 'bg-blue-100' },
  { key: 'amc', icon: BarChart2, color: 'text-amber-600', bgColor: 'bg-amber-50/70', borderColor: 'border-amber-500', glowClass: 'shadow-amber-100/70', iconBg: 'bg-amber-100' },
  { key: 'transaction', icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-50/70', borderColor: 'border-emerald-500', glowClass: 'shadow-emerald-100/70', iconBg: 'bg-emerald-100' },
  { key: 'approval', icon: CheckCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50/70', borderColor: 'border-indigo-500', glowClass: 'shadow-indigo-100/70', iconBg: 'bg-indigo-100' },
  { key: 'discount', icon: Tag, color: 'text-rose-600', bgColor: 'bg-rose-50/70', borderColor: 'border-rose-500', glowClass: 'shadow-rose-100/70', iconBg: 'bg-rose-100' },
  { key: 'others', icon: MoreHorizontal, color: 'text-slate-600', bgColor: 'bg-slate-50/70', borderColor: 'border-slate-500', glowClass: 'shadow-slate-100/70', iconBg: 'bg-slate-100' },
];

function Stepper({ currentStep, copy }: { currentStep: Step; copy: ReportWorkspaceCopy }) {
  const steps = [
    { label: copy.steps.selectCategory },
    { label: copy.steps.selectReport },
    { label: copy.steps.setParameters },
  ];
  return (
    <Card padding="none" className="rounded-xl px-6 py-4 shadow-sm border border-gray-100">
      <div className="flex items-center w-full">
        {steps.map((step, idx) => {
          const stepNum = (idx + 1) as Step;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                  ${isDone ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-[#004c8c] border-[#004c8c] text-white shadow-md shadow-blue-100' : ''}
                  ${!isDone && !isActive ? 'bg-white border-gray-300 text-gray-400' : ''}
                `}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-[#004c8c]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className={`h-0.5 rounded-full transition-all duration-500 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CategoryCard({ category, label, count, isSelected, onClick }: {
  category: Category; label: string; count: number; isSelected: boolean; onClick: () => void;
}) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border p-3 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 w-full hover:-translate-y-1 hover:shadow-md focus:outline-none
        ${isSelected 
          ? `${category.borderColor} ${category.bgColor} ${category.glowClass} border-2 shadow-lg scale-[1.03]` 
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
    >
      <span className={`p-2 rounded-xl transition-all duration-300 ${isSelected ? category.iconBg : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${isSelected ? category.color : 'text-gray-500'}`} />
      </span>
      <div className="flex flex-col items-center">
        <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>{label}</span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 transition-all duration-300
        ${isSelected 
          ? `${category.color} ${category.iconBg}` 
          : 'text-gray-500 bg-gray-100'
        }`}
      >
        {count} reports
      </span>
    </button>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-500">{title}</p>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function resolveCategoryKey(report: ReportDefinition): string {
  const rawReport = report as ReportDefinition & Record<string, unknown>;
  const reportCode = String(
    rawReport.reportCode ?? rawReport.ReportCode ?? rawReport.code ?? rawReport.Code ?? ''
  ).trim();
  const normalizedReportCode = reportCode.toLowerCase().replace(/[_\s-]+/g, '');

  const codeMatch = CATEGORIES.find((cat) =>
    cat.key !== 'others' &&
    cat.key !== 'assessment' &&
    REPORT_CODES_BY_CATEGORY[cat.key]?.some((code) =>
      normalizedReportCode === code.toLowerCase().replace(/[_\s-]+/g, '')
    )
  );

  if (codeMatch) return codeMatch.key;
  return 'assessment';
}

// --- Main Workspace ----------------------------------------------------------

export function ReportsWorkspace({ jobsCopy, workspaceCopy, paramsCopy, reportDefinitions }: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [showJobs, setShowJobs] = useState(false);

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportDefinition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!activeRequestId || !isGenerating) return;

    let timer: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/report-status/${encodeURIComponent(activeRequestId)}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await res.json();
        
        if (isCancelled) return;

        if (data.status === 'Completed') {
          setIsGenerating(false);
          toast.success('Report generated successfully!');
          refresh();
        } else if (data.status === 'Failed' || data.status === 'Cancelled') {
          setIsGenerating(false);
          setActiveRequestId(null);
          toast.error('Report generation failed.');
        } else {
          timer = setTimeout(checkStatus, 1500);
        }
      } catch (err: any) {
        if (isCancelled) return;
        setIsGenerating(false);
        setActiveRequestId(null);
        toast.error('Error checking report status.');
      }
    };

    checkStatus();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeRequestId, isGenerating, refresh]);

  const reportsByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>(CATEGORIES.map((cat) => [cat.key, []]));

    for (const report of reportDefinitions) {
      const categoryKey = resolveCategoryKey(report);
      map.get(categoryKey)?.push(report);
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
    setShowJobs(true);
    refresh();
    if (requestId) {
      setActiveRequestId(requestId);
      setPreviewReport(selectedReport);
      setIsGenerating(true);
    }
  };

  const activeCategoryDef = CATEGORIES.find((c) => c.key === selectedCategory);
  const activeReports = selectedCategory ? (reportsByCategory.get(selectedCategory) ?? []) : [];

  // Guard against stale module cache / hot-reload race where copy props haven't arrived yet
  if (!workspaceCopy || !paramsCopy) return null;

  return (
    <div className="flex flex-col gap-5">
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
        <Card padding="none" className="rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {workspaceCopy.categories[activeCategoryDef.key as keyof typeof workspaceCopy.categories]}
            </span>
            <span className="ml-1 text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
              {activeReports.length}
            </span>
          </div>

          {activeReports.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {workspaceCopy.noReportsFound}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 p-4">
              {activeReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => handleSelectReport(report)}
                  className="
                    w-[calc(25%-9px)] text-left rounded-lg border px-3 py-3
                    border-gray-200 bg-white
                    hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm
                    transition-all duration-150 focus:outline-none
                  "
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate text-gray-400">
                    {report.reportCode}
                  </p>
                  <p className="text-xs font-semibold leading-snug text-gray-800">
                    {report.reportName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {currentStep === 3 && activeCategoryDef && selectedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          <Card padding="none" className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004c8c]" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {workspaceCopy.categories[activeCategoryDef.key as keyof typeof workspaceCopy.categories]} Reports
              </span>
              <span className="ml-auto text-[10px] text-gray-500 font-bold bg-gray-200/80 rounded-full px-2 py-0.5">
                {activeReports.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-h-[460px]">
              <Tabs
                value={selectedReport.id}
                onChange={(val) => {
                  const rep = activeReports.find((r) => r.id === Number(val));
                  if (rep) handleSelectReport(rep);
                }}
                variant="pills"
                className="w-full"
              >
                <TabList className="grid grid-cols-2 gap-3 bg-transparent border-0 p-0" scrollable={false}>
                  {activeReports.map((report) => {
                    const isActive = selectedReport.id === report.id;
                    return (
                      <Tab
                        key={report.id}
                        value={report.id}
                        className={`relative text-left rounded-xl border p-4 transition-all duration-300 focus:outline-none flex items-center justify-between w-full h-auto bg-white hover:border-blue-200 hover:bg-blue-50/10 hover:-translate-y-0.5
                          ${isActive
                            ? 'border-[#004c8c] bg-blue-50/40 shadow-md shadow-blue-100/30 border-l-4 border-l-[#004c8c] -translate-y-0.5'
                            : 'border-gray-200'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                            ${isActive
                              ? 'bg-[#004c8c] text-white shadow-sm'
                              : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </span>

                          <div className="min-w-0">
                            <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate
                              ${isActive ? 'text-[#004c8c]/70' : 'text-gray-400'}`}
                            >
                              {report.reportCode}
                            </p>
                            <p className={`text-xs font-bold leading-tight truncate
                              ${isActive ? 'text-[#004c8c] font-extrabold' : 'text-gray-700 group-hover:text-gray-900'}`}
                            >
                              {report.reportName}
                            </p>
                          </div>
                        </div>

                      </Tab>
                    );
                  })}
                </TabList>
              </Tabs>
            </div>
          </Card>

          <Card padding="none" className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {workspaceCopy.configureParameters}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ReportParametersPanel report={selectedReport} onQueued={handleQueued} copy={paramsCopy} />
            </div>
          </Card>

        </div>
      )}


      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col items-center justify-center shadow-2xl border border-gray-100 text-center gap-4">
            <span className="w-12 h-12 rounded-full bg-blue-50 text-[#004c8c] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{workspaceCopy.generating.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{workspaceCopy.generating.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsGenerating(false);
                setActiveRequestId(null);
              }}
              className="w-full mt-2 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {workspaceCopy.generating.cancel}
            </button>
          </div>
        </div>
      )}

      {activeRequestId && !isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-100 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-gray-200 overflow-hidden relative">
            
            <div className="bg-white px-5 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {previewReport?.reportName || workspaceCopy.preview.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => {
                    window.location.href = `/api/report-download/${encodeURIComponent(activeRequestId)}`;
                  }}
                >
                  {workspaceCopy.preview.downloadPdf}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRequestId(null);
                    setPreviewReport(null);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Preview Object */}
            <div className="flex-1 bg-gray-200/50 p-4 relative">
              <object
                data={`/api/report-download/${encodeURIComponent(activeRequestId)}?inline=true&view=pdf#toolbar=0`}
                type="application/pdf"
                className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white"
              >
                <iframe
                  src={`/api/report-download/${encodeURIComponent(activeRequestId)}?inline=true&view=pdf#toolbar=0`}
                  className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white"
                  title="Report Preview"
                />
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
