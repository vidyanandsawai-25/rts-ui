'use client';

import React, { useCallback } from 'react';
import { BankMasterFormData } from '@/types/bank-master.types';
import {
  BankMasterErrors,
  validateBankMaster,
  normalizeBankData,
} from '@/lib/api/configuration-settings/bank/bank-master.validator';

interface UseBankFormHandlersProps {
  formData: BankMasterFormData;
  setFormData: React.Dispatch<React.SetStateAction<BankMasterFormData>>;
  setErrors: React.Dispatch<React.SetStateAction<BankMasterErrors>>;
}

export function useBankFormHandlers({
  formData,
  setFormData,
  setErrors,
}: UseBankFormHandlersProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const { name } = e.target;
      let { value } = e.target;

      if (name === 'bankCode' || name === 'ifscCode') {
        value = value.toUpperCase();
      }

      setFormData((p) => ({
        ...p,
        [name]: value,
      }));
    },
    [setFormData]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      const { name, value } = e.target;

      const updatedFormData = {
        ...formData,
        [name]: value,
      };

      const normalizedData = normalizeBankData(updatedFormData);

      setFormData(normalizedData);
      setErrors(validateBankMaster(normalizedData));
    },
    [formData, setFormData, setErrors]
  );

  const handleToggleStatus = useCallback((): void => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  }, [setFormData]);

  return {
    handleChange,
    handleBlur,
    handleToggleStatus,
  };
}
