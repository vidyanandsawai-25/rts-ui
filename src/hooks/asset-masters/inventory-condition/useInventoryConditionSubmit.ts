import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInventoryConditionAction, updateInventoryConditionAction } from "@/app/[locale]/assets/configuration/master-data/inventory-condition/actions";
import type { InventoryConditionFormModel } from "@/types/asset-masters/inventory-condition.types";
import { mapInventoryConditionApiError } from "./validation";

interface UseInventoryConditionSubmitProps {
  isEdit: boolean;
  locale: string;
  formData: InventoryConditionFormModel;
  validate: (data: InventoryConditionFormModel) => Partial<Record<keyof InventoryConditionFormModel, string>>;
  setErrors: (errors: Partial<Record<keyof InventoryConditionFormModel, string>>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setSubmittedOnce?: (submitted: boolean) => void;
  setOpen: (open: boolean) => void;
  tCommon: (key: string) => string;
}

export function useInventoryConditionSubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setSubmittedOnce,
  setOpen,
  tCommon,
}: UseInventoryConditionSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (setSubmittedOnce) setSubmittedOnce(true);

    setTouched({
      conditionType: true,
      inventoryItemCategoryId: true,
      conditionName: true,
      conditionFactor: true,
      description: true,
    });

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(tCommon("errors.validationError") || "errors.validationError");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = isEdit 
        ? await updateInventoryConditionAction(formData) 
        : await createInventoryConditionAction(formData);

      if (res?.success) {
        toast.success(
          isEdit
            ? tCommon("messages.updateSuccess")
            : tCommon("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/inventory-condition`);
        router.refresh();
        return;
      } else {
        toast.error(mapInventoryConditionApiError(res, (k) => k, tCommon));
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message ?? tCommon("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}

