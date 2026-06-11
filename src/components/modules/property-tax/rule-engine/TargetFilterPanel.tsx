'use client';

import { RuleScope } from '@/types/rule-engine.types';
import { Input, SearchSelect } from '@/components/common';
import { useTranslations } from 'next-intl';


interface TargetFilterPanelProps {
  ruleName: string;
  setRuleName: (val: string) => void;
  ruleScopeId: number;
  setRuleScopeId: (val: number) => void;
  ruleCategory: string;
  setRuleCategory: (val: string) => void;
  ruleDescription: string;
  setRuleDescription: (val: string) => void;
  scopes: RuleScope[];
  /** API-driven rule category options from PTIS.RuleCategoryMaster */
  ruleCategoryOptions: { label: string; value: string }[];
}

export default function TargetFilterPanel({
  ruleName, setRuleName,
  ruleScopeId, setRuleScopeId,
  ruleCategory, setRuleCategory,
  ruleDescription, setRuleDescription,
  scopes,
  ruleCategoryOptions,
}: TargetFilterPanelProps) {
  const t = useTranslations('ruleEngine');
  const scopeOptions  = scopes.map((s) => ({ label: s.scopeName, value: s.id.toString() }));
  const safeScope = scopeOptions.some((o) => o.value === ruleScopeId.toString())
    ? ruleScopeId.toString()
    : '';



  const safeCategory =
    ruleCategoryOptions.some((o) => o.value === ruleCategory)
      ? ruleCategory
      : '';

  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 border-b border-zinc-100 pb-2 mb-0.5">
        {t('builder.title', { scopeName: '' }).split('Builder')[0].trim() || 'Rule Metadata'}
      </h3>
      <div className="flex flex-col gap-3.5">

        {/* Rule Category — API-driven select */}
        <div>
          <SearchSelect
            label={t('targetFilter.category')}
            options={ruleCategoryOptions}
            value={safeCategory}
            onChange={(_, val) => setRuleCategory(val)}
            placeholder={t('targetFilter.selectCategory')}
            required
          />
        </div>

        {/* Rule Name */}
        <div>
          <Input
            label={t('targetFilter.ruleName')}
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder={t('targetFilter.ruleNamePlaceholder')}
            required
          />
        </div>

        {/* Rule Scope — from API */}
        <div>
          <SearchSelect
            label={t('targetFilter.ruleScope')}
            options={scopeOptions}
            value={safeScope}
            onChange={(_, val) => setRuleScopeId(Number(val))}
            placeholder={t('targetFilter.selectScope')}
            required
          />
        </div>

        {/* Rule Description */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-[13px] font-semibold text-zinc-600">
            {t('targetFilter.description')}
          </label>
          <textarea
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder={t('targetFilter.descriptionPlaceholder')}
            rows={3}
            className="w-full text-sm p-2 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 transition-all resize-none text-zinc-800"
          />
        </div>
      </div>
    </div>
  );
}

