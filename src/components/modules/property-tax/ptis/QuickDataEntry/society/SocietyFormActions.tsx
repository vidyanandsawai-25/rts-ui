import { AddButton } from "@/components/common";

interface SocietyFormActionsProps {
    t: (key: string) => string;
    isUpdating: boolean;
    hasChanges: boolean;
    canSubmit?: boolean;
}

export const SocietyFormActions = ({ t, isUpdating, hasChanges }: SocietyFormActionsProps) => {
    return (
        <div className="flex justify-end space-x-2 mt-4">
            <AddButton
                label={isUpdating ? t('footer.saving') : t('common.UpdateChanges')}
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating || !hasChanges}
            />
        </div>
    );
};
