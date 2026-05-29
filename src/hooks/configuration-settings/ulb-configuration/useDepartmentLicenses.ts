'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getAllDepartmentsAction } from '@/app/[locale]/configuration-settings/ulb-configuration/actions';
import { parseDurationFromApi } from '@/lib/api/configuration-settings/ulb-configuration/department-licence.mapper';
import { calculateLicenseEndDate, calculateRenewalAlerts } from '@/lib/utils/ulb-configuration.utils';
import { resolveUlbConfigurationErrorMessage } from '@/lib/utils/ulb-configuration-error';
import { useDepartmentLicencesSave } from '@/hooks/configuration-settings/ulb-configuration/useDepartmentLicencesSave';
import type {
  Department,
  DepartmentLicense,
  DepartmentLicenceDetails,
  UlbMasterLicenseSnapshot,
} from '@/types/ulbconfig-master.types';

function toDepartmentLicense(
  dept: Department,
  licences: DepartmentLicenceDetails[]
): DepartmentLicense {
  const deptId = dept.departmentId ?? dept.departmentMasterId;
  const existing = licences.find(
    (l) => Number(l.departmentId ?? l.departmentMasterId) === Number(deptId)
  );
  const enabled = existing ? !!(existing.isActive ?? existing.isEnabled) : false;
  const endDate = existing?.licenceEndDate ? existing.licenceEndDate.split('T')[0] : '';

  return {
    id: dept.departmentCode || String(deptId ?? '') || dept.departmentName.toLowerCase().replace(/\s+/g, '-'),
    departmentMasterId: deptId,
    departmentLicenceDetailsId: existing?.departmentLicenceDetailsId,
    name: dept.departmentName,
    enabled,
    startDate: existing?.licenceStartDate ? existing.licenceStartDate.split('T')[0] : '',
    duration: existing?.licenceDuration ? parseDurationFromApi(existing.licenceDuration) : '',
    endDate,
    status: (existing?.status as DepartmentLicense['status']) || (enabled ? 'active' : 'inactive'),
    renewalAlerts: endDate ? calculateRenewalAlerts(endDate) : [],
  };
}

function buildInitial(
  depts: Department[],
  licences: DepartmentLicenceDetails[]
): DepartmentLicense[] {
  if (!Array.isArray(depts) || depts.length === 0) return [];
  return depts.map((dept) =>
    toDepartmentLicense(dept, Array.isArray(licences) ? licences : [])
  );
}

