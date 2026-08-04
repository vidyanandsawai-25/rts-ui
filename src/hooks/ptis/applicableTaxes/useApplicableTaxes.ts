'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import { useConfirm } from '@/components/common';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getColumns } from '@/components/modules/property-tax/ptis/applicable-taxes/applicableTaxesColumns';
import { updateTaxApplicabilityAction } from '@/app/[locale]/property-tax/ptis/applicable-taxes/action';
import type { ApplicableTaxesProps } from '@/types/applicable-taxes.types';

export function useApplicableTaxes({
  asseYearsResponse,
  useGroupsResponse,
  valuationTab,
  taxApplicabilityPagedResponse,
}: Omit<ApplicableTaxesProps, 'valuationTab'> & {
  valuationTab: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const t = useTranslations('applicableTaxes');
  const { confirm } = useConfirm();
  const locale = (params.locale as string) || 'en';

  const wardNo = searchParams.get('wardNo') || '';
  const propertyNo = searchParams.get('propertyNo') || '';
  const partitionNo = searchParams.get('partitionNo') || '';
  const isValuationTab = !!valuationTab;

  const dynamicAsseYears = useMemo(() => {
    return (asseYearsResponse?.items || []).filter((item) => item.isActive);
  }, [asseYearsResponse]);

  const dynamicUseGroups = useMemo(() => {
    return (useGroupsResponse?.items || []).filter((item) => item.isActive);
  }, [useGroupsResponse]);

  const asseYearOptions = useMemo(() => {
    return dynamicAsseYears
      .map((item) => ({
        label: `${item.fromYear}-${item.toYear}`,
        value: String(item.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [dynamicAsseYears]);

  const useTypeOptions = useMemo(() => {
    return dynamicUseGroups.map((group) => ({
      label: `${group.typeOfUseCode} - ${group.description}`,
      value: String(group.id),
    }));
  }, [dynamicUseGroups]);

  const currentYear = new Date().getFullYear();
  const defaultAsseYearItem = useMemo(() => {
    return dynamicAsseYears.find(y => currentYear >= y.fromYear && currentYear <= y.toYear) || dynamicAsseYears[0];
  }, [dynamicAsseYears, currentYear]);

  const selectedAsseYear = searchParams.get('asseYear') || (defaultAsseYearItem ? String(defaultAsseYearItem.id) : '');
  const selectedFloorUse = searchParams.get('floorUse') || '';
  const searchQuery = searchParams.get('search') || '';

  const items = useMemo(() => taxApplicabilityPagedResponse?.items || [], [taxApplicabilityPagedResponse]);


  const pageNumber = taxApplicabilityPagedResponse?.pageNumber || 1;
  const pageSize = taxApplicabilityPagedResponse?.pageSize || 10;
  const totalPages = taxApplicabilityPagedResponse?.totalPages || 1;
  const totalCount = taxApplicabilityPagedResponse?.totalCount || 0;

  const handleToggleStatus = useCallback((id: number, newStatus: boolean, taxHeadName: string) => {
    confirm({
      variant: 'update',
      title: t('title'),
      description: newStatus ? t('confirmActive') : t('confirmInactive'),
      meta: { name: taxHeadName },
      onConfirm: async () => {
        const propertyIdVal = Number(searchParams.get('propertyId') || '0');

        if (isNaN(propertyIdVal) || propertyIdVal <= 0) {
          toast.error(t('errors.missingRequiredPropertyId'));
          return;
        }

        try {
          const res = await updateTaxApplicabilityAction(locale, {
            propertyId: propertyIdVal,
            taxes: [
              {
                taxId: id,
                isApplicable: newStatus,
              }
            ],
            userId: 0,
          });

          if (res.success) {
            toast.success(t('success.updateTaxApplicability', { name: taxHeadName }));
            router.refresh();
          } else {
            toast.error(res.error || t('errors.updateTaxApplicability'));
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t('errors.unexpectedError'));
        }
      }
    });
  }, [confirm, searchParams, router, locale, t]);

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    router.push(`/${locale}/property-tax/ptis?${newParams.toString()}`);
  };

  const handleParamChange = useCallback((key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, val);
    if (key !== 'pageNumber') {
      newParams.set('pageNumber', '1');
    }
    if (!newParams.has('asseYear') && selectedAsseYear) {
      newParams.set('asseYear', selectedAsseYear);
    }
    if (!newParams.has('floorUse') && selectedFloorUse) {
      newParams.set('floorUse', selectedFloorUse);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  }, [searchParams, pathname, router, selectedAsseYear, selectedFloorUse]);

  const setPageNumber = useCallback((page: number) => {
    handleParamChange('pageNumber', String(page));
  }, [handleParamChange]);

  const filteredTaxes = useMemo(() => {
    const rawTaxes = [
      ...(items[0]?.applicableTaxes || []),
      ...(items[0]?.exemptedTaxes || [])
    ];
    return rawTaxes.filter(item => {
      if (!item.isActive) return false;
      const matchesSearch = item.taxHead.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [items, searchQuery]);

  const paginatedData = useMemo(() => {
    return filteredTaxes;
  }, [filteredTaxes]);

  const columns = useMemo(() => getColumns(t, handleToggleStatus), [t, handleToggleStatus]);

  return {
    wardNo,
    propertyNo,
    partitionNo,
    isValuationTab,
    asseYearOptions,
    useTypeOptions,
    selectedAsseYear,
    selectedFloorUse,
    pageNumber,
    pageSize,
    totalPages,
    totalCount,

    setPageNumber,
    paginatedData,
    filteredTaxes,
    columns,
    handleClose,
    handleParamChange,
    t,
  };
}
