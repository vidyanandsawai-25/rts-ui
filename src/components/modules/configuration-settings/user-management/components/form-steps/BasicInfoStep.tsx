'use client';

import { Building2, Mail, Phone } from 'lucide-react';
import { Label, Input, ToggleSwitch, ValidationMessage } from '@/components/common';
import { BasicInfoStepProps } from '@/types/user-management';

export function BasicInfoStep({
  formData,
  setFormData,
  editingUser,
  t,
  errors = {},
}: BasicInfoStepProps) {
  return (
    <div className="pr-2">
      <div className="space-y-4 pb-2">
        <div className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-700 mb-4">
            <Building2 className="w-5 h-5" />
            {t('form.personalDetails')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('form.username')} *</Label>
              <Input
                required
                maxLength={20}
                disabled={!!editingUser}
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="border-2 text-slate-700"
                placeholder={t('form.usernamePlaceholder')}
              />
              {errors.userName && (
                <ValidationMessage message={errors.userName} />
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.userCode')}</Label>
              <Input
                maxLength={15}
                value={formData.userCode}
                onChange={(e) => setFormData({ ...formData, userCode: e.target.value })}
                className="border-2 text-slate-700"
                placeholder={t('form.userCodePlaceholder')}
              />
              {errors.userCode && (
                <ValidationMessage message={errors.userCode} />
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.firstName')} *</Label>
              <Input
                required
                maxLength={40}
                value={formData.firstName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
                  setFormData({ ...formData, firstName: val });
                }}
                className="border-2"
              />
              {errors.firstName && (
                <ValidationMessage message={errors.firstName} />
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.middleName')}</Label>
              <Input
                maxLength={40}
                value={formData.middleName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
                  setFormData({ ...formData, middleName: val });
                }}
                className="border-2"
              />
              {errors.middleName && (
                <ValidationMessage message={errors.middleName} />
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.lastName')} *</Label>
              <Input
                required
                maxLength={40}
                value={formData.lastName}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
                  setFormData({ ...formData, lastName: val });
                }}
                className="border-2"
              />
              {errors.lastName && (
                <ValidationMessage message={errors.lastName} />
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('form.email')} *
              </Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-2"
              />
              {errors.email && (
                <ValidationMessage message={errors.email} />
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('form.mobileNo')} *
              </Label>
              <Input
                required
                maxLength={10}
                value={formData.mobileNo}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, mobileNo: val });
                }}
                className="border-2"
              />
              {errors.mobileNo && (
                <ValidationMessage message={errors.mobileNo} />
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t('form.address')}</Label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full min-h-[60px] p-2 rounded-lg border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition-colors text-slate-700"
                placeholder={t('form.addressPlaceholder')}
              />
            </div>

            {editingUser && (
              <div className="col-span-2">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">{t('filters.status')}</Label>
                    <p className="text-xs text-slate-500">
                      {formData.isActive ? t('filters.active') : t('filters.inactive')}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={formData.isActive}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        isActive: checked,
                        status: checked ? 'Active' : 'Inactive',
                      })
                    }
                    showPopup={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
