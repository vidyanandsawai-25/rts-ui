'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/common/Modal';
import { Input, Button } from '@/components/common';

interface PhotoPlanCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, displayOrder?: number, description?: string) => void;
  defaultDisplayOrder: number;
  existingNames?: string[];
  isLoading?: boolean;
}

export function PhotoPlanCategoryModal({
  open,
  onClose,
  onSubmit,
  defaultDisplayOrder,
  existingNames = [],
  isLoading = false,
}: PhotoPlanCategoryModalProps): React.ReactElement {
  const t = useTranslations('ptis');
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(String(defaultDisplayOrder));
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedName = normalize(name);

    if (!trimmedName) {
      newErrors.name = t('media.nameRequired') || 'Category name is required';
    } else if (!/^[a-zA-Z0-9\s-_()]+$/.test(trimmedName)) {
      newErrors.name = t('media.invalidNameFormat') || 'Only letters, numbers, spaces, hyphens, parentheses, and underscores are allowed';
    } else if (existingNames.some(n => normalize(n) === normalizedName)) {
      newErrors.name = 'A category with this name already exists';
    }

    const orderNum = displayOrder.trim() ? Number(displayOrder) : undefined;
    if (orderNum !== undefined && (isNaN(orderNum) || orderNum <= 0 || !Number.isInteger(orderNum))) {
      newErrors.displayOrder = t('media.invalidDisplayOrder') || 'Display order must be a positive integer';
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(trimmedName, orderNum, trimmedDesc || undefined);
  };

  const footer = (
    <div className="flex gap-2 justify-end w-full">
      <Button
        variant="secondary"
        onClick={onClose}
        type="button"
        disabled={isLoading}
        className="cursor-pointer hover:!bg-slate-100 hover:!text-slate-900 transition-all hover:scale-105 active:scale-95 duration-200"
      >
        {t('actions.cancel') || 'Cancel'}
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        type="button"
        disabled={isLoading || !name.trim()}
        className="!bg-blue-600 hover:!bg-blue-700 !text-white font-medium px-4 py-2 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : (t('actions.save') || 'Save')}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Photo Category Slot"
      subtitle="Create a new slot to hold specific photos for this property."
      footer={footer}
      maxWidth="sm"
    >
      <form onSubmit={isLoading ? undefined : handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Garden View, Kitchen Area"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors(prev => {
              const next = { ...prev };
              delete next.name;
              return next;
            });
          }}
          error={errors.name}
          disabled={isLoading}
          required
          fullWidth
          autoFocus
        />

        <Input
          label={t('media.displayOrder') || 'Display Order'}
          placeholder="e.g. 1, 2, 3"
          type="number"
          min="1"
          value={displayOrder}
          onChange={(e) => {
            setDisplayOrder(e.target.value);
            setErrors(prev => {
              const next = { ...prev };
              delete next.displayOrder;
              return next;
            });
          }}
          error={errors.displayOrder}
          disabled={isLoading}
          fullWidth
        />

        <Input
          label="Description"
          placeholder="Enter category description..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors(prev => {
              const next = { ...prev };
              delete next.description;
              return next;
            });
          }}
          error={errors.description}
          disabled={isLoading}
          fullWidth
        />
      </form>
    </Modal>
  );
}
