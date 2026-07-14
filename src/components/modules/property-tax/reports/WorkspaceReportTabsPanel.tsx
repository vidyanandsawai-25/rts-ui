'use client';

import { FileText } from 'lucide-react';
import { Card, Tabs, TabList, Tab } from '@/components/common';
import type { ReportDefinition, ReportWorkspaceCopy } from '@/types/report.types';
import type { Category } from './ReportWorkspaceConfig';

interface ReportTabsPanelProps {
  activeCategoryDef: Category;
  activeReports: ReportDefinition[];
  selectedReport: ReportDefinition;
  workspaceCopy: ReportWorkspaceCopy;
  onSelectReport: (report: ReportDefinition) => void;
}

export function ReportTabsPanel({
  activeCategoryDef,
  activeReports,
  selectedReport,
  workspaceCopy,
  onSelectReport,
}: ReportTabsPanelProps) {
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
