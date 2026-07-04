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
import { Button, Card } from '@/components/common';
import { useReportJobs } from '@/hooks/useReportJobs';
import type { ReportsWorkspaceProps, ReportDefinition } from '@/types/report.types';

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
  ).trim();
  const normalizedReportCode = reportCode.toLowerCase().replace(/[_\s-]+/g, '');

  // Specific category mapping check (non-assessment categories)
  const codeMatch = CATEGORIES.find((cat) =>
    cat.key !== 'others' &&
    cat.key !== 'assessment' &&          // assessment is the default, skip here
    REPORT_CODES_BY_CATEGORY[cat.key]?.some((code) =>
      normalizedReportCode === code.toLowerCase().replace(/[_\s-]+/g, '')
    )
  );

  // If matched a specific non-assessment category, use it
  if (codeMatch) return codeMatch.key;

  // Default: ALL reports go to Assessment unless specifically mapped elsewhere
  return 'assessment';
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

      {/* ── STEP 2: Category selected → show all reports as Tab grid (2 per row) ── */}
      {currentStep === 2 && activeCategoryDef && (
        <Card padding="none" className="rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {activeCategoryDef.label}
            </span>
            <span className="ml-1 text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
              {activeReports.length}
            </span>
          </div>

          {activeReports.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No reports found for this category.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 p-4">
              {activeReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => handleSelectReport(report)}
                  className="
                    w-[calc(50%-6px)] text-left rounded-lg border px-3 py-3
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

      {/* ── STEP 3: Report selected → LEFT list + RIGHT form (equal width) ── */}
      {currentStep === 3 && activeCategoryDef && selectedReport && (
        <Card padding="none" className="rounded-xl overflow-hidden shadow-sm">
          <div className="flex min-h-[420px]">

            {/* LEFT: vertical report list (50%) */}
            <div className="w-1/2 border-r border-gray-100 flex flex-col bg-gray-50/30">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {activeCategoryDef.label}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
                  {activeReports.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeReports.map((report) => {
                  const isSelected = selectedReport.id === report.id;
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => handleSelectReport(report)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-150 focus:outline-none
                        ${isSelected
                          ? 'bg-blue-50/60 border-l-4 border-l-[#004c8c]'
                          : 'bg-white border-l-4 border-l-transparent hover:bg-blue-50/20'
                        }`}
                    >
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate ${isSelected ? 'text-[#004c8c]/70' : 'text-gray-400'}`}>
                        {report.reportCode}
                      </p>
                      <p className={`text-xs font-semibold leading-snug ${isSelected ? 'text-[#004c8c]' : 'text-gray-700'}`}>
                        {report.reportName}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: parameters form (50%) */}
            <div className="w-1/2 overflow-y-auto bg-white">
              <ReportParametersPanel report={selectedReport} onQueued={handleQueued} />
            </div>

          </div>
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
    </div>
  );
}
