"use client"

import { AddButton, Button, ClearButton } from "@/components/common";
import { FloorFormActionsProps } from "@/types/OldDetails/property-old-floor-info.types";
import { Plus } from "lucide-react";

/**
 * FloorFormActions Component
 * Renders action buttons (Add/Update/Reset) for floor information form
 * Button state changes based on edit mode and form state
 */
export function FloorFormActions({
    t,
    isEditMode,
    isSubmitting,
    isChanged,
    onSave,
    onReset
}: FloorFormActionsProps) {
    return (
        <div className="flex justify-end gap-5">
            {!isEditMode ? (
                <Button
                    onClick={onSave}
                    disabled={isSubmitting}
                    icon={Plus}
                    className="h-11 w-40 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {t('oldDetails.button.add')}
                </Button>
            ) : (
                <>
                    <AddButton
                        label={isSubmitting ? t('footer.saving') : t('commonbuttonmessages.UpdateChanges')}
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !isChanged}
                    />

                    <ClearButton
                     label={t('commonbuttonmessages.clear')}
                        onClick={onReset}
                        className="h-11 w-40 border border-blue-100 text-blue-600 bg-blue-600 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
                    >
                    </ClearButton>
                </>
            )}
        </div>
    );
}
