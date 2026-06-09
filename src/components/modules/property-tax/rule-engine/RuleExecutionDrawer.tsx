'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { RuleItem } from '@/types/rule-engine.types';
import { initializeRulesList } from './useRuleBuilderHelpers';
import RuleSchemaPreview from './RuleSchemaPreview';
import RuleSimulatorConsole from './RuleSimulatorConsole';

interface RuleExecutionDrawerProps {
  rule: RuleItem | null;
  open: boolean;
  onClose: () => void;
}

export default function RuleExecutionDrawer({
  rule,
  open,
  onClose,
}: RuleExecutionDrawerProps) {
  const t = useTranslations('ruleEngine');

  // Compute the JSON preview string for display
  const ruleJsonString = React.useMemo(() => {
    if (!rule) return '';
    try {
      const parsedRules = initializeRulesList(rule);
      const schema = {
        ruleCode: rule.ruleCode,
        ruleName: rule.ruleName,
        category: rule.ruleCategory,
        rules: parsedRules,
      };
      return JSON.stringify(schema, null, 2);
    } catch {
      return JSON.stringify(rule, null, 2);
    }
  }, [rule]);

  if (!rule) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2.5 text-[#1E3A8A] font-bold text-base md:text-lg">
          <Terminal className="w-5.5 h-5.5 text-indigo-600 stroke-[2.5]" />
          <span>{t('simulation.consoleTitle', { code: rule.ruleCode })}</span>
        </div>
      }
    >
      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-[#F8FAFF] min-h-[calc(100vh-56px)]">
          {/* ================= LEFT COLUMN: SCHEMA PREVIEW ================= */}
          <RuleSchemaPreview ruleJsonString={ruleJsonString} />

          {/* ================= RIGHT COLUMN: INTERACTIVE CONSOLE ================= */}
          <RuleSimulatorConsole key={rule.id} rule={rule} />
        </div>
      )}
    </Drawer>
  );
}
