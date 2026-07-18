import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveInventoryCategoryAction } from "@/app/[locale]/assets/configuration/master-data/inventory-category/actions";
import type { InventoryCategoryFormModel } from "@/types/asset-masters/inventory-category.types";

interface UseInventoryCategorySubmitProps {
  isEdit: boolean;
  locale: string;
  formData: InventoryCategoryFormModel;
  validate: (data: InventoryCategoryFormModel) => Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setOpen: (open: boolean) => void;
  t: (key: string) => string;
}

export function useInventoryCategorySubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setOpen,
  t,
}: UseInventoryCategorySubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      code: true,
      name: true,
      depreciationRate: true,
      description: true,
    });

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(t("validation.fixErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("code", formData.code);
      fd.append("name", formData.name);
      fd.append("depreciationRate", formData.depreciationRate || "");
      fd.append("description", formData.description);
      fd.append("isActive", String(formData.isActive));
      fd.append("locale", locale);

      const res = await saveInventoryCategoryAction(isEdit ? String(formData.id) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("messages.updateSuccess")
            : t("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/inventory-category`);
        router.refresh();
        return;
      }

      if (res && !res.ok) {
        if (res.error === "duplicate") {
          setErrors({
            code: t("errors.duplicateRecord"),
            name: t("errors.duplicateRecord"),
          });
          toast.error(t("validation.duplicateError"));
        } else if (res.error === "invalid_id") {
          toast.error(t("messages.invalidIdError"));
        } else {
          toast.error(res.error || t("messages.error"));
        }
        return;
      }

      toast.error(t("messages.error"));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message ?? t("messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
