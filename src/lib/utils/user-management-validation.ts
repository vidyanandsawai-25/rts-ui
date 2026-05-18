import { validateForm } from './validation-helpers';
import { commonValidations } from './validation-schemas';
import type { UserFormData } from '@/types/user-management';

export const userManagementValidations = {
  validateUser: (
    data: Partial<UserFormData>,
    t: (key: string) => string,
    tCommon?: (key: string) => string,
    isEdit: boolean = false
  ) => {
    return validateForm(data, {
      userName: (val) => (!isEdit && !val ? t('form.errors.usernameRequired') : undefined),
      firstName: (val) => (!val ? t('form.errors.firstNameRequired') : undefined),
      lastName: (val) => (!val ? t('form.errors.lastNameRequired') : undefined),
      email: (val) => {
        if (!val) return t('form.errors.emailRequired');
        if (tCommon) return commonValidations.email(tCommon)(val);
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))
          ? t('form.errors.invalidEmail')
          : undefined;
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
        if (tCommon) return commonValidations.mobile(tCommon, 'form.errors.invalidMobile')(val);
        return !/^\d{10}$/.test(String(val)) ? t('form.errors.invalidMobile') : undefined;
      },
    });
  },
  validateRole: (data: { name: string }, t: (key: string) => string) => {
    return validateForm(data, {
      name: (val) => (!val ? t('form.errors.roleNameRequired') : undefined),
    });
  },
  validateDesignation: (data: { name: string; code: string }, t: (key: string) => string) => {
    return validateForm(data, {
      name: (val) => (!val ? t('form.errors.designationNameRequired') : undefined),
      code: (val) => (!val ? t('form.errors.designationCodeRequired') : undefined),
    });
  },
};
