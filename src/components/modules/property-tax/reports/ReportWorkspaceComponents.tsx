'use client';

import { Check, FileText } from 'lucide-react';
import { Card, Tabs, TabList, Tab } from '@/components/common';
import type { ReportDefinition, ReportWorkspaceCopy } from '@/types/report.types';
import type { Step, Category } from './ReportWorkspaceConfig';

// ── Stepper ──────────────────────────────────────────────────────────────────

export function Stepper({ currentStep, copy }: { currentStep: Step; copy: ReportWorkspaceCopy }) {
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

// ── CategoryCard ─────────────────────────────────────────────────────────────

export function CategoryCard({ category, label, count, reportsCountTemplate, isSelected, onClick }: {
  category: Category; label: string; count: number; reportsCountTemplate: string; isSelected: boolean; onClick: () => void;
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
        {reportsCountTemplate.replace('{count}', String(count))}
      </span>
    </button>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
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

// ── ReportListPanel (Step 2 — category reports grid) ─────────────────────────

interface ReportListPanelProps {
  activeCategoryDef: Category;
  activeReports: ReportDefinition[];
  workspaceCopy: ReportWorkspaceCopy;
  onSelectReport: (report: ReportDefinition) => void;
}

export function ReportListPanel({ activeCategoryDef, activeReports, workspaceCopy, onSelectReport }: ReportListPanelProps) {
  return (
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
              onClick={() => onSelectReport(report)}
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
  );
}

// ── ReportTabsPanel (Step 3 — left report tabs) ───────────────────────────────

interface ReportTabsPanelProps {
  activeCategoryDef: Category;
  activeReports: ReportDefinition[];
  selectedReport: ReportDefinition;
  workspaceCopy: ReportWorkspaceCopy;
  onSelectReport: (report: ReportDefinition) => void;
}

export function ReportTabsPanel({ activeCategoryDef, activeReports, selectedReport, workspaceCopy, onSelectReport }: ReportTabsPanelProps) {
  return (
    <Card padding="none" className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#004c8c]" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {workspaceCopy.reportsHeader.replace(
            '{category}',
            workspaceCopy.categories[activeCategoryDef.key as keyof typeof workspaceCopy.categories],
          )}
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
            if (rep) onSelectReport(rep);
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
  );
}
