export type DesignerPaperSize =
  | 'A4'
  | 'A3'
  | 'A3 Extra'
  | 'A3 Plus'
  | 'A3 Rotated'
  | 'A3 Transverse'
  | 'A4 Extra'
  | 'A4 Plus'
  | 'A4 Rotated'
  | 'A4 Small'
  | 'A4 Transverse'
  | 'A5'
  | 'A5 Extra'
  | 'A5 Rotated'
  | 'A5 Transverse'
  | 'A6'
  | 'Letter'
  | 'Letter Extra'
  | 'Letter Plus'
  | 'Letter Rotated'
  | 'Legal'
  | 'Tabloid'
  | 'Custom';

export type DesignerOrientation = 'portrait' | 'landscape';

export interface DesignerMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ClassicDesignerOptions {
  reportId?: string;
  defaultReportId?: string;
  openImporter?: boolean;
  createNewReport?: boolean;
  locale?: string;
}

export interface ClassicReportDesignerProps {
  locale?: string;
  defaultReportId?: string;
  reportId?: string;
  openImporter?: boolean;
  createNewReport?: boolean;
}

declare global {
  interface Window {
    ReportRenderer?: unknown;
    initDesignerApp?: (options?: ClassicDesignerOptions) => Promise<void>;
    switchReport?: (reportId: string) => Promise<void>;
    goBackToPreviousScreen?: () => void;
    reportDef?: unknown;
    __designerScriptsLoaded?: boolean;
    __designerKeyboardShortcutsInstalled?: boolean;
    handleCanvasAreaMouseDown?: (e?: unknown) => void;
    handleCanvasMouseMove?: (e?: unknown) => void;
    handleCanvasScroll?: (e?: unknown) => void;
  }
}
