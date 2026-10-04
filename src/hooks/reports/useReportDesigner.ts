'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ClassicElement,
  ClassicReportDefinition,
  ClassicSection,
  createBlankClassicReportDefinition,
} from '@/lib/report-designer/classic-adapter';
import {
  appendClassicElement,
  appendClassicSection,
  bindClassicField,
  createClassicElement,
  createClassicSection,
  designerTableAnchorKey,
  designerTableCellCoverage,
  designerTableRectangleKeys,
  duplicateClassicElement,
  findClassicElement,
  removeClassicElement,
  removeClassicSection,
  updateClassicSection,
  updateClassicElement,
  updateClassicElementStyles,
  updateClassicPageSetup,
  type CreatableDesignerBandType,
  type PageSetupOptions,
} from '@/lib/report-designer/classic-model';
import { openReportPreview } from '@/lib/report-designer/preview-report';
import {
  listDesignerReports,
  loadDesignerReport,
  saveDesignerReport,
  updateDesignerReportSettings,
  type DesignerReportListItem,
} from '@/lib/report-designer/designer-api';
import { applyDesignerReportSettings } from '@/lib/report-designer/report-settings';
import type { DesignerElementType, DesignerReportSettings } from '@/types/report-designer.types';
import type { ReportDesignerCopy } from '@/types/report-designer-copy.types';

type DesignerActivity = 'idle' | 'loading' | 'saving' | 'publishing' | 'error';

