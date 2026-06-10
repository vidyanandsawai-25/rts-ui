'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/common/Modal';
import { Input, Button, Select } from '@/components/common';

interface PhotoPlanNamingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string) => void;
  availableTypes: { label: string; value: string }[];
  defaultDisplayOrder: number;
  defaultName?: string;
  isReplacement?: boolean;
  defaultPhotoTypeId?: number;
  isEdit?: boolean;
  defaultRemarks?: string;
  isLoading?: boolean;
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

  const handleTypeChange = (value: string) => {
    setPhotoTypeId(value);
    setErrors(prev => { const { photoTypeId: _, ...next } = prev; return next; });
    const selectedType = availableTypes.find(t => t.value === value);
    if (selectedType && (!name || availableTypes.some(t => t.label === name) || name === 'Custom Photo Plan')) {
      setName(selectedType.label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = t('media.nameRequired') || 'Name is required';
    } else if (!/^[a-zA-Z0-9\s-_()]+$/.test(trimmedName)) {
      newErrors.name = t('media.invalidNameFormat') || 'Only letters, numbers, spaces, hyphens, parentheses, and underscores are allowed';
    }

    const orderNum = Number(displayOrder);
    if (isNaN(orderNum) || orderNum <= 0 || !Number.isInteger(orderNum)) {
      newErrors.displayOrder = t('media.invalidDisplayOrder') || 'Display order must be a positive integer';
    }

    if (!isReplacement && !isEdit) {
      if (!photoTypeId) newErrors.photoTypeId = t('media.photoTypeRequired') || 'Photo Type is required';
      if (!selectedFile) newErrors.file = 'Photo file is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(trimmedName, orderNum, Number(photoTypeId || '0'), selectedFile || undefined, remarks.trim());
  };

  const isSaveDisabled = isLoading || !name.trim() || !displayOrder.trim() || (!isReplacement && !isEdit && (!photoTypeId || !selectedFile));

  const footer = (
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
        {isLoading ? 'Saving...' : (t('actions.save') || 'Save')}
      </Button>
    </div>
  );

  const titleStr = isEdit ? 'Edit Photo Details' : (isReplacement ? (t('media.replaceImageTitle') || 'Replace Image Details') : (t('media.namePhotoPlanTitle') || 'Upload Photo Details'));
  const subtitleStr = isEdit ? 'Update the display name, display order and remarks.' : (t('media.namePhotoPlanSubtitle') || 'Please enter details for this photo plan slot.');

  return (
    <Modal open={open} onClose={onClose} title={titleStr} subtitle={subtitleStr} footer={footer} maxWidth="sm">
      <form onSubmit={isLoading ? undefined : handleSubmit} className="space-y-4">
        {!isReplacement && !isEdit ? (
          <Select
            label={t('media.photoTypeSlot') || 'Photo Type Slot'}
            options={availableTypes}
            value={photoTypeId}
            onChange={(_, val) => handleTypeChange(val)}
            placeholder={t('media.photoTypePlaceholder') || 'Select target slot...'}
            error={errors.photoTypeId}
            disabled={isLoading}
            required
          />
        ) : (
          <Input
            label={t('media.photoTypeSlot') || 'Photo Type Slot'}
            value={availableTypes.find(t => t.value === photoTypeId)?.label || defaultName || t('media.standardSlot') || 'Standard Slot'}
            disabled
            fullWidth
          />
        )}

        <Input
          label={t('media.photoPlanName') || 'Photo Plan Name'}
          placeholder={t('media.photoPlanNamePlaceholder') || 'e.g. Front Elevation, Terrace View'}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors(prev => { const { name: _, ...next } = prev; return next; });
          }}
          error={errors.name}
          disabled={isLoading}
          required
          fullWidth
          autoFocus={!isReplacement && !isEdit}
        />

        <Input
          label={t('media.displayOrder') || 'Display Order'}
          placeholder="e.g. 1, 2, 3"
          type="number"
          min="1"
          value={displayOrder}
          onChange={(e) => {
            setDisplayOrder(e.target.value);
            setErrors(prev => { const { displayOrder: _, ...next } = prev; return next; });
          }}
          error={errors.displayOrder}
          required
          disabled={isReplacement || isLoading}
          fullWidth
        />

        <Input
          label={t.has('media.remarks') ? t('media.remarks') : 'Remarks'}
          placeholder={t.has('media.remarksPlaceholder') ? t('media.remarksPlaceholder') : 'Enter any remarks...'}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={isLoading}
          fullWidth
        />

        {!isReplacement && !isEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('media.photoFile') || 'Photo File'} *</label>
            <input
              type="file" accept="image/*" disabled={isLoading}
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setErrors(prev => { const { file: _, ...next } = prev; return next; });
              }}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
            />
            {errors.file && <p className="text-xs text-red-500 mt-0.5">{errors.file}</p>}
          </div>
        )}
      </form>
    </Modal>
  );
}
