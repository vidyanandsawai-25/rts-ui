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
  { key: 'assessment', icon: Home, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
  { key: 'amc', icon: BarChart2, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
  { key: 'transaction', icon: CreditCard, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
  { key: 'approval', icon: CheckCircle, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
  { key: 'discount', icon: Tag, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
  { key: 'others', icon: MoreHorizontal, color: 'text-[#800000]', bgColor: 'bg-transparent', borderColor: 'border-[#800000]', glowClass: 'shadow-[#800000]/20', iconBg: 'bg-transparent' },
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