export function useReportDesigner(
  messages: ReportDesignerCopy['messages'],
  defaultReportId?: string
) {
  const [reports, setReports] = useState<DesignerReportListItem[]>([]);
  const [activeReportId, setActiveReportId] = useState(defaultReportId ?? '');
  const [definition, setDefinition] = useState<ClassicReportDefinition | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const [selectedCellKeys, setSelectedCellKeys] = useState<string[]>([]);
  const [activity, setActivity] = useState<DesignerActivity>('loading');
  const [message, setMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [past, setPast] = useState<ClassicReportDefinition[]>([]);
  const [future, setFuture] = useState<ClassicReportDefinition[]>([]);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    listDesignerReports(controller.signal)
      .then((items) => {
        setReports(items);
        setActiveReportId((current) => current || items[0]?.reportCode || items[0]?.id || '');
        if (items.length === 0 && !defaultReportId) setActivity('idle');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setActivity('error');
        setMessage(messages.reportsLoadFailed);
      });
    return () => controller.abort();
  }, [defaultReportId, messages.reportsLoadFailed]);

  useEffect(() => {
    if (!activeReportId) {
      return;
    }

    const controller = new AbortController();
    loadDesignerReport(activeReportId, controller.signal)
      .then((loaded) => {
        setDefinition(loaded);
        setSelectedElementId(null);
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
        setSelectedSectionId(
          loaded.sections.find((section) => section.visible !== false)?.id ?? null
        );
        setIsDirty(false);
        setPast([]);
        setFuture([]);
        setActivity('idle');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setDefinition(null);
        setActivity('error');
        setMessage(messages.designLoadFailed);
      });
    return () => controller.abort();
  }, [activeReportId, messages.designLoadFailed, reloadToken]);

  const selectedElement = useMemo(
    () => findClassicElement(definition, selectedElementId),
    [definition, selectedElementId]
  );

  const selectedSection = useMemo(
    () => definition?.sections.find((section) => section.id === selectedSectionId) ?? null,
    [definition, selectedSectionId]
  );

  const selectReport = useCallback((reportId: string) => {
    setActivity('loading');
    setMessage('');
    setDefinition(null);
    setActiveReportId(reportId);
    setSelectedElementId(null);
    setSelectedCellKey(null);
    setSelectedCellKeys([]);
    setSelectedSectionId(null);
  }, []);

  const selectElement = useCallback(
    (elementId: string, sectionId: string) => {
      setSelectedElementId(elementId);
      setSelectedSectionId(sectionId);
      const elem = findClassicElement(definition, elementId);
      if (elem && (elem.designerType === 'table' || elem.type === 'table')) {
        setSelectedCellKey('0_0');
        setSelectedCellKeys(['0_0']);
      } else {
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
      }
    },
    [definition]
  );

  const selectCell = useCallback(
    (cellKey: string, mode: 'replace' | 'range' | 'toggle' = 'replace') => {
      const table = selectedElement?.table;
      if (!table || !table.cells[cellKey]) return;
      const anchorKey = designerTableAnchorKey(table, cellKey);
      const coverage = designerTableCellCoverage(table, anchorKey);

      if (mode === 'range' && selectedCellKey) {
        setSelectedCellKeys(
          designerTableRectangleKeys(selectedCellKey, anchorKey).filter((key) =>
            Boolean(table.cells[key])
          )
        );
      } else if (mode === 'toggle') {
        setSelectedCellKeys((current) => {
          const next = new Set(current);
          const removing = coverage.every((key) => next.has(key));
          coverage.forEach((key) => (removing ? next.delete(key) : next.add(key)));
          return next.size > 0 ? [...next] : coverage;
        });
      } else {
        setSelectedCellKeys(coverage.length > 0 ? coverage : [anchorKey]);
      }
      setSelectedCellKey(anchorKey);
    },
    [selectedCellKey, selectedElement]
  );

  const selectSection = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedElementId(null);
    setSelectedCellKey(null);
    setSelectedCellKeys([]);
  }, []);

  const updateElement = useCallback(
    (elementId: string, patch: Partial<ClassicElement>) => {
      if (!definition) return;
      setPast((current) => [...current, definition].slice(-50));
      setFuture([]);
      setDefinition(updateClassicElement(definition, elementId, patch));
      setIsDirty(true);
    },
    [definition]
  );

  const commitDefinition = useCallback(
    (next: ClassicReportDefinition) => {
      if (!definition || next === definition) return;
      setPast((current) => [...current, definition].slice(-50));
      setFuture([]);
      setDefinition(next);
      setIsDirty(true);
    },
    [definition]
  );

  const updateSelectedElement = useCallback(
    (patch: Partial<ClassicElement>) => {
      if (!selectedElementId) return;
      updateElement(selectedElementId, patch);
    },
    [selectedElementId, updateElement]
  );

  const updateSelectedElementStyles = useCallback(
    (patch: Record<string, string | number>) => {
      if (!definition || !selectedElementId) return;
      commitDefinition(updateClassicElementStyles(definition, selectedElementId, patch));
    },
    [commitDefinition, definition, selectedElementId]
  );

  const updateSelectedSection = useCallback(
    (patch: Partial<ClassicSection>) => {
      if (!definition || !selectedSectionId) return;
      commitDefinition(updateClassicSection(definition, selectedSectionId, patch));
    },
    [commitDefinition, definition, selectedSectionId]
  );

  const undo = useCallback(() => {
    if (!definition || past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture((current) => [definition, ...current].slice(0, 50));
    setDefinition(previous);
    setIsDirty(true);
  }, [definition, past]);

  const redo = useCallback(() => {
    if (!definition || future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast((current) => [...current, definition].slice(-50));
    setDefinition(next);
    setIsDirty(true);
  }, [definition, future]);

  const addElement = useCallback(
    (type: DesignerElementType) => {
      if (!definition) return;
      const sectionId =
        selectedSectionId ?? definition.sections.find((section) => section.visible !== false)?.id;
      if (!sectionId) return;
      const element = createClassicElement(type, sectionId);
      commitDefinition(appendClassicElement(definition, element));
      setSelectedElementId(element.id);
      setSelectedSectionId(sectionId);
      if (type === 'table') {
        setSelectedCellKey('0_0');
        setSelectedCellKeys(['0_0']);
      } else {
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
      }
    },
    [commitDefinition, definition, selectedSectionId]
  );

  const addSection = useCallback(
    (bandType: CreatableDesignerBandType, name: string) => {
      if (!definition) return;
      const section = createClassicSection(bandType, name);
      commitDefinition(appendClassicSection(definition, section));
      setSelectedSectionId(section.id);
      setSelectedElementId(null);
      setSelectedCellKey(null);
      setSelectedCellKeys([]);
    },
    [commitDefinition, definition]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      if (!definition || definition.sections.length <= 1) return;
      const deletedIndex = definition.sections.findIndex((section) => section.id === sectionId);
      if (deletedIndex < 0) return;
      const next = removeClassicSection(definition, sectionId);
      commitDefinition(next);
      if (selectedSectionId === sectionId) {
        const fallbackIndex = Math.min(deletedIndex, next.sections.length - 1);
        setSelectedSectionId(next.sections[fallbackIndex]?.id ?? null);
        setSelectedElementId(null);
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
      } else if (selectedElement?.sectionId === sectionId) {
        setSelectedElementId(null);
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
      }
    },
    [commitDefinition, definition, selectedElement, selectedSectionId]
  );

  const bindField = useCallback(
    (fieldName: string) => {
      if (!definition) return;
      const sectionId =
        selectedSectionId ?? definition.sections.find((section) => section.visible !== false)?.id;
      if (!sectionId) return;
      const bound = bindClassicField(
        definition,
        fieldName,
        sectionId,
        selectedElementId,
        selectedCellKey
      );
      if (!bound.element) return;
      commitDefinition(bound.definition);
      setSelectedElementId(bound.element.id);
      setSelectedSectionId(bound.element.sectionId);
    },
    [commitDefinition, definition, selectedCellKey, selectedElementId, selectedSectionId]
  );

  const deleteSelectedElement = useCallback(() => {
    if (!definition || !selectedElementId) return;
    commitDefinition(removeClassicElement(definition, selectedElementId));
    setSelectedElementId(null);
    setSelectedCellKey(null);
    setSelectedCellKeys([]);
  }, [commitDefinition, definition, selectedElementId]);

  const duplicateSelectedElement = useCallback(() => {
    if (!definition || !selectedElementId) return;
    const duplicated = duplicateClassicElement(definition, selectedElementId);
    if (!duplicated.element) return;
    commitDefinition(duplicated.definition);
    setSelectedElementId(duplicated.element.id);
    setSelectedSectionId(duplicated.element.sectionId);
    if (duplicated.element.designerType === 'table' || duplicated.element.type === 'table') {
      setSelectedCellKey('0_0');
      setSelectedCellKeys(['0_0']);
    } else {
      setSelectedCellKey(null);
      setSelectedCellKeys([]);
    }
  }, [commitDefinition, definition, selectedElementId]);

  const save = useCallback(
    async (publish: boolean) => {
      if (!definition || !activeReportId) return false;
      setActivity(publish ? 'publishing' : 'saving');
      setMessage('');
      try {
        const result = await saveDesignerReport(activeReportId, definition, publish);
        setDefinition((current) =>
          current
            ? {
                ...current,
                layoutVersion: result.layoutVersion ?? current.layoutVersion,
                ntis: {
                  ...(current.ntis ?? { dataSourceCode: 'UNASSIGNED' }),
                  ...(result.templateId ? { templateId: result.templateId } : {}),
                  ...(result.versionId ? { versionId: result.versionId } : {}),
                  ...(result.status ? { status: result.status } : {}),
                },
              }
            : current
        );
        setIsDirty(false);
        setActivity('idle');
        setMessage(publish ? messages.reportPublished : messages.draftSaved);
        return true;
      } catch {
        setActivity('error');
        setMessage(messages.saveFailed);
        return false;
      }
    },
    [activeReportId, definition, messages.draftSaved, messages.reportPublished, messages.saveFailed]
  );

  const saveReportSettings = useCallback(
    async (settings: DesignerReportSettings) => {
      if (!definition || !activeReportId) return false;
      setActivity('saving');
      setMessage('');

      try {
        const existingTemplateId = definition.ntis?.templateId || settings.templateId || 0;
        let nextDefinition = applyDesignerReportSettings(definition, settings);
        let persistedSettings = settings;
        let result: Awaited<ReturnType<typeof saveDesignerReport>>;

        if (existingTemplateId) {
          persistedSettings = await updateDesignerReportSettings(existingTemplateId, {
            ...settings,
            templateId: existingTemplateId,
          });
          nextDefinition = applyDesignerReportSettings(nextDefinition, persistedSettings);
          result = await saveDesignerReport(activeReportId, nextDefinition, false);
        } else {
          result = await saveDesignerReport(activeReportId, nextDefinition, false);
          persistedSettings = {
            ...settings,
            templateId: result.templateId ?? settings.templateId,
            reportDefinitionId: result.reportDefinitionId ?? settings.reportDefinitionId,
          };
          nextDefinition = applyDesignerReportSettings(nextDefinition, persistedSettings);
        }

        nextDefinition = {
          ...nextDefinition,
          layoutVersion: result.layoutVersion ?? nextDefinition.layoutVersion,
          ntis: {
            ...(nextDefinition.ntis ?? { dataSourceCode: 'UNASSIGNED' }),
            ...(result.templateId ? { templateId: result.templateId } : {}),
            ...(result.reportDefinitionId ? { reportDefinitionId: result.reportDefinitionId } : {}),
            ...(result.versionId ? { versionId: result.versionId } : {}),
            ...(result.status ? { status: result.status } : {}),
          },
        };

        setDefinition(nextDefinition);
        setReports((current) =>
          current.map((report) =>
            (report.reportCode || report.id) === activeReportId
              ? {
                  ...report,
                  name: persistedSettings.reportName,
                  dataProviderCode: persistedSettings.dataProviderCode,
                  tenantScoped: persistedSettings.tenantScope === 'CurrentTenant',
                  templateId: result.templateId ?? report.templateId,
                }
              : report
          )
        );
        setIsDirty(false);
        setPast([]);
        setFuture([]);
        setActivity('idle');
        setMessage(messages.settingsSaved);
        return true;
      } catch {
        setActivity('error');
        setMessage(messages.settingsSaveFailed);
        return false;
      }
    },
    [activeReportId, definition, messages.settingsSaveFailed, messages.settingsSaved]
  );

  const toggleGrid = useCallback(() => {
    setShowGrid((current) => !current);
  }, []);

  const updatePageSetup = useCallback(
    (options: PageSetupOptions) => {
      if (!definition) return;
      commitDefinition(updateClassicPageSetup(definition, options));
    },
    [commitDefinition, definition]
  );

  const createReport = useCallback(
    (name: string, code: string, paperSize?: string, orientation?: 'portrait' | 'landscape') => {
      const base = createBlankClassicReportDefinition(code, name);
      const configured = updateClassicPageSetup(base, {
        paperSize: paperSize || 'A4',
        orientation: orientation || 'portrait',
      });
      setReports((current) => {
        const existingIndex = current.findIndex((r) => (r.reportCode || r.id) === code);
        const newItem: DesignerReportListItem = {
          id: code,
          reportCode: code,
          name,
          category: 'Property Tax',
          dataProviderCode: 'UnassignedReportDataProvider',
          tenantScoped: true,
          paperSize: paperSize || 'A4',
          orientation: orientation || 'portrait',
          templateId: null,
          canDelete: true,
        };
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = newItem;
          return next;
        }
        return [newItem, ...current];
      });
      setActiveReportId(code);
      setDefinition(configured);
      setSelectedElementId(null);
      setSelectedCellKey(null);
      setSelectedCellKeys([]);
      setSelectedSectionId(
        configured.sections.find((section) => section.visible !== false)?.id ?? null
      );
      setIsDirty(true);
      setPast([]);
      setFuture([]);
      setActivity('idle');
      setMessage('');
    },
    []
  );

  const importReport = useCallback(
    async (importedDefinition: ClassicReportDefinition) => {
      const reportId = importedDefinition.reportCode || importedDefinition.reportId;
      if (!reportId) return false;
      setActivity('saving');
      setMessage('');
      try {
        const result = await saveDesignerReport(reportId, importedDefinition, false);
        const persistedDefinition: ClassicReportDefinition = {
          ...importedDefinition,
          layoutVersion: result.layoutVersion ?? importedDefinition.layoutVersion,
          ntis: {
            ...(importedDefinition.ntis ?? { dataSourceCode: 'UNASSIGNED' }),
            ...(result.templateId ? { templateId: result.templateId } : {}),
            ...(result.reportDefinitionId ? { reportDefinitionId: result.reportDefinitionId } : {}),
            ...(result.versionId ? { versionId: result.versionId } : {}),
            ...(result.status ? { status: result.status } : {}),
          },
        };
        const item: DesignerReportListItem = {
          id: reportId,
          reportCode: reportId,
          name: persistedDefinition.reportName,
          category: persistedDefinition.ntis?.moduleName || 'Property Tax',
          dataProviderCode:
            persistedDefinition.ntis?.dataProviderCode || 'UnassignedReportDataProvider',
          tenantScoped: persistedDefinition.ntis?.tenantScope !== 'Global',
          paperSize: persistedDefinition.paperSize,
          orientation: persistedDefinition.orientation,
          templateId: result.templateId ?? persistedDefinition.ntis?.templateId ?? null,
          canDelete: true,
        };
        setReports((current) => {
          const index = current.findIndex(
            (report) => (report.reportCode || report.id) === reportId
          );
          if (index < 0) return [item, ...current];
          const next = [...current];
          next[index] = item;
          return next;
        });
        setActiveReportId(reportId);
        setDefinition(persistedDefinition);
        setSelectedElementId(null);
        setSelectedCellKey(null);
        setSelectedCellKeys([]);
        setSelectedSectionId(
          persistedDefinition.sections.find((section) => section.visible !== false)?.id ?? null
        );
        setPast([]);
        setFuture([]);
        setIsDirty(false);
        setActivity('idle');
        setMessage(messages.importSaved);
        return true;
      } catch {
        setActivity('error');
        setMessage(messages.importSaveFailed);
        return false;
      }
    },
    [messages.importSaveFailed, messages.importSaved]
  );

  const preview = useCallback(() => {
    if (!definition) return;
    openReportPreview(definition);
  }, [definition]);

  return {
    reports,
    activeReportId,
    definition,
    selectedElement,
    selectedSection,
    selectedElementId,
    selectedSectionId,
    selectedCellKey,
    selectedCellKeys,
    activity,
    message,
    isDirty,
    selectReport,
    selectElement,
    selectCell,
    selectSection,
    updateSelectedElement,
    updateSelectedElementStyles,
    updateSelectedSection,
    updateElement,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    addElement,
    addSection,
    deleteSection,
    bindField,
    deleteSelectedElement,
    duplicateSelectedElement,
    reload: () => {
      setActivity('loading');
      setMessage('');
      setReloadToken((value) => value + 1);
    },
    save,
    showGrid,
    toggleGrid,
    updatePageSetup,
    createReport,
    importReport,
    saveReportSettings,
    preview,
  };
}
