import { validateForm } from './validation-helpers';
import type { UserFormData } from '@/types/user-management';

const NAME_REGEX = /^[a-zA-Z\u0900-\u097F\s]+$/;

export const userManagementValidations = {
  validateUser: (
    data: Partial<UserFormData>,
    t: (key: string) => string,
    _tCommon?: (key: string) => string,
    isEdit: boolean = false,
    existingUsers?: Array<{
      userName: string;
      email?: string;
      mobileNo?: string;
      address?: string;
      userCode?: string;
      id?: number | string;
      userId?: number | string;
    }>,
    excludeUserId?: number
  ) => {
    return validateForm(data, {
      userName: (val) => {
        if (!isEdit && !val) return t('form.errors.usernameRequired');
        if (val && String(val).length > 20) return t('form.errors.usernameTooLong');
        if (val && existingUsers) {
          const usernameVal = String(val).trim().toLowerCase();
          const isDuplicate = existingUsers.some(
            (u) =>
              u.userName.trim().toLowerCase() === usernameVal &&
              (excludeUserId === undefined ||
                (String(u.id) !== String(excludeUserId) && Number(u.userId) !== Number(excludeUserId)))
          );
          if (isDuplicate) return t('form.errors.duplicateUsername');
        }
        return undefined;
      },
      firstName: (val) => {
        if (!val) return t('form.errors.firstNameRequired');
        if (String(val).length > 40) return t('form.errors.firstNameTooLong');
        if (!NAME_REGEX.test(String(val))) return t('form.errors.firstNameInvalid');
        return undefined;
      },
      middleName: (val) => {
        if (val) {
          if (String(val).length > 40) return t('form.errors.middleNameTooLong');
          if (!NAME_REGEX.test(String(val))) return t('form.errors.middleNameInvalid');
        }
        return undefined;
      },
      lastName: (val) => {
        if (!val) return t('form.errors.lastNameRequired');
        if (String(val).length > 40) return t('form.errors.lastNameTooLong');
        if (!NAME_REGEX.test(String(val))) return t('form.errors.lastNameInvalid');
        return undefined;
      },
      email: (val) => {
        if (!val) return t('form.errors.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
          return t('form.errors.invalidEmail');
        }
        if (existingUsers) {
          const emailVal = String(val).trim().toLowerCase();
          const isDuplicate = existingUsers.some(
            (u) =>
              u.email &&
              u.email.trim().toLowerCase() === emailVal &&
              (excludeUserId === undefined ||
                (String(u.id) !== String(excludeUserId) && Number(u.userId) !== Number(excludeUserId)))
          );
          if (isDuplicate) return t('form.errors.duplicateEmail');
        }
        return undefined;
      },
      departmentIds: (val) =>
        !val || (val as string[]).length === 0 ? t('form.errors.departmentRequired') : undefined,
      roleAccess: (val) => {
        const ra = (val || {}) as Record<string, number[]>;
        const deptIds = data.departmentIds || [];
        const hasMissingRoles = deptIds.some((deptId) => !ra[deptId] || ra[deptId].length === 0);
        return hasMissingRoles ? t('form.errors.roleRequiredPerDept') : undefined;
      },
      mobileNo: (val) => {
        if (!val) return t('form.errors.mobileRequired');
        if (!/^\d{10}$/.test(String(val))) {
          return t('form.errors.invalidMobile');
        }
        if (existingUsers) {
          const mobileVal = String(val).trim().toLowerCase();
          const isDuplicate = existingUsers.some(
            (u) =>
              u.mobileNo &&
              u.mobileNo.trim().toLowerCase() === mobileVal &&
              (excludeUserId === undefined ||
                (String(u.id) !== String(excludeUserId) && Number(u.userId) !== Number(excludeUserId)))
          );
          if (isDuplicate) return t('form.errors.duplicateMobile');
        }
        return undefined;
      },
      address: (val) => {
        if (val && existingUsers) {
          const addressVal = String(val).trim().toLowerCase();
          if (addressVal) {
            const isDuplicate = existingUsers.some(
              (u) =>
                u.address &&
                u.address.trim().toLowerCase() === addressVal &&
                (excludeUserId === undefined ||
                  (String(u.id) !== String(excludeUserId) && Number(u.userId) !== Number(excludeUserId)))
            );
            if (isDuplicate) return t('form.errors.duplicateAddress');
          }
        }
        return undefined;
      },
      userCode: (val) => {
        if (val && String(val).length > 15) return t('form.errors.userCodeTooLong');
        if (val && existingUsers) {
          const codeVal = String(val).trim().toLowerCase();
          if (codeVal) {
            const isDuplicate = existingUsers.some(
              (u) =>
                u.userCode &&
                u.userCode.trim().toLowerCase() === codeVal &&
                (excludeUserId === undefined ||
                  (String(u.id) !== String(excludeUserId) && Number(u.userId) !== Number(excludeUserId)))
            );
            if (isDuplicate) return t('form.errors.duplicateUserCode');
          }
        }
        return undefined;
      },
    });
  },
  validateRole: (data: { name: string }, t: (key: string) => string) => {
    return validateForm(data, {
      name: (val) => {
        if (!val) return t('form.errors.roleNameRequired');
        if (String(val).length > 25) return t('form.errors.roleNameTooLong');
        if (!NAME_REGEX.test(String(val))) return t('form.errors.roleNameInvalid');
        return undefined;
      },
    });
  },
  validateDesignation: (data: { name: string; code: string; description?: string }, t: (key: string) => string) => {
    return validateForm(data, {
      name: (val) => {
        if (!val) return t('form.errors.designationNameRequired');
        if (String(val).length > 20) return t('form.errors.designationNameTooLong');
        if (!NAME_REGEX.test(String(val))) return t('form.errors.designationNameInvalid');
        return undefined;
      },
      code: (val) => {
        if (!val) return t('form.errors.designationCodeRequired');
        if (String(val).length > 10) return t('form.errors.designationCodeTooLong');
        if (!/^[a-zA-Z\u0900-\u097F0-9]+$/.test(String(val))) return t('form.errors.designationCodeInvalid');
        return undefined;
      },
      description: (val) => {
        if (val) {
          if (String(val).length > 50) return t('form.errors.designationDescriptionTooLong');
          if (!NAME_REGEX.test(String(val))) return t('form.errors.designationDescriptionInvalid');
        }
        return undefined;
      },
    });
  },
};
