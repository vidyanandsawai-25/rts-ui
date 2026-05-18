import { UploadButton } from '@/components/common';

interface PropertyFormActionsProps {
    t: (key: string) => string;
    isUpdating: boolean;
    hasChanges: boolean;
    canSubmit?: boolean;
}

export const PropertyFormActions = ({
    t,
    isUpdating,
    hasChanges,
    canSubmit = true,
}: PropertyFormActionsProps) => {
    return (
        <div className="flex justify-end space-x-2 mt-4">
            <UploadButton
                label={isUpdating ? t('footer.saving') : t('common.UpdateChanges')}
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating || !hasChanges || !canSubmit}
            />
        </div>
    );
};
