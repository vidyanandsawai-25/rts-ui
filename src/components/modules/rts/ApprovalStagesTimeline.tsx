import { CheckCircle2, Clock, XCircle } from 'lucide-react';
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
}

interface ApprovalStagesTimelineProps {
  stages: StageItem[];
  completedCount?: number;
  currentStageIndex?: number;
  isLoading?: boolean;
}

type StageVisualState = 'completed' | 'current' | 'rejected' | 'returned' | 'pending';

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

  // A terminal decision stops visual progression, even if the backend marks a
  // later pending stage as current in the same response.
  if (terminalStageIndex >= 0 && index > terminalStageIndex) return 'pending';

  // Backend status takes priority over aggregate completed counts.
  if (status.includes('reject')) return 'rejected';
  if (status.includes('return') || status.includes('revert')) return 'returned';
  if (status.includes('in progress')) return 'current';
  if (isCorrectionRequiredStatus(status)) {
    return !allCompleted && index === activeIndex ? 'current' : 'pending';
  }
  if (status.includes('pending')) {
    return !allCompleted && index === activeIndex ? 'current' : 'pending';
  }

  // The approval API uses success values such as "Document Verified" in
  // addition to "Approved". Any other non-empty, non-pending status is a
  // completed stage unless it was handled as a terminal decision above.
  if (status) {
    return 'completed';
  }

  // Preserve the aggregate fallback for legacy payloads without stage status.
  if (!allCompleted && index === activeIndex) return 'current';
  if (index < completedCount) return 'completed';
  return 'pending';
}

/**
 * Decodes double-encoded UTF-8 string sequences from API responses (e.g. Marathi text).
 * Example: "Clerk Verification / à¤•à¥..." -> "Clerk Verification / क्लार्क पडपाळणी"
 */
export function cleanStageName(name: string): string {
  if (!name) return 'Approval Stage';
  try {
    const bytes = Uint8Array.from([...name].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (decoded && !decoded.includes('à')) {
      return decoded;
    }
  } catch {
    // Fallback if byte decoding fails
  }
  return name;
}

export function ApprovalStagesTimeline({
  stages,
  completedCount = 0,
  currentStageIndex,
  isLoading = false,
}: ApprovalStagesTimelineProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 font-medium">
        Loading approval workflow stages...
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400 font-medium">
        No approval workflow stages configured.
      </div>
    );
  }

  // Determine current active stage index
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

        const displayName = cleanStageName(stage.stageName);
        const remark = stage.remark?.trim() || 'No remarks';

        return (
          <div key={stage.id || idx} className="flex items-stretch gap-3 group">
            <div className="flex w-6 shrink-0 flex-col items-center">
              {/* Step marker and its connector share one aligned flex column. */}
              <div
                className={`z-10 flex size-5 mt-2 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-100'
                    : isCurrent
                    ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 animate-pulse'
                    : isRejected
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-100'
                    : isReturned
                    ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="size-3.5 stroke-[2.5]" />
                ) : isRejected ? (
                  <XCircle className="size-4 stroke-[2.5]" />
                ) : (
                  <span>{stage.stageOrder || idx + 1}</span>
                )}
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

            {/* Stage Card */}
            <div
              className={`${idx < stages.length - 1 ? 'mb-2' : ''} flex-1 rounded-xl border py-2 px-3 text-xs transition-all ${
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
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="font-bold text-slate-800 text-[13px] leading-snug break-words" title={displayName}>
                    {displayName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                    <span>{remark}</span>
                    {stage.slaDays != null && (
                      <>
                        <span>•</span>
                        <span>SLA: {stage.slaDays} Days</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={badgeVariant}
                  size="sm"
                  className="h-5 min-w-[64px] shrink-0 justify-center px-2 text-[8px] font-bold uppercase tracking-normal"
                >
                  {statusText}
                </Badge>
              </div>

              {/* Officer / Role info if available */}
              {(stage.assignedToName || stage.assignedRole) && (
                <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500">Assigned:</span>
                  <span className="font-bold text-slate-700">
                    {stage.assignedToName} {stage.assignedRole ? `(${stage.assignedRole})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
