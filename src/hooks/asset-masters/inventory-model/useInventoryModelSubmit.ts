import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveInventoryModelAction } from "@/app/[locale]/assets/configuration/master-data/inventory-model/actions";
import type { InventoryModelFormModel } from "@/types/asset-masters/inventory-model.types";

interface UseInventoryModelSubmitProps {
  isEdit: boolean;
  locale: string;
  formData: InventoryModelFormModel;
  validate: (data: InventoryModelFormModel) => Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setOpen: (open: boolean) => void;
  t: (key: string) => string;
}

export function useInventoryModelSubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setOpen,
  t,
}: UseInventoryModelSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      group: true,
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
      fd.append("name", formData.name);
      fd.append("group", formData.group || "");
      fd.append("description", formData.description);
      fd.append("isActive", String(formData.isActive));
      fd.append("locale", locale);

      const res = await saveInventoryModelAction(isEdit ? String(formData.id) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("messages.updateSuccess")
            : t("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/inventory-model`);
        router.refresh();
        return;
      }

      if (res && !res.ok) {
        if (res.error === "duplicate") {
          setErrors({
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
