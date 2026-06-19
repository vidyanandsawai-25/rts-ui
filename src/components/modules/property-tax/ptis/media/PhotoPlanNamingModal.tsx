'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Button, Select, Drawer } from '@/components/common';
import { photoPlanNamingSchema, validatePhotoFile } from '@/lib/validation/ptis/photo-plan-validation';
import { UploadInstructions } from './UploadInstructions';
import { PhotoPlanImageEditorDrawer } from './PhotoPlanImageEditorDrawer';

const FALLBACKS: Record<string, string> = {
  'media.invalidDisplayOrder': 'Display order must be a positive integer',
  'media.photoTypeIdRequired': 'Valid Photo Type ID is required',
  'media.fileRequired': 'Photo file is required',
  'media.allowedFormats': 'Only JPEG, JPG, and PNG images are allowed',
  'media.maxFileSize': 'File size should not exceed 5 MB',
};

interface PhotoPlanNamingModalProps {
  open: boolean; onClose: () => void;
  onSubmit: (name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string) => void;
  availableTypes: { label: string; value: string }[];
  defaultDisplayOrder: number; defaultName?: string; isReplacement?: boolean;
  defaultPhotoTypeId?: number; isEdit?: boolean; defaultRemarks?: string; isLoading?: boolean;
}

export function PhotoPlanNamingModal({
  open, onClose, onSubmit, availableTypes, defaultDisplayOrder,
  defaultName = '', isReplacement = false, defaultPhotoTypeId,
  isEdit = false, defaultRemarks = '', isLoading = false,
}: PhotoPlanNamingModalProps): React.ReactElement {
  const t = useTranslations('ptis');
  const [name, setName] = useState(defaultName);
  const [displayOrder, setDisplayOrder] = useState(String(defaultDisplayOrder));
  const [photoTypeId, setPhotoTypeId] = useState(defaultPhotoTypeId ? String(defaultPhotoTypeId) : '');
  const [remarks, setRemarks] = useState(defaultRemarks);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editImageSrc, setEditImageSrc] = useState<string | null>(null);

  const handleTypeChange = (value: string) => {
    setPhotoTypeId(value);
    setErrors(({ photoTypeId: _, ...next }) => next);
    const selectedType = availableTypes.find((t) => t.value === value);
    if (selectedType && (!name || availableTypes.some((t) => t.label === name) || name === 'Custom Photo Plan')) setName(selectedType.label);
  };

  const getMsg = (key: string) => {
    const msg = t(key as Parameters<typeof t>[0]);
    return msg === key ? (FALLBACKS[key] || key) : msg;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const orderNum = Number(displayOrder);
    const validationResult = photoPlanNamingSchema.safeParse({
      name, displayOrder: isNaN(orderNum) ? undefined : orderNum,
      remarks: remarks || undefined, photoTypeId: photoTypeId ? Number(photoTypeId) : undefined,
    });
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const path = err.path[0];
        if (typeof path === 'string') newErrors[path] = getMsg(err.message);
      });
    }
    if (!isEdit) {
      const fileErrorKey = validatePhotoFile(selectedFile);
      if (fileErrorKey) newErrors.file = getMsg(fileErrorKey);
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(name.trim(), orderNum, Number(photoTypeId || '0'), selectedFile || undefined, remarks.trim());
  };

  const isSaveDisabled = isLoading || !name.trim() || !displayOrder.trim() || (!isEdit && (!photoTypeId || !selectedFile));
  const selectedPhotoTypeName = availableTypes.find((t) => String(t.value) === String(photoTypeId))?.label || defaultName || t('media.slot') || 'Photo Slot';
  const titleStr = isEdit ? t('media.editPhotoDetails') || 'Edit Photo Details' : isReplacement ? t('media.replaceImageTitle') || 'Replace Image Details' : t('media.addPhotoFor', { name: selectedPhotoTypeName }) || `Add Photo for ${selectedPhotoTypeName}`;
  const subtitleStr = isEdit ? t('media.editPhotoSubtitle') || 'Update the display name, display order and remarks.' : undefined;

  const handleEditorSave = async (file: File) => (setSelectedFile(file), true);
  const handleEditorClose = () => { if (editImageSrc) URL.revokeObjectURL(editImageSrc); setEditImageSrc(null); };

  return (
    <>
      {open && (
        <style dangerouslySetInnerHTML={{
          __html: `
            body:has(.photo-plan-naming-modal-content) div:has(+ .drawer-instance) {
              background-color: transparent !important;
              backdrop-filter: none !important;
            }
          `
        }} />
      )}
      <Drawer
        open={open} onClose={onClose} width="sm"
        title={
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-slate-800">{titleStr}</h2>
            {subtitleStr && <p className="text-xs text-slate-400 font-normal mt-0.5">{subtitleStr}</p>}
          </div>
        }
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="secondary" onClick={onClose} type="button" disabled={isLoading}
              className="cursor-pointer hover:!bg-slate-100 hover:!text-slate-900 transition-all hover:scale-105 active:scale-95 duration-200"
            >
              {t('actions.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary" onClick={handleSubmit} type="button" disabled={isSaveDisabled}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium px-4 py-2 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('media.saving') || 'Saving...' : t('actions.save') || 'Save'}
            </Button>
          </div>
        }
      >
        <form onSubmit={isLoading ? undefined : handleSubmit} className="space-y-4 p-5 photo-plan-naming-modal-content">
          {!isReplacement && !isEdit ? (
            <Select
              label={t('media.photoTypeSlot') || 'Photo Type Slot'} options={availableTypes}
              value={photoTypeId} onChange={(_, val) => handleTypeChange(val)}
              placeholder={t('media.photoTypePlaceholder') || 'Select target slot...'}
              error={errors.photoTypeId} disabled={true} required
            />
          ) : (
            <Input
              label={t('media.photoTypeSlot') || 'Photo Type Slot'} fullWidth disabled
              value={availableTypes.find((t) => t.value === photoTypeId)?.label || defaultName || t('media.standardSlot') || 'Standard Slot'}
            />
          )}
          <Input
            label={t('media.photoPlanName') || 'Photo Plan Name'}
            placeholder={t('media.photoPlanNamePlaceholder') || 'e.g. Front Elevation, Terrace View'}
            value={name} error={errors.name} disabled={isReplacement || isLoading} required fullWidth autoFocus={!isReplacement && !isEdit}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => {
                const { name: _, ...next } = prev;
                return next;
              });
            }}
          />
          <Input
            label={t('media.displayOrder') || 'Display Order'} placeholder="e.g. 1, 2, 3"
            type="number" min="1" value={displayOrder} error={errors.displayOrder} required disabled={isReplacement || isLoading} fullWidth
            onChange={(e) => {
              setDisplayOrder(e.target.value);
              setErrors((prev) => {
                const { displayOrder: _, ...next } = prev;
                return next;
              });
            }}
          />
          <Input
            label={t.has('media.remarks') ? t('media.remarks') : 'Remarks'}
            placeholder={t.has('media.remarksPlaceholder') ? t('media.remarksPlaceholder') : 'Enter any remarks...'}
            value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isLoading} fullWidth
          />
          {!isEdit && (
            <>
              <UploadInstructions />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('media.photoFile') || 'Photo File'} *</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file" accept="image/*" disabled={isLoading}
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] || null);
                      setErrors(({ file: _, ...next }) => next);
                    }}
                    className="flex-1 min-w-0 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
                  {selectedFile && (
                    <Button
                      variant="secondary" size="sm" type="button"
                      onClick={() => setEditImageSrc(URL.createObjectURL(selectedFile))}
                      className="shrink-0 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {t('media.editImage') || 'Edit Image'}
                    </Button>
                  )}
                </div>
                {errors.file && <p className="text-xs text-red-500 mt-0.5">{errors.file}</p>}
              </div>
            </>
          )}
        </form>
      </Drawer>
      <PhotoPlanImageEditorDrawer
        open={!!editImageSrc} onClose={handleEditorClose}
        imageSrc={editImageSrc || undefined} imageTitle={name || 'Selected Image'}
        onSave={handleEditorSave}
      />
    </>
  );
}