export function useDepartmentLicenses(
  initialDepts: Department[],
  initialLicences: DepartmentLicenceDetails[]
) {
  const t = useTranslations('ulb_configuration');
  const [departments, setDepartments] = useState<DepartmentLicense[]>(() =>
    buildInitial(initialDepts, initialLicences)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const isLoadingDepartmentsRef = useRef(false);
  const { saveLicences, isSavingLicences } = useDepartmentLicencesSave({
    departments,
    setDepartments,
  });

  const mergeWithPreviousState = useCallback(
    (next: DepartmentLicense[], prev: DepartmentLicense[]) =>
      next.map((dept) => {
        const existing = prev.find((item) => item.id === dept.id);
        if (!existing) return dept;
        return {
          ...dept,
          enabled: existing.enabled,
          startDate: existing.enabled ? existing.startDate : dept.startDate,
          duration: existing.enabled ? existing.duration : dept.duration,
          endDate: existing.enabled ? existing.endDate : dept.endDate,
          status: existing.enabled ? existing.status : dept.status,
          renewalAlerts: existing.enabled ? existing.renewalAlerts : dept.renewalAlerts,
          departmentLicenceDetailsId:
            dept.departmentLicenceDetailsId ?? existing.departmentLicenceDetailsId,
        };
      }),
    []
  );

  /** Syncs department cards from SSR props after router.refresh() — no API calls. */
  const syncFromServer = useCallback(
    (depts: Department[], licences: DepartmentLicenceDetails[]) => {
      setDepartments((prev) => {
        const next = buildInitial(depts, licences);
        if (prev.length === 0) return next;
        return mergeWithPreviousState(next, prev);
      });
    },
    [mergeWithPreviousState]
  );

  const toggle = useCallback((id: string, enabled: boolean) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id !== id
          ? d
          : {
              ...d,
              enabled,
              status: enabled ? 'active' : 'inactive',
              renewalAlerts: enabled ? d.renewalAlerts : [],
            }
      )
    );
  }, []);

  const updateDate = useCallback(
    (id: string, field: 'startDate' | 'duration' | 'endDate', value: string) => {
      setDepartments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const next = { ...d, [field]: value };

          if (field === 'endDate') {
            if (next.endDate) {
              next.renewalAlerts = calculateRenewalAlerts(next.endDate);
              const end = new Date(next.endDate);
              next.status = end < new Date() ? 'expired' : 'active';
            } else {
              next.renewalAlerts = [];
            }
            return next;
          }

          if (next.startDate && next.duration) {
            next.endDate = calculateLicenseEndDate(next.startDate, next.duration);
            next.renewalAlerts = calculateRenewalAlerts(next.endDate);
            const end = new Date(next.endDate);
            next.status = end < new Date() ? 'expired' : 'active';
          }

          return next;
        })
      );
    },
    []
  );

  const enableAll = useCallback(
    (master: UlbMasterLicenseSnapshot) => {
      if (!master.startDate?.trim() || !master.duration?.trim()) {
        toast.error(t('messages.masterDatesRequired'));
        return;
      }
      const endDate =
        master.endDate?.trim() || calculateLicenseEndDate(master.startDate, master.duration);
      setDepartments((prev) =>
        prev.map((d) => ({
          ...d,
          enabled: true,
          status: 'active' as const,
          startDate: master.startDate,
          duration: master.duration,
          endDate,
          renewalAlerts: calculateRenewalAlerts(endDate),
        }))
      );
      toast.success(t('messages.enableAllSuccess'));
    },
    [t]
  );

  const disableAll = useCallback(() => {
    setDepartments((prev) =>
      prev.map((d) => ({
        ...d,
        enabled: false,
        status: 'inactive' as const,
        renewalAlerts: [],
      }))
    );
    toast.success(t('messages.disableAllSuccess'));
  }, [t]);

  /** Loads department cards from Department Master API (no static fallback). */
  const loadDepartmentsFromApi = useCallback(
    async (licences: DepartmentLicenceDetails[]) => {
      if (isLoadingDepartmentsRef.current) return;

      isLoadingDepartmentsRef.current = true;
      setIsLoadingDepartments(true);

      try {
        const response = await getAllDepartmentsAction();
        if (!response.success || !response.data?.length) {
          setDepartments([]);
          if (!response.success) {
            toast.error(
              resolveUlbConfigurationErrorMessage(response.error, t, t('messages.loadError'))
            );
          }
          return;
        }

        setDepartments((prev) => {
          const next = buildInitial(response.data!, licences);
          if (prev.length === 0) return next;
          return mergeWithPreviousState(next, prev);
        });
      } catch (error) {
        setDepartments([]);
        toast.error(
          resolveUlbConfigurationErrorMessage(
            error instanceof Error ? error.message : String(error),
            t,
            t('messages.loadError')
          )
        );
      } finally {
        isLoadingDepartmentsRef.current = false;
        setIsLoadingDepartments(false);
      }
    },
    [mergeWithPreviousState, t]
  );

  const applyMaster = useCallback(
    (master: UlbMasterLicenseSnapshot) => {
      if (!master.startDate || !master.duration) {
        toast.error(t('messages.masterDatesRequired'));
        return;
      }
      const endDate =
        master.endDate?.trim() || calculateLicenseEndDate(master.startDate, master.duration);
      setDepartments((prev) =>
        prev.map((d) =>
          !d.enabled
            ? d
            : {
                ...d,
                startDate: master.startDate,
                duration: master.duration,
                endDate,
                renewalAlerts: calculateRenewalAlerts(endDate),
                status: 'active' as const,
              }
        )
      );
      toast.success(t('messages.masterApplied'));
    },
    [t]
  );

  const filtered = useMemo(
    () => departments.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [departments, searchQuery]
  );

  const activeCount = useMemo(() => departments.filter((d) => d.enabled).length, [departments]);

  return {
    departments,
    filtered,
    activeCount,
    searchQuery,
    setSearchQuery,
    toggle,
    updateDate,
    enableAll,
    disableAll,
    applyMaster,
    syncFromServer,
    loadDepartmentsFromApi,
    saveLicences,
    isSavingLicences,
    isLoadingDepartments,
  };
}

export type UseDepartmentLicenses = ReturnType<typeof useDepartmentLicenses>;
