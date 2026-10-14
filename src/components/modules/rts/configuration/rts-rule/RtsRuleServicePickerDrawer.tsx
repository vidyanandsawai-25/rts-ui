'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Layers3, ListFilter, X } from 'lucide-react';
import { Button, CancelButton, Drawer, Label, Select } from '@/components/common';
import type { RuleMasterPageData } from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';

const selectClass =
  'w-full [&_button]:!h-10 [&_button]:!rounded-lg [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!px-3 [&_button]:!text-sm';

export default function RtsRuleServicePickerDrawer({
  open,
  departments,
  services,
  initialServiceId,
  onClose,
  onContinue,
}: {
  open: boolean;
  departments: RuleMasterPageData['departments'];
  services: RuleMasterPageData['services'];
  initialServiceId?: number;
  onClose: () => void;
  onContinue: (serviceId: number) => void;
}) {
  const t = useTranslations('rts.ruleMaster');
  const initialService = services.find((item) => item.id === initialServiceId);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    initialService ? String(initialService.departmentId) : ''
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>(initialServiceId ?? '');
  const departmentServices = services.filter(
    (item) => String(item.departmentId) === selectedDepartmentId
  );
  return (
    <Drawer
      open={open}
      onClose={() => onClose()}
      title={t('selectServiceForRule')}
      width="md"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex justify-end gap-2">
          <CancelButton label={t('cancel')} onClick={() => onClose()} />
          <Button
            type="button"
            variant="primary"
            disabled={!selectedServiceId}
            onClick={() => {
              if (!selectedServiceId) return;
              onContinue(selectedServiceId);
            }}
          >
            {t('continueToRule')}
          </Button>
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143D7D] py-4 pl-5 pr-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10">
              <Layers3 className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="drawer-title" className="truncate text-base font-extrabold">
                {t('selectServiceForRule')}
              </h2>
              <p className="text-xs text-blue-100">{t('selectServiceForRuleHint')}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('close')}
            onClick={() => onClose()}
            className="shrink-0 rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-[#143D7D]">
              <ListFilter className="size-4" aria-hidden="true" />
              {t('department')} / {t('service')}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-700">{t('department')}</Label>
                <Select
                  className={selectClass}
                  selectSize="sm"
                  value={selectedDepartmentId}
                  ariaLabel={t('department')}
                  placeholder={t('chooseDepartment')}
                  options={[
                    { label: t('chooseDepartment'), value: '' },
                    ...departments.map((item) => ({
                      label: item.departmentName,
                      value: String(item.id),
                    })),
                  ]}
                  onChange={(_, value) => {
                    setSelectedDepartmentId(value);
                    setSelectedServiceId('');
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-700">{t('service')}</Label>
                <Select
                  className={selectClass}
                  selectSize="sm"
                  disabled={!selectedDepartmentId}
                  value={selectedServiceId ? String(selectedServiceId) : ''}
                  ariaLabel={t('service')}
                  placeholder={t('chooseService')}
                  options={[
                    { label: t('chooseService'), value: '' },
                    ...departmentServices.map((item) => ({
                      label: `${item.serviceName} (#${item.id} · ${t('departmentIdLabel', { id: item.departmentId })})`,
                      value: String(item.id),
                    })),
                  ]}
                  onChange={(_, value) => setSelectedServiceId(Number(value) || '')}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Drawer>
  );
}
