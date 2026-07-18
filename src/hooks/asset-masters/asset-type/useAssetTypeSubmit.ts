import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAssetTypeAction } from "@/app/[locale]/assets/configuration/master-data/asset-type/actions";
import type { AssetTypeFormModel } from "@/types/asset-masters/asset-type.types";

interface UseAssetTypeSubmitProps {
  isEdit: boolean;
  locale: string;
  formData: AssetTypeFormModel;
  validate: (data: AssetTypeFormModel) => Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setOpen: (open: boolean) => void;
  t: (key: string) => string;
}

export function useAssetTypeSubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setOpen,
  t,
}: UseAssetTypeSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      code: true,
      name: true,
      group: true,
      description: true,
      registrationType: true,
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
      fd.append("group", formData.group || "");
      fd.append("description", formData.description || "");
      fd.append("allowUnitRegistration", String(formData.allowUnitRegistration));
      fd.append("allowRoomRegistration", String(formData.allowRoomRegistration));
      fd.append("isActive", String(formData.isActive));
      fd.append("locale", locale);

      const res = await saveAssetTypeAction(isEdit ? String(formData.id) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("messages.updateSuccess")
            : t("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/asset-type`);
        router.refresh();
        return;
      }

      if (res && !res.ok) {
        if (res.error === "duplicate") {
          setErrors({
            code: t("validation.duplicateRecord"),
            name: t("validation.duplicateRecord"),
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
