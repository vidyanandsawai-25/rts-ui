'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/common/Modal';
import { OkButton } from '@/components/common/ActionButtons';
import { ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface ChargeHeadUserManualModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChargeHeadUserManualModal({
  open,
  onClose,
}: ChargeHeadUserManualModalProps) {
  const t = useTranslations('chargeHeads');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>{t('userManualModal.title')}</span>
        </div>
      }
      maxWidth="lg"
      footer={<OkButton onClick={onClose} />}
    >
      <div className="space-y-5 text-slate-700 text-sm">
        {/* Intro */}
        <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium">
          {t('userManualModal.intro')}
        </p>

        {/* Visual Workflow Cards */}
        <div className="bg-blue-50/50 border border-blue-100/80 rounded-xl p-4">
          <div className="flex items-center justify-center gap-3">
            {/* Card 1 */}
            <div className="flex-1 bg-white border border-blue-200/80 rounded-lg p-3 flex items-start gap-2.5 shadow-2xs">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900">{t('userManualModal.card1.title')}</div>
                <div className="text-[11px] text-slate-500 font-medium">{t('userManualModal.card1.subtitle')}</div>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />

            {/* Card 2 */}
            <div className="flex-1 bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 flex items-start gap-2.5 shadow-2xs">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-emerald-950">{t('userManualModal.card2.title')}</div>
                <div className="text-[11px] text-emerald-700 font-medium">{t('userManualModal.card2.subtitle')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Numbered Core Points */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </span>
            <p className="leading-normal">
              <strong className="font-semibold text-slate-900">{t('userManualModal.point1.title')}</strong> – {t('userManualModal.point1.text')}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </span>
            <p className="leading-normal">
              <strong className="font-semibold text-slate-900">{t('userManualModal.point2.title')}</strong> – {t('userManualModal.point2.text')}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </span>
            <p className="leading-normal">
              <strong className="font-semibold text-slate-900">{t('userManualModal.point3.title')}</strong> – {t('userManualModal.point3.text')}
            </p>
          </div>
        </div>

        {/* Note Box */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-3 text-xs text-amber-900 leading-relaxed font-medium">
          {t('userManualModal.note')}
        </div>
      </div>
    </Modal>
  );
}
