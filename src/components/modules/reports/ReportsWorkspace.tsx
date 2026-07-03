'use client';

import { useState, useMemo } from 'react';
import {
  Home,
  BarChart2,
  CreditCard,
  CheckCircle,
  Tag,
  MoreHorizontal,
  FileText,
  Check,
} from 'lucide-react';
import { ReportParametersPanel } from '@/components/modules/reports/ReportParametersPanel';
import { ReportJobsList } from '@/components/modules/reports/ReportJobsList';
import { Button, Card, Tabs, TabList, Tab, TabPanel } from '@/components/common';
import { useReportJobs } from '@/hooks/useReportJobs';
import type { ReportsWorkspaceProps, ReportDefinition } from '@/types/report.types';

const REPORT_CODE_PREFIXES: Record<string, string[]> = {
  assessment: ['ass', 'asm', 'nodue', 'noduecertificate', 'noduecertificate'],
  amc: ['amc'],
  transaction: ['txn', 'trn', 'tra'],
  approval: ['apr', 'app', 'apv'],
  discount: ['dis', 'dsc'],
  others: ['oth', 'mis'],
};

type Step = 1 | 2 | 3;

interface Category {
  key: string;
  label: string;
  labelHi: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: Category[] = [
  { key: 'assessment', label: 'Assessment', labelHi: 'मूल्यांकन', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'amc', label: 'AMC', labelHi: 'एएमसी', icon: BarChart2, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'transaction', label: 'Transaction', labelHi: 'व्यवहार', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'approval', label: 'Approval', labelHi: 'मंजुरी', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { key: 'discount', label: 'Discount', labelHi: 'सूट', icon: Tag, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { key: 'others', label: 'Others', labelHi: 'इतर', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

const STEPS = [
  { label: 'Select Category', labelHi: 'श्रेणी निवडा' },
  { label: 'Select Report', labelHi: 'अहवाल निवडा' },
  { label: 'Set Parameters', labelHi: 'मापदंड सेट करा' },
];

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <Card padding="none" className="rounded-xl px-6 py-4 shadow-sm">
      <div className="flex items-center w-full">
        {STEPS.map((step, idx) => {
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
                  <p className="text-[10px] text-gray-400 leading-tight truncate">{step.labelHi}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
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

function CategoryCard({ category, count, isSelected, onClick }: {
  category: Category; count: number; isSelected: boolean; onClick: () => void;
}) {
  const Icon = category.icon;
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className={`relative h-auto rounded-lg border p-2.5 text-center cursor-pointer hover:-translate-y-0.5 flex-col items-center gap-1.5 w-full
        ${isSelected ? `${category.borderColor} bg-slate-50/55 shadow-sm -translate-y-0.5` : 'border-gray-200 hover:border-gray-300'}`}
    >
      <span className="flex flex-col items-center gap-1">
        <span className={`p-1.5 rounded-lg ${isSelected ? category.bgColor : 'bg-gray-50'}`}>
          <Icon className={`w-4 h-4 ${isSelected ? category.color : 'text-gray-500'}`} />
        </span>
        <span>
          <span className={`block text-xs font-bold leading-tight ${isSelected ? category.color : 'text-gray-700'}`}>{category.label}</span>
          <span className="block text-[9px] text-gray-400 leading-tight">{category.labelHi}</span>
        </span>
        <span className="text-[10px] text-gray-500 font-medium">{count} reports</span>
      </span>
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-500">Select a category above</p>
        <p className="text-sm text-gray-400 mt-1">Choose a report type to view available reports</p>
      </div>
    </div>
  );
}

function resolveCategoryKey(report: ReportDefinition): string {
  const rawReport = report as ReportDefinition & Record<string, unknown>;
  
  const reportCode = String(
    rawReport.reportCode ?? rawReport.ReportCode ?? rawReport.code ?? rawReport.Code ?? ''
  ).trim().toLowerCase();
  const normalizedReportCode = reportCode.replace(/[_\s-]+/g, '');
  const codePrefix = reportCode.split('-')[0]?.replace(/[_\s-]+/g, '') ?? '';

  // 1. Check code prefix match first for specific categories (excluding others fallback)
  const prefixMatch = CATEGORIES.find((cat) =>
    cat.key !== 'others' &&
    REPORT_CODE_PREFIXES[cat.key]?.some((prefix) =>
      normalizedReportCode.includes(prefix) || codePrefix.startsWith(prefix)
    )
  );
  if (prefixMatch) return prefixMatch.key;

  // 2. Fallback to direct category field match
  const categoryField = String(rawReport.category ?? rawReport.Category ?? '').trim().toLowerCase();
  const catMatch = CATEGORIES.find(
    (cat) => cat.key === categoryField || cat.label.toLowerCase() === categoryField
  );
  if (catMatch) return catMatch.key;

  return 'others';
}

// --- Main Workspace ----------------------------------------------------------

export function ReportsWorkspace({ jobsCopy, reportDefinitions }: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [showJobs, setShowJobs] = useState(false);

  const reportsByCategory = useMemo(() => {
    const map = new Map<string, ReportDefinition[]>(CATEGORIES.map((cat) => [cat.key, []]));

    for (const report of reportDefinitions) {
      const categoryKey = resolveCategoryKey(report);
      console.log(`REPORTS_DEBUG: Report "${report.reportName}" (id: ${report.id}, code: "${report.reportCode}", category: "${report.category}") resolved to categoryKey: "${categoryKey}"`);
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

  const handleQueued = () => {
    setShowJobs(true);
    refresh();
  };

  const activeCategoryDef = CATEGORIES.find((c) => c.key === selectedCategory);
  const activeReports = selectedCategory ? (reportsByCategory.get(selectedCategory) ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      {/* 3-step Stepper */}
      <Stepper currentStep={currentStep} />

      {/* Category Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat}
            count={categoryCount(cat.key)}
            isSelected={selectedCategory === cat.key}
            onClick={() => handleCategoryClick(cat.key)}
          />
        ))}
      </div>

      {/* Step 1: no category selected */}
      {currentStep === 1 && <EmptyState />}

      {/* Steps 2 & 3: LEFT vertical tabs + RIGHT parameters panel */}
      {currentStep >= 2 && activeCategoryDef && (
        <Card padding="none" className="rounded-xl overflow-hidden shadow-sm min-h-[420px]">
          <Tabs
            value={selectedReport ? String(selectedReport.id) : ''}
            onChange={(value) => {
              const report = activeReports.find((item) => String(item.id) === String(value));
              if (report) handleSelectReport(report);
            }}
            orientation="vertical"
            className="grid grid-cols-1 md:grid-cols-2 min-h-[420px]"
          >
            {/* LEFT column (Reports list) */}
            <div className="border-r border-gray-100 flex flex-col h-full bg-slate-50/10">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {activeCategoryDef.label}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
                  {activeReports.length}
                </span>
              </div>
              {activeReports.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400 px-4">
                  No reports found for this category.
                </div>
              ) : (
                <TabList className="overflow-y-auto flex-1 max-h-[500px] flex-col items-stretch p-0 border-0 bg-white">
                  {activeReports.map((report) => {
                    const isSelected = selectedReport?.id === report.id;
                    return (
                      <Tab
                        key={report.id}
                        value={String(report.id)}
                        className="group w-full justify-between rounded-none border-b border-r-0 border-gray-100 last:border-b-0 px-4 py-3.5 data-[state=active]:bg-blue-50/50 data-[state=active]:border-l-4 data-[state=active]:border-l-[#004c8c] data-[state=active]:text-[#004c8c] data-[state=inactive]:border-l-4 data-[state=inactive]:border-l-transparent data-[state=inactive]:bg-white"
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="min-w-0 text-left">
                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#004c8c]/70' : 'text-gray-400'}`}>
                              {report.reportCode}
                            </span>
                            <span className={`block text-sm leading-snug truncate font-semibold ${isSelected ? 'text-[#004c8c]' : 'text-gray-700'}`}>
                              {report.reportName}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-[#004c8c] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </span>
                      </Tab>
                    );
                  })}
                </TabList>
              )}
            </div>

            {/* RIGHT column (Parameters panel) */}
            <div className="overflow-y-auto max-h-[500px] bg-white h-full">
              {selectedReport ? (
                activeReports.map((report) => (
                  <TabPanel key={report.id} value={String(report.id)} className="m-0 h-full">
                    <ReportParametersPanel report={report} onQueued={handleQueued} />
                  </TabPanel>
                ))
              ) : (
                <ReportParametersPanel report={null} onQueued={handleQueued} />
              )}
            </div>
          </Tabs>
        </Card>
      )}

      {showJobs && (
        <ReportJobsList
          jobs={jobs}
          loading={isLoading}
          copy={jobsCopy}
          reportDefinitions={reportDefinitions}
        />
      )}

      {/* Diagnostics panel */}
      <details className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono">
        <summary className="font-bold cursor-pointer text-gray-700">Diagnostics: Click to see all {reportDefinitions.length} loaded reports</summary>
        <div className="mt-2 max-h-[300px] overflow-y-auto flex flex-col gap-1">
          {reportDefinitions.length === 0 ? (
            <p className="text-red-500 font-bold">API returned 0 report definitions. Check backend connection or database.</p>
          ) : (
            reportDefinitions.map(r => {
              const categoryKey = resolveCategoryKey(r);
              return (
                <div key={r.id} className="border-b border-gray-100 py-1 flex justify-between">
                  <span>Code: <b>{r.reportCode}</b> | Name: {r.reportName} | Cat: {r.category}</span>
                  <span className="text-blue-600 font-bold">Resolved: {categoryKey}</span>
                </div>
              );
            })
          )}
        </div>
      </details>
    </div>
  );
}
