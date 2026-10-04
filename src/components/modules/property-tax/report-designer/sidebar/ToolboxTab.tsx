'use client';

export function ToolboxTab() {
  return (
    <div className="sidebar-content flex flex-col h-full overflow-y-auto p-2.5 gap-3" id="tabContentToolbox" style={{ display: 'none' }}>
      {/* Category 1: Typography */}
      <div className="toolbox-category">
        <div className="toolbox-category-header text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          <span>🔤 मजकूर / Typography</span>
        </div>
        <div className="toolbox-grid grid grid-cols-2 gap-2">
          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('heading')}
            title="Add Large Bold Heading"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-blue-50 text-blue-600 mb-1">
              H1
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Heading</div>
            <div className="toolbox-desc text-[9px] text-slate-500">मुख्य शीर्षक</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('subheading')}
            title="Add Section Subheading"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-50 text-indigo-600 mb-1">
              H2
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Subheading</div>
            <div className="toolbox-desc text-[9px] text-slate-500">उपशीर्षक</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('text')}
            title="Add Standard Text Label"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-sky-50 text-sky-600 mb-1">
              📝
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Text Label</div>
            <div className="toolbox-desc text-[9px] text-slate-500">सामान्य मजकूर</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('field_label')}
            title="Add Marathi Field Label"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-amber-50 text-amber-600 mb-1">
              🏷️
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Field Label</div>
            <div className="toolbox-desc text-[9px] text-slate-500">मराठी नाव:</div>
          </div>
        </div>
      </div>

      {/* Category 2: Shapes & Lines */}
      <div className="toolbox-category">
        <div className="toolbox-category-header text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          <span>📐 रेषा आणि आकार / Shapes</span>
        </div>
        <div className="toolbox-grid grid grid-cols-2 gap-2">
          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('text_box')}
            title="Add Text Box"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-blue-50 text-blue-600 mb-1">
              🔲
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Text Box</div>
            <div className="toolbox-desc text-[9px] text-slate-500">मजकूर पेटी</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('line')}
            title="Add Horizontal Line"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-slate-100 text-slate-700 mb-1">
              ━
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Line</div>
            <div className="toolbox-desc text-[9px] text-slate-500">आडवी रेषा</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('rectangle')}
            title="Add Rectangle"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-emerald-50 text-emerald-600 mb-1">
              ▭
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Rectangle</div>
            <div className="toolbox-desc text-[9px] text-slate-500">आयत चौकटी</div>
          </div>

          <div
            className="toolbox-card flex flex-col items-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => (window as unknown as { addNewElement?: (t: string) => void }).addNewElement?.('circle')}
            title="Add Circle"
          >
            <div className="toolbox-icon-circle w-7 h-7 rounded-full flex items-center justify-center text-xs bg-purple-50 text-purple-600 mb-1">
              ⭕
            </div>
            <div className="toolbox-title text-[11px] font-semibold text-slate-800">Circle</div>
            <div className="toolbox-desc text-[9px] text-slate-500">वर्तुळ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
