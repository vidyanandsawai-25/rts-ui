'use client';

import { FileText, ChevronRight } from 'lucide-react';
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
        <FileText className="w-4 h-4 text-[#800000]" />
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
                  className={`relative text-left rounded-xl border p-4 transition-all duration-300 focus:outline-none block w-full h-auto bg-white hover:border-red-200 hover:bg-red-50/30 hover:-translate-y-0.5 group
                    ${isActive
                      ? 'border-[#800000] bg-[#fff5f5] shadow-sm -translate-y-0.5'
                      : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between w-full gap-3 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className={`text-[10px] font-bold uppercase tracking-wider truncate
                          ${isActive ? 'text-[#800000]' : 'text-gray-500 group-hover:text-[#800000]/70'}`}
                        >
                          {report.reportCode}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold leading-tight truncate
                        ${isActive ? 'text-[#800000]' : 'text-gray-700 group-hover:text-[#800000]'}`}
                      >
                        {report.reportName}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#800000]' : 'text-gray-400 group-hover:text-[#800000]/70'}`} />
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
