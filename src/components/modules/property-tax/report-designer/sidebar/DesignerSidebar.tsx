'use client';

import { FieldExplorerTab } from './FieldExplorerTab';
import { ToolboxTab } from './ToolboxTab';
import { SectionsTab } from './SectionsTab';

export function DesignerSidebar() {
  return (
    <div className="cr-sidebar-left w-72 h-full flex flex-col bg-white border-r border-slate-200 select-none shrink-0 overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="sidebar-tabs flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
        <div
          className="sidebar-tab active flex-1 text-center py-2 border-b-2 border-blue-600 text-blue-600 bg-white cursor-pointer transition-colors"
          onClick={(e) => (window as unknown as { switchLeftTab?: (tab: string, el: HTMLElement) => void }).switchLeftTab?.('fields', e.currentTarget)}
        >
          Field Explorer
        </div>
        <div
          className="sidebar-tab flex-1 text-center py-2 border-b-2 border-transparent hover:text-slate-900 cursor-pointer transition-colors"
          onClick={(e) => (window as unknown as { switchLeftTab?: (tab: string, el: HTMLElement) => void }).switchLeftTab?.('toolbox', e.currentTarget)}
        >
          Toolbox
        </div>
        <div
          className="sidebar-tab flex-1 text-center py-2 border-b-2 border-transparent hover:text-slate-900 cursor-pointer transition-colors"
          onClick={(e) => (window as unknown as { switchLeftTab?: (tab: string, el: HTMLElement) => void }).switchLeftTab?.('sections', e.currentTarget)}
        >
          Sections
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden relative">
        <FieldExplorerTab />
        <ToolboxTab />
        <SectionsTab />
      </div>
    </div>
  );
}
