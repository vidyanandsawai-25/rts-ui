'use client';

import { Briefcase, Calendar, Users } from 'lucide-react';
import type { ULBProjectInfoSectionProps } from '@/types/ulbconfig-master.types';
import { UlbInputMd } from '../ULBFormField';

export function ULBProjectInfoSection({ formData, t, onFieldChange }: ULBProjectInfoSectionProps) {
  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
      <header className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">{t('sections.projectInformation')}</h3>
          <p className="text-xs text-slate-500">{t('sections.projectInformationHint')}</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-x-8 gap-y-5 p-5">
        <div className="col-span-4 space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('sections.timeline')}</span>
          </div>
          <UlbInputMd label={t('fields.projectStartDate')} required type="date" value={formData.projectStartDate} onChange={(e) => onFieldChange('projectStartDate', e.target.value)} />
          <UlbInputMd label={t('fields.financialYearStart')} required type="date" value={formData.financialYearStart} onChange={(e) => onFieldChange('financialYearStart', e.target.value)} />
          <UlbInputMd label={t('fields.goLiveDate')} type="date" value={formData.goLiveDate} onChange={(e) => onFieldChange('goLiveDate', e.target.value)} />
        </div>

        <div className="col-span-1 flex justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="col-span-7 space-y-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{t('sections.teamContacts')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <UlbInputMd label={t('fields.implementationPartner')} placeholder={t('placeholders.partner')} value={formData.implementationPartner} onChange={(e) => onFieldChange('implementationPartner', e.target.value)} />
            <UlbInputMd label={t('fields.projectManager')} required placeholder={t('placeholders.pmName')} value={formData.projectManager} onChange={(e) => onFieldChange('projectManager', e.target.value)} />
            <UlbInputMd label={t('fields.pmEmail')} required type="email" placeholder={t('placeholders.email')} value={formData.projectManagerEmail} onChange={(e) => onFieldChange('projectManagerEmail', e.target.value)} />
            <UlbInputMd label={t('fields.pmPhone')} type="tel" placeholder={t('placeholders.phone')} value={formData.projectManagerPhone} onChange={(e) => onFieldChange('projectManagerPhone', e.target.value)} />
          </div>
        </div>
      </div>
    </section>
  );
}
