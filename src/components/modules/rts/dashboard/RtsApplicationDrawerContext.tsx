'use client';

import { Download, FileText } from 'lucide-react';

import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';

interface Props {
  record: any;
  onClose: () => void;
}

export default function ApplicationDrawerContent({ record, onClose }: Props) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');
  const stages = [
    {
      title: t('applicationDashboard.drawer.stages.applicationSubmitted.title'),
      status: t('applicationDashboard.drawer.stages.applicationSubmitted.status'),
      remark: t('applicationDashboard.drawer.stages.applicationSubmitted.remark'),
      complete: true,
    },
    {
      title: t('applicationDashboard.drawer.stages.documentVerification.title'),
      status: t('applicationDashboard.drawer.stages.documentVerification.status'),
      remark: t('applicationDashboard.drawer.stages.documentVerification.remark'),
      complete: false,
    },
    {
      title: t('applicationDashboard.drawer.stages.finalApproval.title'),
      status: t('applicationDashboard.drawer.stages.finalApproval.status'),
      remark: t('applicationDashboard.drawer.stages.finalApproval.remark'),
      complete: false,
    },
  ];
  const documents = [
    {
      name: t('applicationDashboard.drawer.documents.identityProof.name'),
      size: t('applicationDashboard.drawer.documents.identityProof.size'),
    },
    {
      name: t('applicationDashboard.drawer.documents.ownershipDeed.name'),
      size: t('applicationDashboard.drawer.documents.ownershipDeed.size'),
    },
    {
      name: t('applicationDashboard.drawer.documents.fireNoc.name'),
      size: t('applicationDashboard.drawer.documents.fireNoc.size'),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6 p-5">
        {/* Details */}

        <section className="rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide text-slate-700">
              {t('applicationDashboard.drawer.applicationDetails')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-5 text-sm">
            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                {t('applicationDashboard.drawer.applicantName')}
              </div>

              <div className="font-bold text-slate-800">{record.citizenName}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                {t('applicationDashboard.drawer.submittedDate')}
              </div>

              <div className="text-[15px] font-bold text-slate-900">{record.submittedDate}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                {t('applicationDashboard.drawer.slaTimeline')}
              </div>

              <div className="font-bold text-blue-600">
                {t('applicationDashboard.units.days', { value: record.slaLimit })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                {t('applicationDashboard.drawer.slaDeadline')}
              </div>

              <div className="font-bold text-orange-600">
                {t('applicationDashboard.drawer.notAvailable')}
              </div>
            </div>
          </div>
        </section>

        {/* Approval */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
              {t('applicationDashboard.drawer.approvalStages')}
            </h3>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {t('applicationDashboard.drawer.completion')}
            </span>
          </div>

          <div className="space-y-5">
            {stages.map((stage, index) => (
              <div key={stage.title} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${
                      stage.complete ? 'bg-green-600' : 'bg-orange-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {index !== stages.length - 1 && <div className="h-full w-[2px] bg-slate-200" />}
                </div>

                <div className="flex-1 rounded-xl border bg-white p-4">
                  <div className="mb-2 flex justify-between">
                    <h4 className="text-[14px] font-bold text-slate-900">{stage.title}</h4>

                    <span
                      className={`text-[11px] font-extrabold tracking-wide ${
                        stage.complete ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-700">
                    "{stage.remark}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}

        <section>
          <h3 className="mb-4 text-xs font-bold text-slate-900">
            {t('applicationDashboard.drawer.submittedDocuments')}
          </h3>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-xl border bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <div className="text-[14px] font-bold text-slate-900">{doc.name}</div>

                    <div className="text-xs font-medium text-slate-600">{doc.size}</div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={t('applicationDashboard.drawer.downloadDocument', {
                    name: doc.name,
                  })}
                  title={t('applicationDashboard.drawer.downloadDocument', {
                    name: doc.name,
                  })}
                  className="rounded-lg border p-2 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-auto border-t bg-white p-5">
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {tCommon('buttons.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
