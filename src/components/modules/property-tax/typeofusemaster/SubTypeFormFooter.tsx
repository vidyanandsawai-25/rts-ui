import { CancelButton, SaveButton } from '@/components/common';

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

interface SubTypeFormFooterProps {
  isEdit: boolean;
  onCancel: () => void;
  t: TranslatorFunction;
}

export function SubTypeFormFooter({ isEdit, onCancel, t }: SubTypeFormFooterProps) {
  return (
    <>
      <CancelButton label={t('buttons.cancel')} onClick={onCancel} />
      <SaveButton
        label={isEdit ? t('buttons.edit') : t('buttons.save')}
        type="submit"
        form="use-subtype-form"
      />
    </>
  );
}
