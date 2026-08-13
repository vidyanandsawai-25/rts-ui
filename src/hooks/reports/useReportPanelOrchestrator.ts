'use client';
import { useEffect } from 'react';
import type {
  ReportDefinition,
  ReportParameterDefinition,
  ReportParamsPanelCopy,
  ZoneSummary,
  WardSummary,
  PropertySummary,
} from '@/types/report.types';
import type { FinancialYear } from '@/types/financialYear.types';
import { useReportParameters } from '@/hooks/reports/useReportParameters';
import {
  buildCanonicalSmartLayoutParameters,
  prepareReportSubmissionParameters,
  useSmartLayoutSync,
} from '@/hooks/reports/useSmartLayoutSync';
import { usePaginatedProperties, useGenerateFromDrawer } from '@/hooks/reports/useReportDataHooks';
import { useReportOptionLists } from '@/hooks/reports/useReportOptionLists';
import { useSmartLayoutState } from '@/hooks/reports/useSmartLayoutState';

// ─── keys that the smart layout handles (excluded from extra-params loop) ─────
const HANDLED_PREFIXES = ['financial', 'year', 'fy', 'zone', 'ward', 'property', 'fromprop', 'toprop', 'partition', 'amount', 'propertydescription', 'propertytype', 'assessment', 'assessmenttype', 'assessmentstatus', 'top', 'lessthan', 'searchcat'];

function isHandled(key: string) {
  const lower = key.toLowerCase().replace(/[_\s]/g, '');
  return HANDLED_PREFIXES.some((p) => lower.startsWith(p) || lower.includes(p));
}

export interface ReportPanelOrchestratorProps {
  report: ReportDefinition | null;
  onQueued?: (reportRequestId: string) => void;
  copy: ReportParamsPanelCopy;
  zones?: ZoneSummary[];
  financialYears?: FinancialYear[];
  fetchWards?: (zoneId: number) => Promise<WardSummary[]>;
  fetchProperties?: (wardId: number) => Promise<PropertySummary[]>;
  fetchReportParameters?: (
    reportDefinitionId: number
  ) => Promise<{ data: ReportParameterDefinition[]; error: string | null }>;
  createReportRequest?: (
    reportCode: string,
    parameters: Record<string, string>
  ) => Promise<{ success: boolean; data?: { reportRequestId: string; status: string }; error?: string }>;
}

export function useReportPanelOrchestrator({
  report,
  onQueued,
  copy,
  zones = [],
  financialYears = [],
  fetchWards,
  fetchProperties,
  fetchReportParameters,
  createReportRequest,
}: ReportPanelOrchestratorProps) {
  const {
    parameters,
    loadingParameters,
    parametersError,
    paramValues,
    fieldErrors,
    isPending,
    submitStatus,
    errorMsg,
    handleParamChange,
    handleReset,
    handleSubmit: submitReport,
  } = useReportParameters({
    report,
    onQueued,
    copy,
    zones,
    financialYears,
    fetchWards,
    fetchProperties,
    fetchReportParameters,
    createReportRequest,
  });

  const { state, actions } = useSmartLayoutState(report?.id, handleReset);

  const {
    selectionMode, financialYear, zoneId, wardId, fromProperty, toProperty,
    propertyNo, partitionNo, ownerIdList, isPropertyDrawerOpen, selectedProperties,
    propSearchQuery, hasViewedProperties, amountOperator, amountValue,
    propertyDescription, assessmentStatus,
  } = state;

  const {
    setSelectionMode, setFinancialYear, setZoneId, setWardId, setFromProperty, setToProperty,
    setPropertyNo, setPartitionNo, setIsPropertyDrawerOpen, setSelectedProperties,
    setPropSearchQuery, setHasViewedProperties, setAmountOperator, setAmountValue,
    setPropertyDescription, setAssessmentStatus, handleResetAll,
  } = actions;

  const handleSubmit = (overrideParams?: Record<string, string>) => {
    const canonicalValues = buildCanonicalSmartLayoutParameters({
      financialYear, zoneId, wardId, fromProperty, toProperty, propertyNo, partitionNo,
      ownerIdList, selectedProperties, selectionMode, amountOperator, amountValue,
      propertyDescription, assessmentStatus,
    });

    const submissionParameters = prepareReportSubmissionParameters(
      report?.reportCode ?? '',
      selectionMode,
      {
        ...paramValues,
        ...canonicalValues,
        ...overrideParams,
      },
    );

    submitReport(submissionParameters);
  };

  const {
    paginatedProperties,
    hasMoreProperties,
    isFetchingProperties,
    isLoadingMoreProperties,
    loadMoreProperties,
  } = usePaginatedProperties(wardId, selectionMode);

  const {
    fyOptions,
    zoneOptions,
    wards,
    wardOptions,
    wardLoading,
    properties,
    propLoading,
    propertyTypeMap,
    propertyDescriptionOptions,
    assessmentStatusOptions,
  } = useReportOptionLists({
    financialYears,
    zones,
    zoneId,
    wardId,
    selectionMode,
    fetchWards,
    fetchProperties,
  });

  const handleGenerateFromDrawer = useGenerateFromDrawer({
    selectedProperties,
    report,
    createReportRequest,
    setIsPropertyDrawerOpen,
    paramValues,
    parameters,
    handleSubmit,
  });

  // Reset ward/property when zone changes; reset property when ward changes
  useEffect(() => {
    setWardId([]);
    setSelectedProperties([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  useEffect(() => {
    setSelectedProperties([]);
    setPropSearchQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId]);

  useSmartLayoutSync({
    financialYear, zoneId, wardId, fromProperty, toProperty, propertyNo, partitionNo,
    ownerIdList, selectedProperties, selectionMode, amountOperator, amountValue,
    propertyDescription, assessmentStatus, parameters, handleParamChange,
  });

  const extraParams = parameters.filter((p) => !isHandled(p.parameterKey));

  const paramFieldCopy = {
    selectPreviousFirst: copy.selectZoneFirst || 'Select previous first',
    loading: copy.loading || 'Loading...',
    select: copy.selectZone || 'Select',
  };

  return {
    report,
    copy,
    // param state
    parameters,
    loadingParameters,
    parametersError,
    paramValues,
    fieldErrors,
    isPending,
    submitStatus,
    errorMsg,
    handleParamChange,
    handleSubmit,
    // smart layout state
    selectionMode, financialYear, zoneId, wardId, fromProperty, toProperty,
    propertyNo, partitionNo, isPropertyDrawerOpen, selectedProperties,
    propSearchQuery, hasViewedProperties, amountOperator, amountValue,
    propertyDescription, assessmentStatus,
    // smart layout actions
    setSelectionMode, setFinancialYear, setZoneId, setWardId, setFromProperty, setToProperty,
    setPropertyNo, setPartitionNo, setIsPropertyDrawerOpen, setSelectedProperties,
    setPropSearchQuery, setHasViewedProperties, setAmountOperator, setAmountValue,
    setPropertyDescription, setAssessmentStatus, handleResetAll,
    // paginated properties
    paginatedProperties, hasMoreProperties, isFetchingProperties, isLoadingMoreProperties, loadMoreProperties,
    // option lists
    fyOptions, zoneOptions, wards, wardOptions, wardLoading, properties, propLoading,
    propertyTypeMap, propertyDescriptionOptions, assessmentStatusOptions,
    // derived
    handleGenerateFromDrawer,
    extraParams,
    paramFieldCopy,
    zones,
    financialYears,
    fetchWards,
  };
}
