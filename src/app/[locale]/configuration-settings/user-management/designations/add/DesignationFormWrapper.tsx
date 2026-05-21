'use client';

import { DesignationForm } from '@/components/modules/configuration-settings/user-management/components/DesignationForm';
import { useDesignationForm } from '@/hooks/configuration-settings/user-management/useDesignationForm';
import { useRouter } from 'next/navigation';
import { Designation } from '@/types/user-management';

interface DesignationFormWrapperProps {
  initialData?: Designation;
  isEdit?: boolean;
}

export function DesignationFormWrapper({ initialData, isEdit }: DesignationFormWrapperProps) {
  const router = useRouter();
  const { designationFormData, setDesignationFormData, handleDesignationSubmit, isSubmitting, errors } =
    useDesignationForm(() => {
      router.back();
      router.refresh();
    }, initialData);

  return (
    <DesignationForm
      isOpen={true}
      onClose={() => router.back()}
      editingDesignation={isEdit ? initialData || null : null}
      formData={designationFormData}
      setFormData={setDesignationFormData}
      onSubmit={handleDesignationSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
    />
  );
}
