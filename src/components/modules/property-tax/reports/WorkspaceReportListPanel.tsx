'use client';

import { FileText } from 'lucide-react';
import { Card, Badge } from '@/components/common';
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
      <div className="px-4 py-3 border-b border-gray-300 bg-gray-100 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#800000]" />
        <Badge variant="secondary" className="bg-transparent border-none px-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-transparent">
          {activeCategoryDef.name || activeCategoryDef.key}
        </Badge>
        <Badge variant="secondary" className="bg-transparent border-none px-0 ml-auto text-[10px] text-gray-500 font-bold bg-gray-200/80 rounded-full px-2 py-0.5 hover:bg-gray-200/80">
          {activeReports.length}
        </Badge>
      </div>
      {activeReports.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          {workspaceCopy.noReportsFound}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 p-4">
          {activeReports.map((report) => (
            <Card
              key={report.id}
              role="button"
              tabIndex={0}
              padding="sm"
              onClick={() => onSelectReport(report)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectReport(report);
                }
              }}
              className="
                group w-[calc(20%-9.6px)] text-left cursor-pointer
                hover:border-red-200 hover:bg-red-50/30 hover:shadow-sm hover:-translate-y-0.5
                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200
              "
            >
              <p className="text-xs font-semibold leading-snug text-gray-800 group-hover:text-[#800000] transition-colors">
                {report.reportName}
              </p>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
