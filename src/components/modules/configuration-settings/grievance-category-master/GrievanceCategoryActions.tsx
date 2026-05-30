'use client';

import { EditButton, DeleteButton } from '@/components/common/ActionButtons';
import type { GrievanceCategoryActionsProps } from '@/types/grievance-category-master/grievanceCategory.types';
import { usePermissions } from '@/hooks/usePermissions';

export function GrievanceCategoryActions({
  onEdit,
  onDelete,
  categoryId,
  isDeleting = false,
  isEditing = false,
}: GrievanceCategoryActionsProps) {
  const { canEdit, canDelete, haveFullAccess } = usePermissions('GRIEVANCE_CATEGORY_MASTER');

  return (
    <div className="flex items-center justify-end gap-1.5 md:gap-2">
      {(canEdit || haveFullAccess) && (
        <EditButton
          onClick={() => onEdit(categoryId)}
          disabled={isDeleting || isEditing}
          isLoading={isEditing}
          className="cursor-pointer"
          data-testid={`edit-button-${categoryId}`}
        />
      )}
      {(canDelete || haveFullAccess) && (
        <DeleteButton
          onClick={() => onDelete(categoryId)}
          disabled={isDeleting || isEditing}
          isLoading={isDeleting}
          className="cursor-pointer"
          data-testid={`delete-button-${categoryId}`}
        />
      )}
    </div>
  );
}
