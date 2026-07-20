'use client';

import { FileText } from 'lucide-react';
import { Card } from '@/components/common';
import type { ReportDefinition, ReportWorkspaceCopy } from '@/types/report.types';
import type { Category } from './ReportWorkspaceConfig';

interface ReportListPanelProps {
  activeCategoryDef: Category;
  activeReports: ReportDefinition[];
  workspaceCopy: ReportWorkspaceCopy;
  onSelectReport: (report: ReportDefinition) => void;
}

export function ReportListPanel({
  activeCategoryDef,
  activeReports,
  workspaceCopy,
  onSelectReport,
}: ReportListPanelProps) {
  return (
    <Card padding="none" className="rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {activeCategoryDef.name || workspaceCopy.categories[activeCategoryDef.key as keyof typeof workspaceCopy.categories] || activeCategoryDef.key}
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
                group w-[calc(25%-9px)] text-left rounded-lg border px-3 py-3
                border-gray-200 bg-white
                hover:border-red-200 hover:bg-red-50/30 hover:shadow-sm hover:-translate-y-0.5
                transition-all duration-150 focus:outline-none
              "
            >
              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5 truncate text-gray-400 group-hover:text-[#800000]/70 transition-colors">
                {report.reportCode}
              </p>
              <p className="text-xs font-semibold leading-snug text-gray-800 group-hover:text-[#800000] transition-colors">
                {report.reportName}
              </p>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
