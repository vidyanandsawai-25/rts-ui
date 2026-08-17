'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, UserRoundPen, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, type BadgeVariant } from '@/components/common/Badge';

export interface StageItem {
  id: number | string;
  stageName: string;
  stageOrder: number;
  slaDays?: number;
  assignedRole?: string;
  assignedToName?: string;
  status?: string;
  remark?: string | null;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdDate?: string | null;
}

interface ApprovalStagesTimelineProps {
  stages: StageItem[];
  completedCount?: number;
  currentStageIndex?: number;
  isLoading?: boolean;
}

type StageVisualState = 'completed' | 'current' | 'rejected' | 'returned' | 'pending';

const OFFICER_DETAIL_LABELS = {
  approvedBy: 'Approve by:',
  officerName: 'Officer name:',
  noStages: 'No approval workflow stages configured.',
  slaPrefix: 'SLA:',
  days: 'Days',
  time: 'Time:',
};

function getNormalizedStatus(stage: StageItem): string {
  return stage.status?.trim().toLowerCase() ?? '';
}

function isTerminalStatus(status: string): boolean {
  return status.includes('reject') || status.includes('return') || status.includes('revert');
}

function isCorrectionRequiredStatus(status: string): boolean {
  return (
    status.includes('minor correction') ||
    status.includes('minor change') ||
    status.includes('correction required') ||
    status.includes('verification required')
  );
}

function getStageVisualState(
  stage: StageItem,
  index: number,
  completedCount: number,
  activeIndex: number,
  allCompleted: boolean,
  terminalStageIndex: number
): StageVisualState {
  const status = getNormalizedStatus(stage);

  // A terminal decision stops visual progression, even if a later stage is current.
  if (terminalStageIndex >= 0 && index > terminalStageIndex) return 'pending';
  if (status.includes('reject')) return 'rejected';
  if (status.includes('return') || status.includes('revert')) return 'returned';
  if (status.includes('in progress')) return 'current';
  if (isCorrectionRequiredStatus(status)) {
    return !allCompleted && index === activeIndex ? 'current' : 'pending';
  }
  if (status.includes('pending')) {
    return !allCompleted && index === activeIndex ? 'current' : 'pending';
  }

  // API success values include "Document Verified" as well as "Approved".
  if (status) return 'completed';
  if (!allCompleted && index === activeIndex) return 'current';
  if (index < completedCount) return 'completed';
  return 'pending';
}

