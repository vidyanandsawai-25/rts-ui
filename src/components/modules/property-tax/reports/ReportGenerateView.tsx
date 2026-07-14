'use client';

import { Card } from '@/components/common';
import { ReportParametersPanel } from './ReportParametersPanel';
import { Stepper, CategoryCard, EmptyState, ReportListPanel, ReportTabsPanel } from './ReportWorkspaceComponents';
import { CATEGORIES } from './ReportWorkspaceConfig';
import type { Step } from './ReportWorkspaceConfig';
import type {
  ReportDefinition,
  ReportWorkspaceCopy,
  ReportParamsPanelCopy,
  ZoneSummary,
  WardSummary,
  PropertySummary,
} from '@/types/report.types';
import type { FinancialYear } from '@/types/financialYear.types';

interface ReportGenerateViewProps {
  currentStep: Step;
  selectedCategory: string | null;
  selectedReport: ReportDefinition | null;
  reportsByCategory: Map<string, ReportDefinition[]>;
  workspaceCopy: ReportWorkspaceCopy;
  paramsCopy: ReportParamsPanelCopy;
  zones: ZoneSummary[];
  financialYears: FinancialYear[];
  fetchWards: (zoneId: number) => Promise<WardSummary[]>;
  fetchProperties: (wardId: number) => Promise<PropertySummary[]>;
  onCategoryClick: (key: string) => void;
  onSelectReport: (report: ReportDefinition) => void;
  onQueued: (requestId: string) => void;
}

export function ReportGenerateView({
  currentStep,
  selectedCategory,
  selectedReport,
  reportsByCategory,
  workspaceCopy,
  paramsCopy,
  zones,
  financialYears,
  fetchWards,
  fetchProperties,
  onCategoryClick,
  onSelectReport,
  onQueued,
}: ReportGenerateViewProps) {
  const categoryCount = (key: string) => reportsByCategory.get(key)?.length ?? 0;
  const activeCategoryDef = CATEGORIES.find((c) => c.key === selectedCategory);
  const activeReports = selectedCategory ? (reportsByCategory.get(selectedCategory) ?? []) : [];

  return (
    <>
      <Stepper currentStep={currentStep} copy={workspaceCopy} />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat}
            label={workspaceCopy.categories[cat.key as keyof typeof workspaceCopy.categories]}
            count={categoryCount(cat.key)}
            reportsCountTemplate={workspaceCopy.reportsCount}
            isSelected={selectedCategory === cat.key}
            onClick={() => onCategoryClick(cat.key)}
          />
        ))}
      </div>

      {currentStep === 1 && (
        <EmptyState title={workspaceCopy.emptyState.title} subtitle={workspaceCopy.emptyState.subtitle} />
      )}

      {currentStep === 2 && activeCategoryDef && (
        <ReportListPanel
          activeCategoryDef={activeCategoryDef}
          activeReports={activeReports}
          workspaceCopy={workspaceCopy}
          onSelectReport={onSelectReport}
        />
      )}

      {currentStep === 3 && activeCategoryDef && selectedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <ReportTabsPanel
            activeCategoryDef={activeCategoryDef}
            activeReports={activeReports}
            selectedReport={selectedReport}
            workspaceCopy={workspaceCopy}
            onSelectReport={onSelectReport}
          />
          <Card padding="none" className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {workspaceCopy.configureParameters}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ReportParametersPanel
                report={selectedReport}
                onQueued={onQueued}
                copy={paramsCopy}
                zones={zones}
                financialYears={financialYears}
                fetchWards={fetchWards}
                fetchProperties={fetchProperties}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
