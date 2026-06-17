'use client';

import { useMemo, useState, useCallback } from 'react';
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
  taxApplicabilityResponse,
}: Omit<ApplicableTaxesProps, 'applicableCount' | 'exemptedCount'>) {
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

  const isExempted = pathname.includes('/exempted');
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
      label: `${group.typeOfUseGroupCode} - ${group.groupName}`,
      value: String(group.id),
    }));
  }, [dynamicUseGroups]);

  const selectedAsseYear = searchParams.get('asseYear') || '';
  const selectedFloorUse = searchParams.get('floorUse') || '';
  const searchQuery = searchParams.get('search') || '';

  const [pageNumber, setPageNumber] = useState(1);

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

  const handleParamChange = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, val);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const filteredTaxes = useMemo(() => {
    const taxesList = taxApplicabilityResponse || [];
    return taxesList.filter(item => {
      const matchesSearch = item.taxHead.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = isExempted ? !item.isActive : item.isActive;
      return matchesSearch && matchesTab;
    });
  }, [taxApplicabilityResponse, searchQuery, isExempted]);

  const paginatedData = useMemo(() => {
    const startIndex = (pageNumber - 1) * 10;
    return filteredTaxes.slice(startIndex, startIndex + 10);
  }, [filteredTaxes, pageNumber]);

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
    setPageNumber,
    paginatedData,
    filteredTaxes,
    columns,
    handleClose,
    handleParamChange,
    t,
  };
}
