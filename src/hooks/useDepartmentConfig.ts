'use client';

import { useState, useTransition, useMemo } from 'react';
import { useToast } from '@/components/common';
import { useTranslations } from 'next-intl';
import { saveDepartmentConfigurationAction } from '@/app/[locale]/configuration-settings/config-master/actions';
import { DepartmentApiResponse } from '@/types/config-master/entities.types';

export function useDepartmentConfig(
  initialData: DepartmentApiResponse[] | null,
  configKeyId: number,
  onSuccess: () => void,
  defaultValue?: string | number | boolean
) {
  const t = useTranslations('configMaster');
  const { success: toastSuccess, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  // Initialize state from server data once - component will remount on navigation with new initialData
  const [departments, setDepartments] = useState<DepartmentApiResponse[]>(initialData || []);
  const [expandedDepts, setExpandedDepts] = useState<number[]>([]);

  // Store initial state for comparison (normalize null to empty array)
  const initialState = useMemo(() => JSON.stringify(initialData ?? []), [initialData]);

  // Check if any changes were made
  const isDirty = useMemo(() => {
    const currentState = JSON.stringify(departments);
    return currentState !== initialState;
  }, [departments, initialState]);

  const toggleDeptExpansion = (deptId: number) => {
    setExpandedDepts((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleToggleDept = (deptId: number) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { 
        ...d, 
        isEnabled: !d.isEnabled,
        // Set default value if enabling and currently empty
        value: (!d.isEnabled && !d.value) ? String(defaultValue ?? '') : d.value
      } : d))
    );
  };

  const handleToggleSubmodule = (deptId: number, subId: number) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              submodules: d.submodules.map((s) =>
                s.id === subId ? { 
                  ...s, 
                  isEnabled: !s.isEnabled,
                  // Set default value if enabling and currently empty
                  value: (!s.isEnabled && !s.value) ? String(defaultValue ?? '') : s.value
                } : s
              ),
            }
          : d
      )
    );
  };

  const toggleAllSubmodules = (deptId: number, enabled: boolean) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              submodules: d.submodules.map((s) => ({ 
                ...s, 
                isEnabled: enabled,
                // Set default value if enabling and currently empty
                value: (enabled && !s.value) ? String(defaultValue ?? '') : s.value
              })),
            }
          : d
      )
    );
  };

  const handleSubmoduleValueChange = (deptId: number, subId: number, value: string) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              submodules: d.submodules.map((s) => (s.id === subId ? { ...s, value } : s)),
            }
          : d
      )
    );
  };

  const handleSaveAll = async () => {
    // Prevent API call if no changes were made
    if (!isDirty) {
      onSuccess(); // Just close the modal
      return;
    }
    
    startTransition(async () => {
      try {
        interface UpdatePayload {
          departmentId: number;
          moduleId: number;
          isEnabled: boolean;
          value: string;
          configValueId: number;
        }
        const updates: UpdatePayload[] = [];
        departments.forEach((dept) => {
          updates.push({
            departmentId: dept.id,
            moduleId: 0,
            isEnabled: dept.isEnabled,
            value: dept.value || '',
            configValueId: dept.configValueId,
          });

          dept.submodules.forEach((sub) => {
            updates.push({
              departmentId: dept.id,
              moduleId: sub.id,
              isEnabled: sub.isEnabled,
              value: sub.value || '',
              configValueId: sub.configValueId,
            });
          });
        });

        const result = await saveDepartmentConfigurationAction({
          configKeyId,
          updates,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to save configuration');
        }

        toastSuccess(t('messages.configSaved') || 'Configuration saved successfully');
        onSuccess(); 
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        toastError(message);
      }
    });
  };

  return {
    departments,
    expandedDepts,
    isPending,
    isDirty,
    toggleDeptExpansion,
    handleToggleDept,
    handleToggleSubmodule,
    toggleAllSubmodules,
    handleSubmoduleValueChange,
    handleSaveAll,
  };
}
