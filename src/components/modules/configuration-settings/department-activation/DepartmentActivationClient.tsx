'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/common/ActionButton';
import { SearchInput } from '@/components/common/SearchInput';
import type { DepartmentActivationProps } from '@/types/departmentActivation.types';
import { DepartmentCard } from './DepartmentCard';
import { SubmoduleConfigDialog } from './SubmoduleConfigDialog';
import { DepartmentActivationStatsCards } from './DepartmentActivationStatsCards';
import { useDepartmentActivation } from '@/hooks/configuration-settings/department-activation/useDepartmentActivation';

export function DepartmentActivationClient({ initialDepartments, initialModules, initialSearchTerm = '' }: DepartmentActivationProps) {
  const {
    searchTerm,
    setSearchTerm,
    isPending,
    selectedDepartment,
    isSubmoduleDialogOpen,
    localModules,
    toggleDepartment,
    handleToggleAll,
    toggleModule,
    setSubmoduleDialogOpen,
    filteredDepartments,
    optimisticDepartments,
    t,
  } = useDepartmentActivation({ initialDepartments, initialModules, initialSearchTerm });

  return (
    <div className="space-y-4">
        <DepartmentActivationStatsCards departments={optimisticDepartments} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t('searchPlaceholder')}
                className="w-full md:w-72"
            />
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-xl">
                <Button variant="success" size="sm" icon={Check} onClick={() => handleToggleAll(true)} disabled={isPending}>{t('quickActions.activateAll')}</Button>
                <Button variant="danger" size="sm" icon={X} onClick={() => handleToggleAll(false)} disabled={isPending}>{t('quickActions.deactivateAll')}</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept) => (
              <DepartmentCard
                key={dept.departmentId}
                department={dept}
                onToggle={toggleDepartment}
                onConfigure={(dept) => setSubmoduleDialogOpen(true, dept)}
                configureButtonText={t('card.configureSubmodules')}
              />
            ))}
        </div>

      <SubmoduleConfigDialog
        isOpen={isSubmoduleDialogOpen}
        onOpenChange={(open) => setSubmoduleDialogOpen(open, selectedDepartment!)}
        department={selectedDepartment}
        modules={localModules}
        onToggleModule={toggleModule}
      />
    </div>
  );
}
