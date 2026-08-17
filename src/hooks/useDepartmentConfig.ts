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

  const defaultValStr = defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '';

  // Store initial state for comparison (normalize null to empty array)
  const initialState = useMemo(() => JSON.stringify(initialData ?? []), [initialData]);

  // Check if any changes were made
  const isDirty = useMemo(() => {
    const currentState = JSON.stringify(departments);
    return currentState !== initialState;
  }, [departments, initialState]);

  const toggleDeptExpansion = (deptId: number) => {
    setExpandedDepts((prev) =>
      prev.includes(deptId) ? [] : [deptId]
    );
  };

  const handleToggleDept = (deptId: number) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { 
        ...d, 
        isEnabled: !d.isEnabled,
      } : d))
    );
  };

  const handleToggleSubmodule = (deptId: number, subId: number) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              submodules: d.submodules.map((s) => {
                if (s.id !== subId) return s;
                const nextEnabled = !s.isEnabled;
                return {
                  ...s,
                  isEnabled: nextEnabled,
                  value: nextEnabled
                    ? (s.value ? s.value : defaultValStr)
                    : (s.configValueId > 0 ? s.value : ''),
                };
              }),
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
                value: enabled
                  ? (s.value ? s.value : defaultValStr)
                  : (s.configValueId > 0 ? s.value : ''),
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

        // Map initialData for quick lookup
        const initialMap = new Map<string, { isEnabled: boolean; value: string }>();
        if (initialData) {
          initialData.forEach((dept) => {
            initialMap.set(`${dept.id}_0`, { isEnabled: dept.isEnabled, value: dept.value || '' });
            dept.submodules.forEach((sub) => {
              initialMap.set(`${dept.id}_${sub.id}`, { isEnabled: sub.isEnabled, value: sub.value || '' });
            });
          });
        }

        const updates: UpdatePayload[] = [];
        departments.forEach((dept) => {
          const hasSubmodules = dept.submodules.length > 0;
          
          if (!hasSubmodules) {
            const initialDept = initialMap.get(`${dept.id}_0`);
            // If disabled and no existing configValueId, don't save
            if (!dept.isEnabled && (!dept.configValueId || dept.configValueId === 0)) {
              // Skip saving untoggled department with no existing record
            } else {
              const hasDeptChanged = !initialDept || 
                                    initialDept.isEnabled !== dept.isEnabled || 
                                    initialDept.value !== (dept.value || '');
              
              if (hasDeptChanged) {
                updates.push({
                  departmentId: dept.id,
                  moduleId: 0,
                  isEnabled: dept.isEnabled,
                  value: dept.isEnabled ? (dept.value || '') : '',
                  configValueId: dept.configValueId,
                });
              }
            }
          } else if (dept.configValueId > 0) {
            // Clean up/deactivate existing department-level record since the department has submodules
            updates.push({
              departmentId: dept.id,
              moduleId: 0,
              isEnabled: false,
              value: '',
              configValueId: dept.configValueId,
            });
          }

          dept.submodules.forEach((sub) => {
            const initialSub = initialMap.get(`${dept.id}_${sub.id}`);
            const isSubEnabled = dept.isEnabled ? sub.isEnabled : false;
            
            // If submodule is disabled and has no existing database record, don't save it!
            if (!isSubEnabled && (!sub.configValueId || sub.configValueId === 0)) {
              return;
            }

            const hasSubChanged = !initialSub || 
                                  initialSub.isEnabled !== isSubEnabled || 
                                  initialSub.value !== (sub.value || '');
            
            if (hasSubChanged) {
              updates.push({
                departmentId: dept.id,
                moduleId: sub.id,
                isEnabled: isSubEnabled,
                value: isSubEnabled ? (sub.value || '') : '',
                configValueId: sub.configValueId,
              });
            }
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
