'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type {
  RetrospectiveRule,
  RetrospectiveRuleStats,
  RetrospectiveRuleFilterState,
  CreateRetrospectiveRuleInput,
  RetrospectiveRuleMasterDetail,
  EvidenceItemCode,
  RuleStatus,
} from '@/types/retrospective-rule.types';
import { filterRetrospectiveRules, exportRulesToJson } from '@/lib/utils/retrospective-rule.utils';
import { validateRetrospectiveRuleForm } from '@/lib/validations/retrospective-rule.validator';
import { INITIAL_RETROSPECTIVE_RULES, INITIAL_RETROSPECTIVE_STATS } from '@/lib/api/configuration-settings/retrospective-rule-library/retrospective-rule.service';
import {
  getRuleDetailAction,
  saveRetrospectiveRuleAction,
} from '@/app/[locale]/configuration-settings/retrospective-rule-library/action';

interface UseRetrospectiveRulesOptions {
  initialRules?: RetrospectiveRule[];
  initialStats?: RetrospectiveRuleStats;
}

export function useRetrospectiveRules({
  initialRules = INITIAL_RETROSPECTIVE_RULES,
  initialStats = INITIAL_RETROSPECTIVE_STATS,
}: UseRetrospectiveRulesOptions = {}) {
  const [rules, setRules] = useState<RetrospectiveRule[]>(initialRules);
  const [stats, setStats] = useState<RetrospectiveRuleStats>(initialStats);

  // View state: 'library' or 'builder'
  const [viewMode, setViewMode] = useState<'library' | 'builder'>('library');

  const [filterState, setFilterState] = useState<RetrospectiveRuleFilterState>({
    searchQuery: '',
    statusFilter: 'All statuses',
    evidenceFilter: 'All evidence',
    corporationFilter: 'All Corporations',
  });

  const [selectedRule, setSelectedRule] = useState<RetrospectiveRule | null>(null);
  const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');

  // Filtered rules computed with useMemo
  const filteredRules = useMemo(() => {
    return filterRetrospectiveRules(rules, filterState);
  }, [rules, filterState]);

  // Handle Search Input Change
  const handleSearchChange = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle Status Filter Change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterState((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  // Handle Evidence Filter Change
  const handleEvidenceFilterChange = useCallback((evidence: string) => {
    setFilterState((prev) => ({ ...prev, evidenceFilter: evidence }));
  }, []);

  // Handle Corporation Filter Change
  const handleCorporationFilterChange = useCallback((corp: string) => {
    setFilterState((prev) => ({ ...prev, corporationFilter: corp }));
  }, []);

  // Open Create Rule Builder
  const openCreateRuleBuilder = useCallback(() => {
    setSelectedRule(null);
    setBuilderMode('create');
    setViewMode('builder');
  }, []);

  // Open Edit Rule Builder with dynamic detail fetching
  const openEditRuleBuilder = useCallback(async (rule: RetrospectiveRule) => {
    // Set basic rule immediately to avoid latency lag
    setSelectedRule(rule);
    setBuilderMode('edit');
    setViewMode('builder');

    try {
      const res = await getRuleDetailAction(rule.id);
      if (res.success && res.data) {
        const detail: RetrospectiveRuleMasterDetail = res.data;
        const availableEvidence: EvidenceItemCode[] = (detail.evidenceConditions || [])
          .filter((e) => String(e.selectedState).toUpperCase() === 'AVAILABLE')
          .map((e) => e.evidenceCode as EvidenceItemCode);

        const unavailableEvidence: EvidenceItemCode[] = (detail.evidenceConditions || [])
          .filter((e) => String(e.selectedState).toUpperCase() === 'UNAVAILABLE')
          .map((e) => e.evidenceCode as EvidenceItemCode);

        const isAuthorized =
          detail.rule?.authorizationStatus === 'AUTHORIZED' ||
          availableEvidence.includes('OC') ||
          availableEvidence.includes('CC');

        const fullRule: RetrospectiveRule = {
          ...rule,
          id: String(detail.rule?.id || rule.id),
          ruleCode: detail.rule?.ruleCode || rule.ruleCode,
          ruleTitle: detail.rule?.ruleName || rule.ruleTitle,
          conditionDescription: detail.rule?.ruleDescription || rule.conditionDescription,
          evidenceCategory: isAuthorized ? 'Authorized: OC or CC available' : 'Unauthorized: OC & CC unavailable',
          startLogicTitle: detail.summary?.taxSummary || rule.startLogicTitle,
          startLogicBoundary: detail.rule?.effectiveFrom ? `Boundary: ${detail.rule.effectiveFrom.slice(0, 10)}` : rule.startLogicBoundary,
          status: (detail.rule?.ruleStatus as RuleStatus) || rule.status,
          availableEvidence,
          unavailableEvidence,
          compareEvidenceDates: detail.dateCondition?.comparatorCode ?? '',
          taxStartsFrom: detail.action?.taxStartMode ?? '',
          retrospectiveLimit: detail.action?.retrospectiveLimitType ?? '',
          maximumYears: detail.action?.maximumYears ?? detail.dateCondition?.compareYears ?? detail.rule?.legalCapYears ?? '',
          taxCalculation: detail.action?.taxCalculationMode ?? '',
          taxMultiplier: detail.action?.taxMultiplier ?? detail.action?.splitMultiplier ?? '',
        };

        setSelectedRule(fullRule);
      }
    } catch (err) {
      console.error('Failed to fetch rule detail for edit mode', err);
    }
  }, []);

  // Back to Rule Library
  const backToLibrary = useCallback(() => {
    setViewMode('library');
    setSelectedRule(null);
  }, []);

  const tVal = useTranslations('retrospectiveRuleLibrary.validation');

  // Save/Publish Rule from Builder
  const handlePublishRule = useCallback(
    async (input: CreateRetrospectiveRuleInput) => {
      const validation = validateRetrospectiveRuleForm(input, tVal);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // Helper: Map evidence code strings to numeric evidenceTypeIds
      const mapEvidenceToId = (code: string): number => {
        const normalized = code.toUpperCase().replace(/\s+/g, '_');
        switch (normalized) {
          case 'OC':
            return 1;
          case 'CC':
            return 2;
          case 'ELECTRICITY':
            return 3;
          case 'CHANGE_DETECTION':
            return 4;
          case 'CONSTRUCTION_YEAR':
            return 5;
          default:
            return 1;
        }
      };

      const availableIds = (input.availableEvidence || []).map(mapEvidenceToId);
      const unavailableIds = (input.unavailableEvidence || []).map(mapEvidenceToId);
      const isAuth = availableIds.includes(1) || availableIds.includes(2);

      // Mapping helpers to ensure exact backend option enum codes
      const mapTaxStartMode = (val?: string | null): string => {
        if (!val) return 'MAX_LOOK_BACK_DATE';
        const clean = val.trim();
        const upper = clean.toUpperCase().replace(/[-\s]+/g, '_');
        if (upper.includes('MAX') || upper.includes('LOOK_BACK')) return 'MAX_LOOK_BACK_DATE';
        if (upper.includes('FY_START') || upper.includes('1_APRIL') || upper.includes('APRIL')) return 'FY_START';
        if (upper.includes('NEXT_FINANCIAL') || upper.includes('NEXT_FY')) return 'NEXT_FINANCIAL_YEAR';
        if (upper.includes('MONTHS_AFTER') || upper.includes('AFTER_SPECIFIED_MONTHS')) return 'MONTHS_AFTER';
        if (upper.includes('FIXED') || upper.includes('CUTOFF')) return 'FIXED_CUTOFF';
        if (upper.includes('CONSTRUCTION_OR_CAP') || upper.includes('LATER_OF_CONSTRUCTION')) return 'CONSTRUCTION_OR_CAP';
        if (upper.includes('CONSTRUCTION')) return 'CONSTRUCTION_YEAR';
        if (upper.includes('EVIDENCE') || upper.includes('OC') || upper.includes('CC')) return 'EVIDENCE_DATE';
        return clean;
      };

      const mapRetrospectiveLimitType = (val?: string | null): string => {
        if (!val) return 'MAXIMUM_YEARS';
        const clean = val.trim();
        const upper = clean.toUpperCase().replace(/[-\s]+/g, '_');
        if (upper.includes('MAX') || upper.includes('YEAR')) return 'MAXIMUM_YEARS';
        if (upper.includes('FIXED') || upper.includes('CUTOFF') || upper.includes('EARLIEST')) return 'FIXED_CUTOFF_DATE';
        if (upper.includes('NONE') || upper.includes('NO_LIMIT') || upper.includes('NO_ADDITIONAL')) return 'NONE';
        return clean;
      };

      const mapTaxCalculationMode = (val?: string | null): string => {
        if (!val) return 'SINGLE';
        const clean = val.trim();
        const upper = clean.toUpperCase().replace(/[-\s]+/g, '_');
        if (upper.includes('SPLIT') || upper.includes('DIFFERENT') || upper.includes('DYNAMIC') || upper.includes('YEARLY')) return 'SPLIT';
        if (upper.includes('SINGLE') || upper.includes('ONE_MULTIPLIER') || upper.includes('ENTIRE')) return 'SINGLE';
        return clean;
      };

      const mapComparatorCode = (val?: string | null): string => {
        if (!val) return 'NONE';
        const clean = val.trim();
        if (clean.toLowerCase() === 'select' || clean.toLowerCase() === 'select...') return 'NONE';
        const upper = clean.toUpperCase().replace(/[-\s]+/g, '_');
        if (upper.includes('OLDER')) return 'OC_OLDER_THAN_ALLOWED_PERIOD';
        if (upper.includes('WITHIN')) return 'OC_WITHIN_ALLOWED_PERIOD';
        if (upper.includes('ELECTRICITY_BEFORE_CC') || (upper.includes('ELECTRICITY') && upper.includes('BEFORE') && upper.includes('CC'))) return 'ELECTRICITY_BEFORE_CC';
        if (upper.includes('ELECTRICITY_AFTER_CC') || (upper.includes('ELECTRICITY') && upper.includes('AFTER') && upper.includes('CC'))) return 'ELECTRICITY_AFTER_CC';
        if (upper.includes('ELECTRICITY_BEFORE_CUTOFF') || (upper.includes('ELECTRICITY') && upper.includes('BEFORE') && upper.includes('CUTOFF'))) return 'ELECTRICITY_BEFORE_CUTOFF';
        if (upper.includes('ELECTRICITY_AFTER_CUTOFF') || (upper.includes('ELECTRICITY') && upper.includes('AFTER') && upper.includes('CUTOFF'))) return 'ELECTRICITY_AFTER_CUTOFF';
        if (upper.includes('NONE') || upper.includes('NO_DATE')) return 'NONE';
        return clean;
      };

      const parsedRuleId = selectedRule?.id ? parseInt(String(selectedRule.id), 10) : NaN;
      const ruleId = Number.isFinite(parsedRuleId) && parsedRuleId > 0 ? parsedRuleId : null;
      const maxYearsNum =
        input.maximumYears !== undefined && input.maximumYears !== ''
          ? Number(input.maximumYears)
          : 6;
      const multiplierNum =
        input.taxMultiplier !== undefined && input.taxMultiplier !== ''
          ? Number(input.taxMultiplier)
          : 1.0;

      const payload = {
        id: ruleId,
        ruleCode: input.ruleCode || `RULE-${Date.now().toString().slice(-4)}`,
        ruleName: input.ruleTitle,
        ruleDescription: input.conditionDescription || input.ruleTitle,
        priorityNo: 1,
        isFallbackRule: false,
        legalCapEnabled: maxYearsNum !== null,
        legalCapYears: maxYearsNum,
        noticeDays: 0,
        versionNo: '1.0',
        resolutionRef: null,
        effectiveFrom: new Date().toISOString(),
        effectiveTo: null,
        remarks: null,
        availableEvidenceTypeIds: availableIds,
        unavailableEvidenceTypeIds: unavailableIds,
        dateCondition: {
          comparatorCode: mapComparatorCode(input.compareEvidenceDates),
          leftEvidenceTypeId: availableIds[0] || null,
          rightEvidenceTypeId: unavailableIds[0] || null,
          compareOperator: null,
          compareDate: null,
          compareDateTo: null,
          compareYears: maxYearsNum,
        },
        action: {
          taxStartMode: mapTaxStartMode(input.taxStartsFrom),
          startEvidenceTypeId: availableIds[0] || null,
          offsetMonths: 0,
          retrospectiveLimitType: mapRetrospectiveLimitType(input.retrospectiveLimit),
          maximumYears: maxYearsNum,
          cutoffDate: null,
          taxCalculationMode: mapTaxCalculationMode(input.taxCalculation),
          taxMultiplier: multiplierNum,
          splitStartEvidenceTypeId: null,
          splitEndEvidenceTypeId: null,
          splitMultiplier: null,
          afterSplitMultiplier: null,
        },
        penaltyRule: {
          isPenaltyApplicable: !isAuth,
          penaltyMode: !isAuth ? 'ACT_PENALTY' : 'NONE',
          penaltyPercent: null,
          penaltyDateSourceType: null,
          penaltyDateEvidenceTypeId: null,
          penaltyDateCondition: null,
          compareDate: null,
          compareDateTo: null,
          elseAction: null,
          requiresManualReview: false,
          remarks: isAuth ? 'Not applicable — OC/CC available' : (input.unauthorizedPenalty || 'Apply penalty as per the Act'),
        },
      };

      try {
        const res = await saveRetrospectiveRuleAction(payload, 'en');
        if (!res.success) {
          return { success: false, errors: { submit: res.error || 'Failed to save rule' } };
        }
      } catch (err) {
        return {
          success: false,
          errors: { submit: err instanceof Error ? err.message : 'API call failed' },
        };
      }

      if (builderMode === 'create') {
        const newRule: RetrospectiveRule = {
          ...input,
          id: String(Date.now()),
        };
        setRules((prev) => [newRule, ...prev]);
        setStats((prev) => ({
          ...prev,
          importedRulesCount: prev.importedRulesCount + 1,
          readyActiveCount: input.status === 'Active' ? prev.readyActiveCount + 1 : prev.readyActiveCount,
        }));
      } else if (builderMode === 'edit' && selectedRule) {
        setRules((prev) =>
          prev.map((r) => (r.id === selectedRule.id ? { ...r, ...input } : r))
        );
      }

      return { success: true, errors: {} };
    },
    [builderMode, selectedRule, tVal]
  );

  // Trigger JSON Export
  const handleExportJson = useCallback(() => {
    exportRulesToJson(filteredRules);
  }, [filteredRules]);

  return {
    rules,
    stats,
    filteredRules,
    filterState,
    viewMode,
    builderMode,
    selectedRule,
    handleSearchChange,
    handleStatusFilterChange,
    handleEvidenceFilterChange,
    handleCorporationFilterChange,
    openCreateRuleBuilder,
    openEditRuleBuilder,
    backToLibrary,
    handlePublishRule,
    handleExportJson,
  };
}
