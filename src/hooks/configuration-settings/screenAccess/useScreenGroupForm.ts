'use client';

import { useBaseForm } from './useBaseForm';
import {
  createScreenGroupAction,
  updateScreenGroupAction,
} from '@/app/[locale]/configuration-settings/screenAccess/action.mutations';

import { ScreenGroupMasterData } from '@/types/screen-access.types';
import { commonValidations } from '@/lib/utils/validation';
import { GROUP_CODE_MAX, GROUP_NAME_MAX } from '@/lib/constants/screen-access.constants';

interface UseScreenGroupFormProps {
  initialData?: Partial<ScreenGroupMasterData>;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useScreenGroupForm({
  initialData,
  isEdit: isEditProp,
  onSuccess,
  onCancel,
}: UseScreenGroupFormProps) {
  const isEdit = isEditProp ?? Boolean(initialData?.screenGroupId);

  return {
    ...useBaseForm<ScreenGroupMasterData>({
      initialData,
      onSuccess,
      onCancel,
      successMessageKey: isEdit
        ? 'screenManagement.groups.messages.updateSuccess'
        : 'screenManagement.groups.messages.createSuccess',
      redirectPath: '/configuration-settings/screenAccess?tab=screen-management&subTab=groups',
      saveAction: (data) => {
        if (isEdit) {
          if (!data.screenGroupId) {
            return Promise.resolve({
              success: false,
              message: 'screenManagement.groups.messages.updateError',
            });
          }
          return updateScreenGroupAction(data.screenGroupId, data);
        }
        return createScreenGroupAction(data);
      },
      validationSchema: {
        screenGroupCode: (val, _data, _t, tCommon) =>
          commonValidations.masterCode(tCommon, GROUP_CODE_MAX, {
            required: 'form.validation.codeRequired',
            format: 'form.validation.codeFormat',
            maxLength: 'form.validation.codeMaxLength',
          })(val),
        screenGroupName: (val, _data, _t, tCommon) =>
          commonValidations.masterDescription(tCommon, GROUP_NAME_MAX, {
            required: 'form.validation.descriptionRequired',
            format: 'form.validation.descriptionFormat',
            maxLength: 'form.validation.descriptionMaxLength',
          })(val),
        displayOrder: (val, _data, _t, tCommon) =>
          commonValidations.masterSearchSequence(
            tCommon,
            'form.validation.sequenceInvalid'
          )(val as number | undefined),
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
