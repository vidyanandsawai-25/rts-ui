'use client';

import { useBaseForm } from './useBaseForm';
import {
  createScreenAction,
  updateScreenAction,
} from '@/app/[locale]/configuration-settings/screenAccess/action.mutations';

import { ScreenMasterData } from '@/types/screen-access.types';
import { commonValidations } from '@/lib/utils/validation';
import { SCREEN_CODE_MAX, SCREEN_NAME_MAX } from '@/lib/constants/screen-access.constants';

interface UseScreenFormProps {
  initialData?: Partial<ScreenMasterData>;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useScreenForm({
  initialData,
  isEdit: isEditProp,
  onSuccess,
  onCancel,
}: UseScreenFormProps) {
  const isEdit = isEditProp ?? Boolean(initialData?.screenMasterId);

  return {
    ...useBaseForm<ScreenMasterData>({
      initialData,
      onSuccess,
      onCancel,
      successMessageKey: isEdit
        ? 'screenManagement.screens.messages.updateSuccess'
        : 'screenManagement.screens.messages.createSuccess',
      redirectPath: '/configuration-settings/screenAccess?tab=screen-management&subTab=screens',
      saveAction: (data) => {
        if (isEdit) {
          if (!data.screenMasterId) {
            return Promise.resolve({
              success: false,
              message: 'screenManagement.screens.messages.updateError',
            });
          }
          return updateScreenAction(data.screenMasterId, data);
        }
        return createScreenAction(data);
      },
      validationSchema: {
        screenCode: (val, _data, _t, tCommon) =>
          commonValidations.masterCode(tCommon, SCREEN_CODE_MAX, {
            required: 'form.validation.codeRequired',
            format: 'form.validation.codeFormat',
            maxLength: 'form.validation.codeMaxLength',
          })(val),
        screenName: (val, _data, _t, tCommon) =>
          commonValidations.masterDescription(tCommon, SCREEN_NAME_MAX, {
            required: 'form.validation.descriptionRequired',
            format: 'form.validation.descriptionFormat',
            maxLength: 'form.validation.descriptionMaxLength',
          })(val),
        screenGroupId: (val, _data, t) =>
          !val ? t('screenManagement.screens.form.errors.groupRequired') : undefined,
        routePath: (val, _data, t) =>
          !val ? t('screenManagement.screens.form.errors.routeRequired') : undefined,
        isActive: (val, _data, _t, tCommon) =>
          commonValidations.masterActiveStatus(
            tCommon,
            isEdit,
            'form.validation.mustBeActive'
          )(val),
      },
    }),
    isEdit,
  };
}
