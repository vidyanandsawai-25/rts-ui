import { AddButton } from '@/components/common';

interface PropertyFormActionsProps {
    t: (key: string) => string;
    isUpdating: boolean;
    hasChanges: boolean;
}

export const PropertyFormActions = ({
    t,
    isUpdating,
    hasChanges,
}: PropertyFormActionsProps) => {
    return (
        <div className="flex justify-end space-x-2 mt-4">
            <AddButton
                label={isUpdating ? t('footer.saving') : t('common.saveChanges')}
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating || !hasChanges}
            />
        </div>
    );
};
