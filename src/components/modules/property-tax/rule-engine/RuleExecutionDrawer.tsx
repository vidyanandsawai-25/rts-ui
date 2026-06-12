'use client';

import { Terminal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { RuleItem } from '@/types/rule-engine.types';
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

  if (!rule) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-2.5 text-[#1E3A8A] font-bold text-base md:text-lg">
          <Terminal className="w-5.5 h-5.5 text-indigo-600 stroke-[2.5]" />
          <span>{t('simulation.consoleTitle', { code: rule.ruleCode })}</span>
        </div>
      }
    >
      {open && (
        <div className="p-6 bg-[#F8FAFF] min-h-[calc(100vh-56px)]">
          {/* ================= INTERACTIVE CONSOLE ================= */}
          <RuleSimulatorConsole key={rule.id} rule={rule} />
        </div>
      )}
    </Drawer>
  );
}
