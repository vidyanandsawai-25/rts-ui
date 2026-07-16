import { useCallback } from "react";
import { CODE_REGEX, TEXT_ALLOWED } from "@/lib/utils/validation-rules";
import { normalize, sanitizeCode, sanitizeText } from "@/lib/utils/sanitization";
import type { UseGroup } from "@/types/typeOfUse.types";

interface GroupFormState {
  code: string;
  name: string;
  icon: string;
  errors: {
    code?: string;
    name?: string;
  };
  isSaved: boolean;
  isSaving: boolean;
  selectedExistingGroupId?: string;
  isMappingExisting: boolean;
}

const isAllZeros = (str: string) => /^[0]+$/.test(str);

interface UseConfigureRatesValidationProps {
  existingGroups: UseGroup[];
  setGroupForms: React.Dispatch<React.SetStateAction<Record<number, GroupFormState>>>;
}

export function useConfigureRatesValidation({
  existingGroups,
  setGroupForms,
}: UseConfigureRatesValidationProps) {
  
  const handleFieldChange = useCallback((id: number, field: 'code' | 'name' | 'icon', val: string) => {
    setGroupForms(prev => {
      const form = prev[id];
      if (!form) return prev;

      let cleanedVal = val;
      if (field === 'code') {
        cleanedVal = sanitizeCode(val, 10);
      } else if (field === 'name') {
        cleanedVal = sanitizeText(val, 50);
      }

      const updatedForm = {
        ...form,
        [field === 'code' ? 'code' : field === 'name' ? 'name' : 'icon']: cleanedVal,
        isSaved: false
      };

      const errors: { code?: string; name?: string } = {};
      if (field === 'code' || form.code) {
        const codeVal = field === 'code' ? cleanedVal : form.code;
        const codeTrimmed = codeVal.trim();
        if (!codeTrimmed) {
          errors.code = "Group ID Code is required";
        } else if (isAllZeros(codeTrimmed)) {
          errors.code = "Group ID Code cannot be all zeros";
        } else if (codeTrimmed.length > 10) {
          errors.code = "Group ID Code cannot exceed 10 characters";
        } else if (!CODE_REGEX.test(codeTrimmed)) {
          errors.code = "Group ID Code must be alphanumeric only";
        } else {
          const normalized = normalize(codeTrimmed);
          const isDup = existingGroups.some(g => normalize(g.typeOfUseGroupCode || '') === normalized);
          if (isDup) {
            errors.code = "Group ID Code already exists";
          }
        }
      }

      if (field === 'name' || form.name) {
        const nameVal = field === 'name' ? cleanedVal : form.name;
        const nameTrimmed = nameVal.trim();
        if (!nameTrimmed) {
          errors.name = "Group Name is required";
        } else if (isAllZeros(nameTrimmed)) {
          errors.name = "Group Name cannot be all zeros";
        } else if (nameTrimmed.length > 50) {
          errors.name = "Group Name cannot exceed 50 characters";
        } else if (!TEXT_ALLOWED.test(nameTrimmed)) {
          errors.name = "Group Name contains invalid characters";
        } else {
          const normalized = normalize(nameTrimmed);
          const isDup = existingGroups.some(g => normalize(g.groupName || '') === normalized);
          if (isDup) {
            errors.name = "Group Name already exists";
          }
        }
      }

      updatedForm.errors = errors;
      return { ...prev, [id]: updatedForm };
    });
  }, [existingGroups, setGroupForms]);

  return {
    handleFieldChange,
  };
}
