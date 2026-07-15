import type { ReportDefinition } from '@/types/report.types';
import {
  Home,
  BarChart2,
  CreditCard,
  CheckCircle,
  Tag,
  MoreHorizontal,
} from 'lucide-react';

// Sirf non-assessment reports yahan specifically map karo.
// Assessment DEFAULT hai — jo bhi yahan nahi hai woh automatically Assessment mein jayega.
// Example: AMC reports add karne ho to: amc: ['AmcSlip', 'AmcDemand']
export const REPORT_CODES_BY_CATEGORY: Record<string, string[]> = {
  amc: [],
  transaction: [],
  approval: [],
  discount: [],
};

export type Step = 1 | 2 | 3;

export interface Category {
  key: string;
  icon: React.ElementType;
  color: string;      // text class e.g. text-blue-600
  bgColor: string;    // background class e.g. bg-blue-50
  borderColor: string;// border class e.g. border-blue-500
  glowClass: string;  // shadow class e.g. shadow-blue-100
  iconBg: string;     // icon wrapper bg e.g. bg-blue-100
}

export const CATEGORIES: Category[] = [
  { key: 'assessment', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50/70', borderColor: 'border-blue-500', glowClass: 'shadow-blue-100/70', iconBg: 'bg-blue-100' },
  { key: 'amc', icon: BarChart2, color: 'text-amber-600', bgColor: 'bg-amber-50/70', borderColor: 'border-amber-500', glowClass: 'shadow-amber-100/70', iconBg: 'bg-amber-100' },
  { key: 'transaction', icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-50/70', borderColor: 'border-emerald-500', glowClass: 'shadow-emerald-100/70', iconBg: 'bg-emerald-100' },
  { key: 'approval', icon: CheckCircle, color: 'text-indigo-600', bgColor: 'bg-indigo-50/70', borderColor: 'border-indigo-500', glowClass: 'shadow-indigo-100/70', iconBg: 'bg-indigo-100' },
  { key: 'discount', icon: Tag, color: 'text-rose-600', bgColor: 'bg-rose-50/70', borderColor: 'border-rose-500', glowClass: 'shadow-rose-100/70', iconBg: 'bg-rose-100' },
  { key: 'others', icon: MoreHorizontal, color: 'text-slate-600', bgColor: 'bg-slate-50/70', borderColor: 'border-slate-500', glowClass: 'shadow-slate-100/70', iconBg: 'bg-slate-100' },
];

export function resolveCategoryKey(report: ReportDefinition): string {
  const rawReport = report as ReportDefinition & Record<string, unknown>;
  const reportCode = String(
    rawReport.reportCode ?? rawReport.ReportCode ?? rawReport.code ?? rawReport.Code ?? ''
  ).trim();
  const normalizedReportCode = reportCode.toLowerCase().replace(/[_\s-]+/g, '');

  const codeMatch = CATEGORIES.find((cat) =>
    cat.key !== 'others' &&
    cat.key !== 'assessment' &&
    REPORT_CODES_BY_CATEGORY[cat.key]?.some((code) =>
      normalizedReportCode === code.toLowerCase().replace(/[_\s-]+/g, '')
    )
  );

  if (codeMatch) return codeMatch.key;
  return 'assessment';
}
