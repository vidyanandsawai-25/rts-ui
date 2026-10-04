'use client';

export function FieldExplorerTab() {
  return (
    <div className="sidebar-content flex flex-col h-full overflow-y-auto p-2" id="tabContentFields">
      <input
        type="text"
        className="field-search w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded mb-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        id="fieldSearchInput"
        placeholder="🔍 Search database fields..."
        onKeyUp={(e) => (window as unknown as { filterFieldTree?: (q: string) => void }).filterFieldTree?.((e.target as HTMLInputElement).value)}
      />

      {/* Tree 1: DATA FIELDS */}
      <div className="tree-node mb-1.5 border border-slate-200 rounded overflow-hidden bg-white">
        <div
          className="tree-header flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none"
          onClick={(e) => (window as unknown as { toggleTreeNode?: (el: HTMLElement) => void }).toggleTreeNode?.(e.currentTarget)}
        >
          <span>📁</span>
          <span>DATA FIELDS (Database)</span>
        </div>
        <div className="tree-children p-1.5 text-xs text-slate-600 bg-white" id="treeDataFields" style={{ display: 'none' }} />
      </div>

      {/* Tree 2: FORMULA FIELDS */}
      <div className="tree-node mb-1.5 border border-slate-200 rounded overflow-hidden bg-white">
        <div
          className="tree-header flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none"
          onClick={(e) => (window as unknown as { toggleTreeNode?: (el: HTMLElement) => void }).toggleTreeNode?.(e.currentTarget)}
        >
          <span>📁</span>
          <span>FORMULA FIELDS (&#123;@&#125;)</span>
        </div>
        <div className="tree-children p-1.5 text-xs text-slate-600 bg-white" id="treeFormulaFields" style={{ display: 'none' }} />
      </div>

      {/* Tree 3: SUMMARY FIELDS */}
      <div className="tree-node mb-1.5 border border-slate-200 rounded overflow-hidden bg-white">
        <div
          className="tree-header flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none"
          onClick={(e) => (window as unknown as { toggleTreeNode?: (el: HTMLElement) => void }).toggleTreeNode?.(e.currentTarget)}
        >
          <span>📁</span>
          <span>SUMMARY FIELDS (∑)</span>
        </div>
        <div className="tree-children p-1.5 text-xs text-slate-600 bg-white" id="treeSummaryFields" style={{ display: 'none' }} />
      </div>

      {/* Tree 4: REPORT PARAMETERS */}
      <div className="tree-node mb-1.5 border border-slate-200 rounded overflow-hidden bg-white">
        <div
          className="tree-header flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none"
          onClick={(e) => (window as unknown as { toggleTreeNode?: (el: HTMLElement) => void }).toggleTreeNode?.(e.currentTarget)}
        >
          <span>📁</span>
          <span>REPORT PARAMETERS (&#123;?&#125;)</span>
        </div>
        <div className="tree-children p-1.5 text-xs text-slate-600 bg-white" id="treeParameterFields" style={{ display: 'none' }} />
      </div>

      {/* Tree 5: STATIC TEXT & SHAPES */}
      <div className="tree-node border border-slate-200 rounded overflow-hidden bg-white">
        <div
          className="tree-header flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer select-none"
          onClick={(e) => (window as unknown as { toggleTreeNode?: (el: HTMLElement) => void }).toggleTreeNode?.(e.currentTarget)}
        >
          <span>📁</span>
          <span>STATIC TEXT &amp; SHAPES</span>
        </div>
        <div className="tree-children p-1.5 text-xs text-slate-600 bg-white" id="treeStaticFields" style={{ display: 'none' }} />
      </div>
    </div>
  );
}
