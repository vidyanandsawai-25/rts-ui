import React from 'react';
import {
  MapPin,
  ClipboardCheck,
  FileEdit,
  Calculator,
  Building2,
  Send,
  Scale,
  Receipt,
  Printer,
  Award,
  Home,
  Zap,
  Droplet,
  ShieldCheck,
  Building,
  Link,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  WorkflowStageDto,
  CertificateTypeDto,
  ApartmentQCTopSectionBelowFlexResponseDto,
  ApartmentQCTopSectionBelowFlexItemsDto,
} from '@/types/property-tax/apartment';

export interface PtisStatusBadgeItem {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColorClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

const ICON_SIZE_CLASS = 'w-3.5 h-3.5';

/** Keyword-to-Icon lookup mapping table for efficient rule matching */
const ICON_KEYWORD_RULES: ReadonlyArray<readonly [readonly string[], React.ReactNode]> = [
  [['geo', 'gis', 'sequence', 'location'], <MapPin key="gis" className={ICON_SIZE_CLASS} />],
  [['survey', 'internal'], <ClipboardCheck key="survey" className={ICON_SIZE_CLASS} />],
  [['data', 'entry', 'edit'], <FileEdit key="data" className={ICON_SIZE_CLASS} />],
  [['assess'], <Calculator key="assess" className={ICON_SIZE_CLASS} />],
  [['ulb', 'approval'], <Building2 key="ulb" className={ICON_SIZE_CLASS} />],
  [['notice', 'distribut', 'mail'], <Send key="notice" className={ICON_SIZE_CLASS} />],
  [['hearing', 'appeal', 'court'], <Scale key="hearing" className={ICON_SIZE_CLASS} />],
  [['recovery', 'collection', 'wallet'], <Receipt key="recovery" className={ICON_SIZE_CLASS} />],
  [['bill', 'generation', 'invoice'], <Printer key="bill" className={ICON_SIZE_CLASS} />],
  [['completion'], <Award key="completion" className={ICON_SIZE_CLASS} />],
  [['occupancy', 'possession'], <Home key="occupancy" className={ICON_SIZE_CLASS} />],
  [['electric', 'power'], <Zap key="electric" className={ICON_SIZE_CLASS} />],
  [['water'], <Droplet key="water" className={ICON_SIZE_CLASS} />],
  [['fire', 'noc'], <ShieldCheck key="fire" className={ICON_SIZE_CLASS} />],
  [['trade', 'license'], <Building key="trade" className={ICON_SIZE_CLASS} />],
  [['bpms', 'link'], <Link key="bpms" className={ICON_SIZE_CLASS} />],
] as const;

/** Optimized helper function to return contextual Lucide icons based on stage/certificate name */
export function getWorkflowContextIcon(name: string, isCompletedOrIssued: boolean): React.ReactNode {
  const norm = (name || '').toLowerCase().trim();
  if (!norm) {
    return isCompletedOrIssued ? <CheckCircle2 className={ICON_SIZE_CLASS} /> : <Clock className={ICON_SIZE_CLASS} />;
  }

  const match = ICON_KEYWORD_RULES.find(([keywords]) =>
    keywords.some((kw) => norm.includes(kw))
  );

  if (match) return match[1];

  return isCompletedOrIssued ? <CheckCircle2 className={ICON_SIZE_CLASS} /> : <Clock className={ICON_SIZE_CLASS} />;
}

/** Default empty badges array to prevent rendering static hardcoded dummy data */
export const DEFAULT_STATUS_BADGES: PtisStatusBadgeItem[] = [];

/** Dynamic utility to build badge items array from backend workflow API payload only */
export function buildBadgesFromPayload(
  payload: Record<string, unknown> | ApartmentQCTopSectionBelowFlexResponseDto | ApartmentQCTopSectionBelowFlexItemsDto | null | undefined
): PtisStatusBadgeItem[] {
  if (!payload) return [];

  const rawObj = payload as Record<string, unknown>;
  const source = (rawObj.items ?? rawObj.data ?? rawObj) as Record<string, unknown>;

  const stages = Array.isArray(source?.workflowStages) ? (source.workflowStages as WorkflowStageDto[]) : [];
  const certs = Array.isArray(source?.certificateTypes) ? (source.certificateTypes as CertificateTypeDto[]) : [];

  if (stages.length === 0 && certs.length === 0) return [];

  const mappedBadges: PtisStatusBadgeItem[] = new Array(stages.length + certs.length);
  let index = 0;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isDone = Boolean(stage.isCompleted);
    mappedBadges[index++] = {
      id: `stage-${stage.stageId}`,
      label: stage.stageName,
      value: isDone ? 'Completed' : 'Pending',
      icon: getWorkflowContextIcon(stage.stageName, isDone),
      valueColorClass: isDone ? 'text-emerald-600' : 'text-amber-600',
      iconBgClass: isDone ? 'bg-emerald-50' : 'bg-amber-50',
      iconColorClass: isDone ? 'text-emerald-600' : 'text-amber-600',
    };
  }

  for (let i = 0; i < certs.length; i++) {
    const cert = certs[i];
    const isIssued = Boolean(cert.isIssued);
    mappedBadges[index++] = {
      id: `cert-${cert.certificateTypeId}`,
      label: cert.certificateTypeName,
      value: isIssued ? 'Issued' : 'Not Issued',
      icon: getWorkflowContextIcon(cert.certificateTypeName, isIssued),
      valueColorClass: isIssued ? 'text-emerald-600' : 'text-rose-600',
      iconBgClass: isIssued ? 'bg-emerald-50' : 'bg-rose-50',
      iconColorClass: isIssued ? 'text-emerald-600' : 'text-rose-600',
    };
  }

  return mappedBadges;
}
