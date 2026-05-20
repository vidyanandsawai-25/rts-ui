'use client';

import { UserForm } from '@/components/modules/configuration-settings/user-management/components/UserForm';
import { useUserForm } from '@/hooks/configuration-settings/user-management/useUserForm';
import { useRouter } from 'next/navigation';
import { User, Role, Department, MasterModule } from '@/types/user-management';

interface UserFormWrapperProps {
  initialData?: User;
  isEdit?: boolean;
  roles: Role[];
  departments: Department[];
  modules: MasterModule[];
}

export function UserFormWrapper({
  initialData,
  isEdit,
  roles,
  departments,
  modules,
}: UserFormWrapperProps) {
  const router = useRouter();
  const {
    formData,
    setFormData,
    handleSubmit,
    currentTab,
    setCurrentTab,
    isSubmitting,
    // New props from refactored hook
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    currentIndex,
    toggleDepartment,
    toggleModule,
    toggleRole,
    selectAllModules,
    deselectAllModules,
    errors,
  } = useUserForm(() => {
    router.back();
    router.refresh();
  }, initialData);

  return (
    <UserForm
      isOpen={true}
      onClose={() => router.back()}
      editingUser={isEdit ? initialData || null : null}
      formData={formData}
      setFormData={setFormData}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      handleSubmit={handleSubmit}
      roles={roles}
      departments={departments}
      modules={modules}
      isSubmitting={isSubmitting}
      // Pass the new logic props
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      currentIndex={currentIndex}
      toggleDepartment={toggleDepartment}
      toggleModule={toggleModule}
      toggleRole={toggleRole}
      selectAllModules={selectAllModules}
      deselectAllModules={deselectAllModules}
      errors={errors}
    />
  );
}
