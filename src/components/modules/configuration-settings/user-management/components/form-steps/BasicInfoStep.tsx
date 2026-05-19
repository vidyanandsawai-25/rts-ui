'use client';

import { Building2, Mail, Phone } from 'lucide-react';
import { Label, Input, ToggleSwitch } from '@/components/common';
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
                disabled={!!editingUser}
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="border-2 text-slate-700"
                placeholder={t('form.usernamePlaceholder')}
              />
              {errors.userName && (
                <p className="text-red-500 text-[10px] mt-1">{errors.userName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.userCode')}</Label>
              <Input
                value={formData.userCode}
                onChange={(e) => setFormData({ ...formData, userCode: e.target.value })}
                className="border-2 text-slate-700"
                placeholder={t('form.userCodePlaceholder')}
              />
              {errors.userCode && (
                <p className="text-red-500 text-[10px] mt-1">{errors.userCode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.firstName')} *</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border-2"
              />
              {errors.firstName && (
                <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('form.middleName')}</Label>
              <Input
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form.lastName')} *</Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border-2"
              />
              {errors.lastName && (
                <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>
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
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('form.mobileNo')} *
              </Label>
              <Input
                required
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                className="border-2"
              />
              {errors.mobileNo && (
                <p className="text-red-500 text-[10px] mt-1">{errors.mobileNo}</p>
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
