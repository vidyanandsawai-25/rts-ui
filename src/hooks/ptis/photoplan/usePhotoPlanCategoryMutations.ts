'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createPropertyPhotoTypeAction } from '@/app/[locale]/property-tax/ptis/PhotoPlanType.action';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';

export interface UsePhotoPlanCategoryMutationsProps {
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
}

export function usePhotoPlanCategoryMutations({
  categories,
  onCategoriesChange,
}: UsePhotoPlanCategoryMutationsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateCategorySlot = useCallback(async (name: string, displayOrder?: number, description?: string) => {
    if (isUploading) return false;
    setIsUploading(true);
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_' + Date.now();
    try {
      const res = await createPropertyPhotoTypeAction(code, name, displayOrder, description);
      if (res.success && res.data) {
        const newCat: PhotoCategory = {
          photoTypeId: res.data.id,
          photoTypeCode: code,
          photoTypeName: name,
          images: [],
          isCustom: true,
        };
        onCategoriesChange([...categories, newCat]);
        toast.success('Category slot created successfully');
        return true;
      } else {
        toast.error(res.error || 'Failed to create category slot');
        return false;
      }
    } catch {
      toast.error('An unexpected error occurred.');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [categories, onCategoriesChange, isUploading]);

  return {
    isUploading,
    handleCreateCategorySlot,
  };
}
