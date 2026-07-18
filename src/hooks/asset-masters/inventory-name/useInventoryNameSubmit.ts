import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInventoryNameAction, updateInventoryNameAction } from "@/app/[locale]/assets/configuration/master-data/inventory-name/actions";
import type { InventoryNameFormModel } from "@/types/asset-masters/inventory-name.types";

interface UseInventoryNameSubmitProps {
  isEdit: boolean;
  locale: string;
  formData: InventoryNameFormModel;
  validate: (data: InventoryNameFormModel) => Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setOpen: (open: boolean) => void;
  tCommon: (key: string) => string;
}

export function useInventoryNameSubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setOpen,
  tCommon,
}: UseInventoryNameSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      inventoryItemCategoryId: true,
      subTypeCode: true,
      subTypeName: true,
      description: true,
    });

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(tCommon("errors.validationError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = isEdit 
        ? await updateInventoryNameAction(formData) 
        : await createInventoryNameAction(formData);

      if (res?.success) {
        toast.success(
          isEdit
            ? tCommon("messages.updateSuccess")
            : tCommon("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/inventory-name`);
        router.refresh();
        return;
      } else {
        toast.error((res as { error?: string }).error || tCommon("errors.generic"));
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message ?? tCommon("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
