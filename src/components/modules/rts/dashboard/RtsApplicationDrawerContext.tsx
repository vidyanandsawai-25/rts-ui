'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import { Badge, Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import {
  getApplicationDetailAction,
  type RtsApplicationDetailData,
} from '@/app/[locale]/rts/dashboard/rts-applications/[id]/actions';

interface DrawerRecord {
  applicationId: number;
  citizenName: string | null;
  submittedDate: string;
  slaLimit: string | number | null;
}

interface Props {
  record: DrawerRecord;
  onClose: () => void;
}

export default function ApplicationDrawerContent({ record, onClose }: Props) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');

  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      try {
        const data = await getApplicationDetailAction(record.applicationId);
        if (!cancelled) setDetail(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [record.applicationId]);

  const documentAnswers = (detail?.answerGroups ?? []).flatMap((group) =>
    group.answers.filter((answer) => answer.documentGuid)
  );

  const workflow = detail?.workflow ?? null;

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

              <div className="font-bold text-slate-800">
                {record.citizenName ?? t('applicationDashboard.drawer.notAvailable')}
              </div>
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
                {record.slaLimit ?? t('applicationDashboard.drawer.notAvailable')}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                {t('applicationDashboard.drawer.slaDeadline')}
              </div>

              <div className="font-bold text-orange-600">
                {workflow?.currentStage
                  ? workflow.currentStage.stageName
                  : t('applicationDashboard.drawer.notAvailable')}
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
          </div>

          {loading ? (
            <div className="rounded-xl border bg-white p-4 text-center text-xs text-slate-400">
              {tCommon('loading.message')}
            </div>
          ) : !workflow || workflow.history.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-center text-xs text-slate-400">
              {t('applicationDetails.noHistory')}
            </div>
          ) : (
            <div className="space-y-5">
              {workflow.history.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    {index !== workflow.history.length - 1 && (
                      <div className="h-full w-[2px] bg-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 rounded-xl border bg-white p-4">
                    <div className="mb-2 flex justify-between">
                      <h4 className="text-[14px] font-bold text-slate-900">
                        {entry.toStageName ?? entry.actionType}
                      </h4>

                      <span className="text-[11px] font-extrabold tracking-wide text-green-600">
                        {new Date(entry.actionDate).toLocaleDateString()}
                      </span>
                    </div>

                    {entry.remark && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-700">
                        &ldquo;{entry.remark}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {workflow.currentStage && (
                <div className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {workflow.history.length + 1}
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl border bg-white p-4">
                    <div className="mb-2 flex justify-between">
                      <h4 className="text-[14px] font-bold text-slate-900">
                        {workflow.currentStage.stageName}
                      </h4>
                      <Badge variant="warning">{tCommon('status.pending')}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Documents */}

        {documentAnswers.length > 0 && (
          <section>
            <h3 className="mb-4 text-xs font-bold text-slate-900">
              {t('applicationDashboard.drawer.submittedDocuments')}
            </h3>

            <div className="space-y-3">
              {documentAnswers.map((doc) => (
                <div
                  key={doc.fieldDefinitionId}
                  className="flex items-center justify-between rounded-xl border bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{doc.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
