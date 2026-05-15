'use client';

import { useState, useTransition, useEffect, useRef, useOptimistic } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { updateDepartmentStatusAction, updateModuleStatusAction } from '@/app/[locale]/configuration-settings/department-activation/action';
import type { Department, Module } from '@/types/departmentActivation.types';
import { useTranslations } from 'next-intl';

interface UseDepartmentActivationProps {
  initialDepartments: Department[];
  initialModules: Module[];
  initialSearchTerm: string;
}

export function useDepartmentActivation({
  initialDepartments,
  initialModules,
  initialSearchTerm,
}: UseDepartmentActivationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('departmentActivation');

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const departmentIdParam = searchParams.get('departmentId');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
    departmentIdParam 
      ? initialDepartments.find(d => d.departmentId.toString() === departmentIdParam) || null
      : null
  );
  const isSubmoduleDialogOpen = !!selectedDepartment;

  const [optimisticDepartments, addOptimisticDepartmentUpdate] = useOptimistic<
      Department[], 
      { id: number; isActive: boolean } | { ids: number[]; isActive: boolean }
    >(
      initialDepartments,
      (state, update) => {
        if ('ids' in update) {
          return state.map(dept => 
            update.ids.includes(dept.departmentId) ? { ...dept, isActive: update.isActive } : dept
          );
        } else if ('id' in update) {
          return state.map(dept => 
            dept.departmentId === update.id ? { ...dept, isActive: update.isActive } : dept
          );
        }
        return state;
      }
    );

  const [localModules, setLocalModules] = useState<Module[]>(initialModules);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalModules(initialModules);
  }, [initialModules]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchTerm !== initialSearchTerm) {
      searchTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');
        
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
      }, 500);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm, initialSearchTerm, pathname, router, searchParams]);

  const toggleDepartment = (id: number, currentDepartment: Department) => {
    const newIsActive = !currentDepartment.isActive;
    startTransition(() => {
      void (async () => {
        addOptimisticDepartmentUpdate({ id, isActive: newIsActive });
        const formData = new FormData();
        formData.append('departmentId', String(id));
        formData.append('departmentCode', currentDepartment.departmentCode);
        formData.append('departmentName', currentDepartment.departmentName);
        formData.append('departmentNameLocal', currentDepartment.departmentNameLocal || '');
        formData.append('departmentIcon', currentDepartment.departmentIcon || '');
        formData.append('departmentDescription', currentDepartment.departmentDescription || '');
        formData.append('isActive', String(newIsActive));

        const result = await updateDepartmentStatusAction(formData);
        if (result.success) {
          toast.success(`${currentDepartment.departmentName} ${t(`messages.${newIsActive ? 'activated' : 'deactivated'}`)}`);
        } else {
          // Rollback on failure
          addOptimisticDepartmentUpdate({ id, isActive: !newIsActive });
          toast.error(result.error || t("messages.departmentUpdateError"));
        }
      })();
    });
  };

  const filteredDepartments = optimisticDepartments.filter(dept =>
    dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAll = (activate: boolean) => {
    const targets = filteredDepartments.filter(d => d.isActive !== activate);
    if (targets.length === 0) return;
    
    startTransition(() => {
      void (async () => {
        addOptimisticDepartmentUpdate({ ids: targets.map(d => d.departmentId), isActive: activate });
        
        const updatePromises = targets.map(dept => {
          const formData = new FormData();
          formData.append('departmentId', String(dept.departmentId));
          formData.append('departmentCode', dept.departmentCode);
          formData.append('departmentName', dept.departmentName);
          formData.append('departmentNameLocal', dept.departmentNameLocal || '');
          formData.append('departmentIcon', dept.departmentIcon || '');
          formData.append('departmentDescription', dept.departmentDescription || '');
          formData.append('isActive', String(activate));
          return updateDepartmentStatusAction(formData);
        });

        const results = await Promise.all(updatePromises);
        const failCount = results.filter(r => !r.success).length;
        const successCount = results.length - failCount;

        if (failCount > 0) {
          toast.warning(t('messages.bulkUpdateResult', { successCount, failCount }));
        } else {
          toast.success(activate ? t('messages.activateAllSuccess') : t('messages.deactivateAllSuccess'));
        }
        router.refresh();
      })();
    });
  };

  const toggleModule = (module: Module) => {
    if (!selectedDepartment) return;
    const newIsActive = !module.isActive;
    
    setLocalModules(prev =>
        prev.map(m => m.moduleId === module.moduleId ? { ...m, isActive: newIsActive } : m)
    );

    startTransition(() => {
        void (async () => {
            const formData = new FormData();
            formData.append('moduleId', String(module.moduleId));
            formData.append('departmentId', String(selectedDepartment.departmentId));
            formData.append('moduleCode', module.moduleCode);
            formData.append('moduleName', module.moduleName);
            formData.append('moduleNameLocal', module.moduleNameLocal || '');
            formData.append('moduleIcon', module.moduleIcon || '');
            formData.append('moduleLabel', module.moduleLabel || '');
            formData.append('moduleDescription', module.moduleDescription || '');
            formData.append('isActive', String(newIsActive));

            const result = await updateModuleStatusAction(formData);
            if (result.success) {
                toast.success(`${module.moduleName} ${t('messages.moduleUpdateSuccess')}`);
            } else {
                setLocalModules(prev =>
                    prev.map(m => m.moduleId === module.moduleId ? { ...m, isActive: module.isActive } : m)
                );
                toast.error(result.error || t("messages.moduleUpdateFailed"));
            }
        })();
    });
  };

  const setSubmoduleDialogOpen = (open: boolean, dept?: Department) => {
    setSelectedDepartment(open && dept ? dept : null);
    const params = new URLSearchParams(searchParams.toString());
    if (open && dept) params.set('departmentId', dept.departmentId.toString());
    else params.delete('departmentId');
    startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
  };


  return {
    searchTerm,
    setSearchTerm,
    isPending,
    selectedDepartment,
    isSubmoduleDialogOpen,
    optimisticDepartments,
    localModules,
    toggleDepartment,
    handleToggleAll,
    toggleModule,
    setSubmoduleDialogOpen,
    filteredDepartments,
    t,
  };
}
