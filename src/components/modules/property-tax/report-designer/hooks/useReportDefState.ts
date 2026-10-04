'use client';

import { useState, useCallback, useRef } from 'react';
import { calculatePageDimensions } from '../utils/report-math';

export interface ReportElementStyles {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number | string;
  borderStyle?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  border?: string;
  padding?: number | string;
  borderRadius?: number | string;
  zIndex?: number;
  opacity?: number;
}

export interface ReportElement {
  id: string;
  type: string;
  sectionId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  w?: number;
  h?: number;
  text?: string;
  displayText?: string;
  field?: string;
  path?: string;
  styles?: ReportElementStyles;
  table?: unknown;
}

export interface ReportSection {
  id: string;
  name: string;
  height: number;
  type?: string;
  visible?: boolean;
}

export interface ReportDefinition {
  id?: string;
  reportId?: string;
  reportName: string;
  reportCode?: string;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number };
  widthMm?: number;
  heightMm?: number;
  pageWidth?: number;
  pageHeight?: number;
  sections: ReportSection[];
  elements: ReportElement[];
  layoutVersion?: number | string;
}

export function createBlankReportDefinition(name = 'New Report', code = 'CUSTOM_REPORT'): ReportDefinition {
  const dims = calculatePageDimensions('A4', 'landscape');
  return {
    reportName: name,
    reportCode: code,
    paperSize: 'A4',
    orientation: 'landscape',
    margins: { top: 6.4, right: 3.2, bottom: 6.4, left: 6.4 },
    widthMm: dims.widthMm,
    heightMm: dims.heightMm,
    pageWidth: dims.pageWidthPx,
    pageHeight: dims.pageHeightPx,
    sections: [
      { id: 'pageheader', name: 'Page Header (पृष्ठ शीर्षक)', height: 80 },
      { id: 'details', name: 'Details (तपशील)', height: 400 },
      { id: 'pagefooter', name: 'Page Footer (तळटीप)', height: 60 },
    ],
    elements: [],
  };
}

export function useReportDefState(initialDef?: ReportDefinition) {
  const [reportDef, setReportDef] = useState<ReportDefinition>(
    () => initialDef || createBlankReportDefinition()
  );
  const [activeSectionId, setActiveSectionId] = useState<string>('details');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // History Stack
  const historyRef = useRef<ReportDefinition[]>([reportDef]);
  const historyIndexRef = useRef<number>(0);

  const pushHistory = useCallback((newDef: ReportDefinition) => {
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newDef)));
    if (nextHistory.length > 50) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setIsDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevDef = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setReportDef(prevDef);
      setSelectedElementIds([]);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextDef = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setReportDef(nextDef);
      setSelectedElementIds([]);
    }
  }, []);

  const setPaperSize = useCallback((size: string) => {
    setReportDef(prev => {
      const dims = calculatePageDimensions(size, prev.orientation || 'landscape');
      const updated: ReportDefinition = {
        ...prev,
        paperSize: size,
        widthMm: dims.widthMm,
        heightMm: dims.heightMm,
        pageWidth: dims.pageWidthPx,
        pageHeight: dims.pageHeightPx,
      };
      pushHistory(updated);
      return updated;
    });
  }, [pushHistory]);

  const setOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    setReportDef(prev => {
      const dims = calculatePageDimensions(prev.paperSize || 'A4', orientation);
      const updated: ReportDefinition = {
        ...prev,
        orientation,
        widthMm: dims.widthMm,
        heightMm: dims.heightMm,
        pageWidth: dims.pageWidthPx,
        pageHeight: dims.pageHeightPx,
      };
      pushHistory(updated);
      return updated;
    });
  }, [pushHistory]);

  const selectElement = useCallback((id: string, multiSelect = false) => {
    setSelectedElementIds(prev => {
      if (multiSelect) {
        return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElementIds([]);
  }, []);

  const addElement = useCallback((el: ReportElement) => {
    setReportDef(prev => {
      const updated: ReportDefinition = {
        ...prev,
        elements: [...prev.elements, el],
      };
      pushHistory(updated);
      return updated;
    });
    setSelectedElementIds([el.id]);
  }, [pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<ReportElement>) => {
    setReportDef(prev => {
      const updated: ReportDefinition = {
        ...prev,
        elements: prev.elements.map(el => (el.id === id ? { ...el, ...updates } : el)),
      };
      pushHistory(updated);
      return updated;
    });
  }, [pushHistory]);

  const deleteElements = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setReportDef(prev => {
      const updated: ReportDefinition = {
        ...prev,
        elements: prev.elements.filter(el => !ids.includes(el.id)),
      };
      pushHistory(updated);
      return updated;
    });
    setSelectedElementIds([]);
  }, [pushHistory]);

  const duplicateElements = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setReportDef(prev => {
      const duplicates: ReportElement[] = [];
      prev.elements.forEach(el => {
        if (ids.includes(el.id)) {
          duplicates.push({
            ...JSON.parse(JSON.stringify(el)),
            id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            x: el.x + 10,
            y: el.y + 10,
          });
        }
      });
      const updated: ReportDefinition = {
        ...prev,
        elements: [...prev.elements, ...duplicates],
      };
      pushHistory(updated);
      setSelectedElementIds(duplicates.map(d => d.id));
      return updated;
    });
  }, [pushHistory]);

  return {
    reportDef,
    setReportDef,
    activeSectionId,
    setActiveSectionId,
    selectedElementIds,
    setSelectedElementIds,
    selectElement,
    clearSelection,
    isDirty,
    undo,
    redo,
    setPaperSize,
    setOrientation,
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    pushHistory,
  };
}
