'use client';

import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Label, TextArea } from '@/components/common';
import { DiscountAttributeState } from '@/types/discount.types';
import { DocumentAttachment } from '../building/DocumentAttachment';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { DiscountValueInput } from './DiscountValueInput';
import { getLocalizedName } from '@/lib/utils/social-details';

interface DiscountDetailPaneProps {
  data: DiscountAttributeState | null | undefined;
  onInputChange: (
    field: 'intValue' | 'decimalValue' | 'textValue' | 'dateValue' | 'remark',
    value: string
  ) => void;
  onFileUpload: (file: File) => void;
  onFileDelete: () => void;
  validationError?: string;
  t: {
    (key: string, values?: Record<string, string | number>): string;
    has?: (key: string) => boolean;
  };
  onDeleteDiscount?: () => void;
  isSaving?: boolean;
}

export const DiscountDetailPane: React.FC<DiscountDetailPaneProps> = ({
  data,
  onInputChange,
  onFileUpload,
  onFileDelete,
  validationError,
  t,
  onDeleteDiscount,
  isSaving = false,
}) => {
  const { confirm } = useConfirm();
  const isActiveDiscount = (item: DiscountAttributeState) =>
    item.dataType.toUpperCase() === 'BIT' ? item.bitValue === true : item.enabled;

  const handleFileUploadWithConfirm = (file: File) => {
    if (data && (data.documentGuid || data.documentBindingId)) {
      confirm({
        title: t('discount.confirmReplaceTitle') || 'Replace Document',
        description:
          t('discount.confirmReplaceDesc') ||
          'Are you sure you want to replace the existing document with a new one?',
        confirmText: t('discount.confirmReplaceOk') || 'Yes, Replace',
        cancelText: t('discount.confirmReplaceCancel') || 'No, Cancel',
        variant: 'warning',
        onConfirm: () => {
          onFileUpload(file);
        },
      });
    } else {
      onFileUpload(file);
    }
  };

  const handleFileDeleteWithConfirm = () => {
    confirm({
      title: t('discount.confirmDeleteTitle') || 'Delete Document',
      description:
        t('discount.confirmDeleteDesc') ||
        'Are you sure you want to delete the attached document? This action cannot be undone.',
      confirmText: t('discount.confirmDeleteOk') || 'Yes, Delete',
      cancelText: t('discount.confirmDeleteCancel') || 'No, Cancel',
      variant: 'delete',
      onConfirm: onFileDelete,
    });
  };

  const isDiscountFilled = React.useMemo(() => {
    if (!data) return false;
    const hasFile = !!(data.documentGuid || data.fileName || data.pendingFile);
    const isBitType = data.dataType?.toUpperCase() === 'BIT';
    if (isBitType) {
      return hasFile || !!data.remark?.trim();
    }
    const hasVal = !!(
      (data.intValue !== null && data.intValue !== undefined) ||
      (data.decimalValue !== null && data.decimalValue !== undefined) ||
      data.textValue?.trim() ||
      data.dateValue?.trim()
    );
    return hasFile || hasVal || !!data.remark?.trim();
  }, [data]);

  const isUpdateCase = React.useMemo(() => {
    if (!data) return false;
    return typeof data.propertySocialDetailId === 'number' && data.propertySocialDetailId > 0;
  }, [data]);

  const handleDeleteDiscountWithConfirm = () => {
    if (onDeleteDiscount && data) {
      confirm({
        title: t('discount.confirmDeleteDiscountTitle') || 'Delete Discount & Data',
        description: `${t('discount.confirmToggleOffWarning') || 'You have an active discount with details:'}\n${displayName}\n\n${t('discount.confirmDeleteDiscountDesc') || 'Are you sure you want to delete this discount and all its associated data?'}`,
        confirmText: t('discount.confirmDeleteDiscountOk') || 'Yes, Delete',
        cancelText: t('discount.confirmDeleteDiscountCancel') || 'No, Cancel',
        variant: 'delete',
        onConfirm: onDeleteDiscount,
      });
    }
  };
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] lg:h-full bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
        <AlertCircle size={36} className="text-gray-400 mb-3" />
        <p className="text-sm font-bold text-gray-500">
          {t('discount.selectDiscountPrompt') ||
            'Select a discount attribute from the sidebar to edit details'}
        </p>
      </div>
    );
  }

  const displayName = getLocalizedName(
    data.socialAttributeCode,
    data.socialAttributeName,
    t as unknown as Parameters<typeof getLocalizedName>[2]
  );
  const tWithHas = t as unknown as { has?: (key: string) => boolean };
  const hasRemark = typeof tWithHas.has === 'function' && tWithHas.has('discount.remark');
  const hasRemarkPlaceholder =
    typeof tWithHas.has === 'function' && tWithHas.has('discount.remarkPlaceholder');

  const hasAnyData = !!(
    (data.intValue !== null && data.intValue !== undefined) ||
    (data.decimalValue !== null && data.decimalValue !== undefined) ||
    data.textValue?.trim() ||
    data.dateValue?.trim() ||
    data.documentGuid?.trim() ||
    data.documentBindingId ||
    data.remark?.trim()
  );

  if (!isActiveDiscount(data) && !hasAnyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] lg:h-full bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <AlertCircle size={36} className="text-blue-500 mb-3" />
        <h4 className="text-base font-bold text-gray-800 mb-2">{displayName}</h4>
        <p className="text-sm font-semibold text-gray-500 max-w-sm">
          {t('discount.enableDiscountPrompt') ||
            'This discount type is currently disabled. Toggle it active in the sidebar list to edit details and attach documents.'}
        </p>
      </div>
    );
  }

  const isDisabled = !isActiveDiscount(data);
  const docRequiredMsg = t('common.validation.documentRequired') || 'Document is required.';
  const isDocumentInvalid = !!validationError && validationError === docRequiredMsg;

  let isRemarkError = false;
  let isValueInvalid = false;

  if (validationError && !isDocumentInvalid) {
    if ((data.dataType || '').toUpperCase() === 'BIT') {
      isRemarkError = true;
    } else if (
      validationError.includes('500') ||
      validationError.includes('Remark cannot exceed')
    ) {
      isRemarkError = true;
    } else if (
      validationError ===
      (t('property.validation.invalidCharacters') || 'Contains invalid characters.')
    ) {
      const textValueInvalid =
        (data.dataType || '').toUpperCase() === 'VARCHAR' &&
        data.textValue &&
        !/^[^<>]*$/.test(data.textValue);
      if (textValueInvalid) {
        isValueInvalid = true;
      } else {
        isRemarkError = true;
      }
    } else {
      isValueInvalid = true;
    }
  }

  const showValueInput = (data.dataType || '').toUpperCase() !== 'BIT';

  const inputClassName = `h-10 text-sm placeholder:text-gray-400 focus:ring-1 shadow-sm transition-colors font-semibold ${
    isDisabled
      ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
      : isValueInvalid
        ? 'bg-white text-gray-800 border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'bg-white text-gray-800 border-blue-200 focus:border-blue-600 focus:ring-blue-600 hover:border-blue-300'
  }`;

  return (
    <div
      className={`flex flex-col min-h-[300px] lg:h-full border rounded-xl shadow-sm p-4 justify-between transition-opacity ${
        isDisabled ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-blue-100'
      }`}
    >
      <div className="space-y-5 overflow-y-auto pr-1">
        {isDisabled && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-800">
              {t('discount.disabledWithDataNote') ||
                'This discount is currently disabled. Toggle it active to edit details.'}
            </span>
          </div>
        )}
        <div className="pb-3 border-b border-blue-50 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-blue-500 uppercase block mb-1">
              {t('discount.editingDiscount') || 'Discount Details'}
            </span>
            <h4 className="text-lg font-bold text-blue-900 leading-tight">{displayName}</h4>
          </div>
          {onDeleteDiscount && isDiscountFilled && isUpdateCase && !isDisabled && (
            <button
              type="button"
              disabled={isDisabled || isSaving}
              onClick={handleDeleteDiscountWithConfirm}
              className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('discount.deleteDiscount') || 'Delete Discount & Data'}
            </button>
          )}
        </div>

        {showValueInput && (
          <DiscountValueInput
            data={data}
            isDisabled={isDisabled}
            inputClassName={inputClassName}
            onInputChange={onInputChange}
            isValueInvalid={isValueInvalid}
            validationError={validationError}
            t={t}
          />
        )}

        <div className="space-y-1.5 w-full">
          <Label className="text-sm font-bold text-blue-800">
            {t('discount.uploadDocument') || 'Document Attachment'}
            {data.isDocumentRequired === true && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          <DocumentAttachment
            documentGuid={data.documentGuid || undefined}
            fileName={data.fileName || undefined}
            documentUrl={data.documentUrl || undefined}
            hasDocumentBinding={!!data.documentBindingId}
            isUploading={data.isUploading}
            isDeleting={data.isDeleting}
            isDisabled={isDisabled}
            isDocumentInvalid={isDocumentInvalid}
            onFileUpload={handleFileUploadWithConfirm}
            onFileDelete={handleFileDeleteWithConfirm}
            t={t}
            label={displayName}
            pendingFile={data.pendingFile}
          />
        </div>

        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-blue-800">
              {hasRemark ? t('discount.remark') : 'Remark'}
            </Label>
            {(data.remark || '').trim() !== '' && (
              <button
                type="button"
                onClick={() => onInputChange('remark', '')}
                disabled={isDisabled}
                className="px-2.5 py-0.5 text-[10px] md:text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400 active:bg-red-200 shadow-sm"
              >
                {t('commonbuttonmessages.clear') || 'Clear'}
              </button>
            )}
          </div>
          <TextArea
            value={data.remark || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[<>]/g, '');
              onInputChange('remark', val);
            }}
            placeholder={hasRemarkPlaceholder ? t('discount.remarkPlaceholder') : 'Enter remark...'}
            disabled={isDisabled}
            rows={2}
            maxLength={500}
            showCharCount
            charCountLabel="characters"
            className={`resize-y font-semibold ${isRemarkError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {isRemarkError && (
            <span className="text-red-500 text-[10px] font-semibold mt-1 block">
              {validationError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
