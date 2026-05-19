import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { UseSubType } from '@/types/typeOfUse.types';
import { createSubType, updateSubType } from '@/app/[locale]/property-tax/typeofusemaster/actions';

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

type FieldErrors = {
  typeId?: string;
  description?: string;
  searchSequence?: string;
};

interface UseSubTypeFormSubmitProps {
  formData: UseSubType;
  isEdit: boolean;
  t: TranslatorFunction;
  setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function useSubTypeFormSubmit({
  formData,
  isEdit,
  t,
  setErrors,
  setTouched,
}: UseSubTypeFormSubmitProps) {
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateSubType({
          id: Number(formData.subTypeOfUseId),
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? 'Active' : 'Inactive',
        });
        toast.success(t('messages.subTypeUpdated'));
      } else {
        await createSubType({
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? 'Active' : 'Inactive',
        });
        toast.success(t('messages.subTypeCreated'));
      }

      router.back();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '';

      if (
        errorMsg.includes('409') ||
        errorMsg.toLowerCase().includes('duplicate') ||
        errorMsg.includes('same details already')
      ) {
        setErrors((prev) => ({
          ...prev,
          description: t('messages.duplicateSubTypeName'),
        }));
        setTouched((prev) => ({ ...prev, description: true }));
      } else {
        // Check if it's an i18n key or raw message
        const displayMessage = errorMsg.startsWith('messages.') 
          ? t(errorMsg) 
          : errorMsg || t('messages.saveFailed');
        toast.error(displayMessage);
      }
    }
  };

  return { handleSubmit };
}
