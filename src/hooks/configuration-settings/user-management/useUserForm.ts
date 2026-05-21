'use client';

import { useReducer, useState, useEffect } from 'react';
import { User, UserFormData, MasterModule } from '@/types/user-management';
import {
  createUserAction,
  updateUserAction,
} from '@/app/[locale]/configuration-settings/user-management/actions.mutations';
import { getUsersAction } from '@/app/[locale]/configuration-settings/user-management/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { userManagementValidations } from '@/lib/utils/user-management-validation';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import { formReducer, getInitialState } from './userFormReducer';

export function useUserForm(onSuccess: (user: User) => void, initialData?: User) {
  const t = useTranslations('userManagement');
  const [currentTab, setCurrentTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingUsers, setExistingUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getUsersAction(1, 2000);
        if (res.success && res.data?.items) {
          setExistingUsers(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load users for validation:', err);
      }
    }
    loadUsers();
  }, []);

  const [formData, dispatch] = useReducer(formReducer, getInitialState(initialData));

  useEffect(() => {
    const validationErrors = userManagementValidations.validateUser(
      formData,
      t,
      undefined,
      !!initialData,
      existingUsers,
      initialData?.userId ?? (initialData?.id ? Number(initialData.id) : undefined)
    );

    setTimeout(() => {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        const fieldsToCheck = [
          'userName',
          'userCode',
          'email',
          'mobileNo',
          'address',
          'firstName',
          'lastName',
        ];
        fieldsToCheck.forEach((field) => {
          const val = formData[field as keyof UserFormData];
          const error = validationErrors[field];

          if (error) {
            let isRequiredError = false;
            if (field === 'userName') isRequiredError = error === t('form.errors.usernameRequired');
            else if (field === 'firstName')
              isRequiredError = error === t('form.errors.firstNameRequired');
            else if (field === 'lastName')
              isRequiredError = error === t('form.errors.lastNameRequired');
            else if (field === 'email') isRequiredError = error === t('form.errors.emailRequired');
            else if (field === 'mobileNo')
              isRequiredError = error === t('form.errors.mobileRequired');

            const isNotEmpty = val !== undefined && val !== null && String(val).trim() !== '';
            if (isNotEmpty || !isRequiredError) {
              nextErrors[field] = error;
            } else {
              delete nextErrors[field];
            }
          } else {
            delete nextErrors[field];
          }
        });
        return nextErrors;
      });
    }, 0);
  }, [formData, existingUsers, initialData, t]);

  const steps = ['basic', 'departments', 'modules'];
  const currentIndex = steps.indexOf(currentTab);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  const validateBasicInfo = () => {
    const validationErrors = userManagementValidations.validateUser(
      formData,
      t,
      undefined,
      !!initialData,
      existingUsers,
      initialData?.userId ?? (initialData?.id ? Number(initialData.id) : undefined)
    );
    const basicFields = [
      'userName',
      'userCode',
      'firstName',
      'lastName',
      'email',
      'mobileNo',
      'address',
    ];
    const basicErrors: Record<string, string> = {};
    basicFields.forEach((field) => {
      if (validationErrors[field]) {
        basicErrors[field] = validationErrors[field];
      }
    });
    return basicErrors;
  };

  const handleTabChange = (nextTab: string) => {
    if (currentTab === 'basic' && nextTab !== 'basic') {
      const basicErrors = validateBasicInfo();
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        toast.error(Object.values(basicErrors)[0]);
        return;
      }
    }
    if (currentTab === 'departments' && nextTab === 'modules') {
      const validationErrors = userManagementValidations.validateUser(
        formData,
        t,
        undefined,
        !!initialData,
        existingUsers,
        initialData?.userId ?? (initialData?.id ? Number(initialData.id) : undefined)
      );
      if (validationErrors.departmentIds) {
        setErrors({ departmentIds: validationErrors.departmentIds });
        toast.error(validationErrors.departmentIds);
        return;
      }
    }
    setErrors({});
    setCurrentTab(nextTab);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentTab === 'basic') {
      const basicErrors = validateBasicInfo();
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        toast.error(Object.values(basicErrors)[0]);
        return;
      }
    }
    if (currentTab === 'departments') {
      const validationErrors = userManagementValidations.validateUser(
        formData,
        t,
        undefined,
        !!initialData,
        existingUsers,
        initialData?.userId ?? (initialData?.id ? Number(initialData.id) : undefined)
      );
      if (validationErrors.departmentIds) {
        setErrors({ departmentIds: validationErrors.departmentIds });
        toast.error(validationErrors.departmentIds);
        return;
      }
    }
    setErrors({});
    if (!isLastStep) setCurrentTab(steps[currentIndex + 1]);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setErrors({});
    if (!isFirstStep) setCurrentTab(steps[currentIndex - 1]);
  };

  const setFormData = (data: Partial<UserFormData>) => {
    dispatch({ type: 'SET_FORM', data });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = userManagementValidations.validateUser(
      formData,
      t,
      undefined,
      !!initialData,
      existingUsers,
      initialData?.userId ?? (initialData?.id ? Number(initialData.id) : undefined)
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    try {
      const isEdit = !!initialData;
      const res = isEdit
        ? await updateUserAction(initialData.userId, formData as Partial<User>)
        : await createUserAction(formData as Partial<User>);

      if (res.success && res.data) {
        onSuccess(res.data as User);
        toast.success(t(isEdit ? 'messages.updateSuccess' : 'messages.createSuccess'));
      } else {
        setErrors(res.validationErrors || {});
        let errorMsg = res.message || t(isEdit ? 'messages.updateError' : 'messages.createError');
        if (res.message) {
          if (res.message.startsWith('messages.') || res.message.startsWith('errors.')) {
            errorMsg = t(res.message);
          } else {
            errorMsg = getCleanErrorMessage(res.message);
          }
        }
        toast.error(errorMsg);
      }
    } catch (_err) {
      toast.error(getCleanErrorMessage(_err, t('messages.unknownError')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    currentTab,
    setCurrentTab: handleTabChange,
    isSubmitting,
    errors,
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    currentIndex,
    toggleDepartment: (deptId: string) => dispatch({ type: 'TOGGLE_DEPARTMENT', deptId }),
    toggleModule: (deptId: string, moduleId: string) =>
      dispatch({ type: 'TOGGLE_MODULE', deptId, moduleId }),
    selectAllModules: (deptId: string, modules: MasterModule[]) =>
      dispatch({ type: 'SELECT_ALL_MODULES', deptId, modules }),
    deselectAllModules: (deptId: string) => dispatch({ type: 'DESELECT_ALL_MODULES', deptId }),
    toggleRole: (deptId: string, roleId: number) =>
      dispatch({ type: 'TOGGLE_ROLE', deptId, roleId }),
  };
}
