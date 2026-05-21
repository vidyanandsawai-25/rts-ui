import { describe, it, expect } from 'vitest';
import { validateBankMaster } from '@/lib/api/configuration-settings/bank/bank-master.validator';
import type { BankMasterFormData } from '@/types/bank-master.types';

describe('validateBankMaster - Pincode Validation', () => {
  const baseValidData: BankMasterFormData = {
    bankCode: 'SBI001',
    bankName: 'State Bank of India',
    branchName: 'Main Branch',
    ifscCode: 'SBIN0000001',
    address: 'Amravati Road',
    city: 'Amravati',
    state: 'Maharashtra',
    pincode: '444600',
    isActive: true,
  };

  it('should accept a valid 6-digit Indian pincode starting with a non-zero digit', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '444600',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBeUndefined();
  });

  it('should reject a pincode of all zeros (000000)', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '000000',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBe('pincodeFormat');
  });

  it('should reject a pincode starting with zero (e.g. 012345)', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '012345',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBe('pincodeFormat');
  });

  it('should reject a pincode with fewer than 6 digits', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '44460',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBe('pincodeFormat');
  });

  it('should reject a pincode with more than 6 digits', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '4446001',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBe('pincodeFormat');
  });

  it('should reject a pincode containing non-numeric characters', () => {
    const data: BankMasterFormData = {
      ...baseValidData,
      pincode: '44460a',
    };
    const errors = validateBankMaster(data);
    expect(errors.pincode).toBe('pincodeFormat');
  });
});