/** Decodes double-encoded UTF-8 stage names returned by older API payloads. */
export function cleanStageName(name: string): string {
  if (!name) return 'Approval Stage';
  try {
    const bytes = Uint8Array.from([...name].map((character) => character.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (decoded && !decoded.includes('Ã ')) return decoded;
  } catch {
    // Use the API value when it is not an encoded string.
  }
  return name;
}

function formatStageDate(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatStageTime(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ApprovalStagesTimeline({
  stages,
  completedCount = 0,
  currentStageIndex,
  isLoading = false,
}: ApprovalStagesTimelineProps) {
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return <div className="py-8 text-center text-xs font-medium text-slate-400">Loading approval workflow stages...</div>;
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-medium text-slate-400">
        {OFFICER_DETAIL_LABELS.noStages}
      </div>
    );
  }

  const allCompleted = completedCount >= stages.length;
  const activeIdx = currentStageIndex ?? (allCompleted ? stages.length : completedCount);
  const terminalStageIndex = stages.findIndex((stage) => isTerminalStatus(getNormalizedStatus(stage)));

  return (
    <div className="flex flex-col">
      {stages.map((stage, idx) => {
        const visualState = getStageVisualState(
          stage,
          idx,
          completedCount,
          activeIdx,
          allCompleted,
          terminalStageIndex
        );
        const isCompleted = visualState === 'completed';
        const isCurrent = visualState === 'current';
        const isRejected = visualState === 'rejected';
        const isReturned = visualState === 'returned';
        const stageKey = String(stage.id || idx);
        const isExpanded = Boolean(expandedStages[stageKey]);
        const displayName = cleanStageName(stage.stageName);
        const remark = stage.remark?.trim() || 'No remarks';
        const recordedDate = formatStageDate(stage.createdDate);
        const recordedTime = formatStageTime(stage.createdDate);
        const officerRole = stage.userName?.trim() || stage.assignedRole?.trim() || '';
        const officerName = [stage.firstName, stage.lastName]
          .filter((value): value is string => Boolean(value?.trim()))
          .join(' ') || stage.assignedToName?.trim() || '';
        const hasOfficerDetails = Boolean(officerRole || officerName);

        let statusText = stage.status || 'Pending';
        let badgeVariant: BadgeVariant = 'secondary';
        if (isRejected) {
          statusText = stage.status || 'Rejected';
          badgeVariant = 'destructive';
        } else if (isReturned) {
          statusText = stage.status || 'Returned';
          badgeVariant = 'warning';
        } else if (isCompleted) {
          statusText = 'Passed';
          badgeVariant = 'success';
        } else if (isCurrent) {
          statusText = 'In Progress';
          badgeVariant = 'warning';
        }

        return (
          <div key={stageKey} className="group flex items-stretch gap-3">
            <div className="flex w-6 shrink-0 flex-col items-center">
              <div
                className={`z-10 mt-2 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-100'
                    : isCurrent
                      ? 'animate-pulse bg-amber-500 text-white shadow-md ring-4 ring-amber-100'
                      : isRejected
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-100'
                        : isReturned
                          ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-100'
                          : 'border border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="size-4 stroke-[2.5]" /> : isCurrent ? <Clock className="size-3.5 stroke-[2.5]" /> : isRejected ? <XCircle className="size-4 stroke-[2.5]" /> : <span>{stage.stageOrder || idx + 1}</span>}
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`mt-2 w-0.5 flex-1 transition-colors ${
                    isRejected
                      ? 'bg-rose-500'
                      : isReturned || isCurrent
                        ? 'bg-amber-400'
                        : isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            <div
              className={`${idx < stages.length - 1 ? 'mb-2' : ''} flex-1 rounded-xl border text-xs transition-all ${
                isCurrent
                  ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                  : isRejected
                    ? 'border-rose-200 bg-rose-50/60 shadow-sm'
                    : isReturned
                      ? 'border-orange-200 bg-orange-50/60 shadow-sm'
                      : isCompleted
                        ? 'border-emerald-100 bg-emerald-50/20'
                        : 'border-slate-100 bg-slate-50/60'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedStages((current) => ({ ...current, [stageKey]: !isExpanded }))}
                aria-expanded={isExpanded}
                className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="break-words text-[13px] font-bold leading-snug text-slate-800" title={displayName}>
                    {displayName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                    <span>{remark}</span>
                    {stage.slaDays != null && (
                      <>
                        <span>•</span>
                        <span>{OFFICER_DETAIL_LABELS.slaPrefix} {stage.slaDays} {OFFICER_DETAIL_LABELS.days}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-start gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={badgeVariant}
                      size="sm"
                      className="h-5 min-w-[64px] justify-center px-2 text-[8px] font-bold uppercase tracking-normal"
                    >
                      {statusText}
                    </Badge>
                    {recordedDate && <span className="text-[10px] font-medium text-slate-500">{recordedDate}</span>}
                  </div>
                  {isExpanded ? <ChevronUp className="mt-0.5 size-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="mt-0.5 size-4 text-slate-500" aria-hidden="true" />}
                </div>
              </button>

              {isExpanded && (recordedTime || hasOfficerDetails) && (
                <div className="mx-3 border-t border-slate-200/80 py-2.5 text-[11px]">
                  {recordedTime && (
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="size-3 text-slate-500" aria-hidden="true" />
                      <span className="font-semibold text-slate-500">{t('time')}</span>
                      <span className="font-bold text-slate-800">{recordedTime}</span>
                    </p>
                  )}
                  {/* {officerRole && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-500">{OFFICER_DETAIL_LABELS.approvedBy} </span>
                      <span className="font-bold text-slate-800">{officerRole}</span>
                    </p>
                  )} */}
                  {officerName && (
                    <p className={`${recordedTime ? 'mt-1.5' : 'mt-1'} flex items-center gap-1.5 text-slate-600`}>
                      <UserRoundPen className="size-3 text-slate-500" aria-hidden="true" />
                      <span className="font-semibold text-slate-500">{t('officerName')} </span>
                      <span className="font-bold text-slate-800">{officerName}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
