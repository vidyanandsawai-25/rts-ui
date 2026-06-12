'use client';

import { useTranslations } from 'next-intl';
import { BarChart3, BookOpen, ChevronRight, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAddTaxesConsole } from '@/hooks/addTaxes/useAddTaxesConsole';
import { AddTaxesConsoleProps } from '@/types/add-taxes.types';
import { ContextCard } from './panels/ContextCard';
import { KpiCards } from './panels/KpiCards';
import { BackgroundTaskBar } from './runtime/BackgroundTaskBar';
import { ManualSelectionTab } from './tabs/ManualSelectionTab';
import { AiAssistantTab } from './tabs/AiAssistantTab';
import { ExcelImportTab } from './tabs/ExcelImportTab';
import { AuditMonitorTab } from './tabs/AuditMonitorTab';
import { ReviewModal } from './modal/ReviewModal';

const TABS = ['manual', 'ai', 'excel', 'audit'] as const;

export function AddTaxesConsole({ init }: AddTaxesConsoleProps) {
  const t = useTranslations('addTaxes');
  const api = useAddTaxesConsole({ init });

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Home className="h-3.5 w-3.5" />
        <span>{t('breadcrumb.home')}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{t('breadcrumb.propertyTax')}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-gray-900">{t('breadcrumb.current')}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            {t('actions.guidelines')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <BookOpen className="h-4 w-4" />
            {t('actions.userManual')}
          </button>
          <button
            type="button"
            onClick={() => api.goToTab('audit')}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <BarChart3 className="h-4 w-4" />
            {t('actions.auditTrail')}
          </button>
        </div>
      </div>

      {/* Context card (FY + options + permission) */}
      <ContextCard api={api} />

      {/* KPI metrics */}
      <KpiCards api={api} />

      {/* Background task bar */}
      <BackgroundTaskBar api={api} />

      {/* Tab navigation */}
      <nav className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => api.goToTab(tab)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              api.activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {t(`tabs.${tab === 'audit' ? 'audit' : tab}`)}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div>
        {api.activeTab === 'manual' && <ManualSelectionTab api={api} />}
        {api.activeTab === 'ai' && <AiAssistantTab api={api} />}
        {api.activeTab === 'excel' && <ExcelImportTab api={api} />}
        {api.activeTab === 'audit' && <AuditMonitorTab api={api} />}
      </div>

      {/* Review & Execute modal */}
      {api.reviewOpen && <ReviewModal api={api} />}
    </div>
  );
}
