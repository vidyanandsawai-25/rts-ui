'use client';

import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import type { ULBContactAddressCardProps } from '@/types/ulbconfig-master.types';
import { UlbInput, UlbTextArea } from '../ULBFormField';

export function ULBContactAddressCard({ formData, t, onFieldChange }: ULBContactAddressCardProps) {
  return (
    <Card className="flex flex-col border-none bg-white/80 ring-1 ring-slate-200/60 lg:col-span-3">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-tight text-slate-800">
          <Mail className="h-3.5 w-3.5 text-primary" />
          {t('sections.contactInfo')} & {t('fields.address')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <UlbInput
              label={t('fields.email')}
              required
              type="email"
              placeholder={t('placeholders.email')}
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <UlbInput
                label={t('fields.phone')}
                required
                type="tel"
                placeholder={t('placeholders.phone')}
                value={formData.phone}
                onChange={(e) => onFieldChange('phone', e.target.value)}
              />
              <UlbInput
                label={t('fields.alternatePhone')}
                type="tel"
                placeholder={t('placeholders.phone')}
                value={formData.alternatePhone}
                onChange={(e) => onFieldChange('alternatePhone', e.target.value)}
              />
            </div>
            <UlbInput
              label={t('fields.website')}
              type="url"
              placeholder={t('placeholders.website')}
              value={formData.website}
              onChange={(e) => onFieldChange('website', e.target.value)}
            />
          </div>
          <UlbTextArea
            label={t('fields.address')}
            required
            placeholder="Enter complete address with street, locality, landmarks"
            value={formData.address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            className="min-h-[140px] flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
