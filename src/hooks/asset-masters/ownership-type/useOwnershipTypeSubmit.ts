import type React from "react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOwnershipTypeAction, updateOwnershipTypeAction } from "@/app/[locale]/assets/configuration/master-data/ownership-type/actions";
import type { OwnershipTypeFormModel } from "@/types/asset-masters/ownership-type.types";

interface UseOwnershipTypeSubmitProps {
  isEdit: boolean;
  locale: string;
  formData: OwnershipTypeFormModel;
  validate: (data: OwnershipTypeFormModel) => Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tCommon: (key: string) => string;
}

export function useOwnershipTypeSubmit({
  isEdit,
  locale,
  formData,
  validate,
  setErrors,
  setTouched,
  setOpen,
  tCommon,
}: UseOwnershipTypeSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      ownershipTypeName: true,
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
        ? await updateOwnershipTypeAction(formData)
        : await createOwnershipTypeAction(formData);

      if (res?.success) {
        toast.success(
          isEdit
            ? tCommon("messages.updateSuccess")
            : tCommon("messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/assets/configuration/master-data/ownership-type`);
        router.refresh();
        return;
      }

      if (res && !res.success) {
        const errorKey = (res as { error?: string }).error;
        const isTranslationKey = errorKey && /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(errorKey);
        toast.error(
          isTranslationKey ? tCommon(errorKey) : errorKey || tCommon("errors.generic")
        );
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message ?? tCommon("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
