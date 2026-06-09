'use client';

import React from 'react';
import { Play, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common/ActionButton';
import { Input } from '@/components/common/Input';
import { RuleItem } from '@/types/rule-engine.types';
import { ApiResponse } from '@/types/common.types';
import { extractRuleParameters } from './useRuleBuilderHelpers';
import { executeRuleAction } from '@/app/[locale]/property-tax/rule-engine/actions';

interface RuleSimulatorConsoleProps {
  rule: RuleItem;
}

interface InputRow {
  key: string;
  value: string;
  isExtracted: boolean;
}

export default function RuleSimulatorConsole({ rule }: RuleSimulatorConsoleProps) {
  const t = useTranslations('ruleEngine');
  const [loading, setLoading] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<ApiResponse<unknown> | null>(null);

  const [inputs, setInputs] = React.useState<InputRow[]>(() => {
    const extracted = extractRuleParameters(rule);
    const initialRows: InputRow[] = extracted.map((field) => ({
      key: field,
      value: '',
      isExtracted: true,
    }));
    return initialRows.length === 0 ? [{ key: '', value: '', isExtracted: false }] : initialRows;
  });

  const handleAddRow = () => {
    setInputs((prev) => [...prev, { key: '', value: '', isExtracted: false }]);
  };

  const handleRemoveRow = (index: number) => {
    setInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: 'key' | 'value', val: string) => {
    setInputs((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: val } : row))
    );
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setExecutionResult(null);

    const payload: Record<string, string> = {};
    inputs.forEach((row) => {
      const trimmedKey = row.key.trim();
      if (trimmedKey) {
        payload[trimmedKey] = row.value;
      }
    });

    try {
      const response = await executeRuleAction(rule.ruleCategory || 'ALL', payload);
      setExecutionResult(response);
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete execution',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-5 border border-blue-100 rounded-xl shadow-sm h-fit">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-sm font-semibold text-gray-800">{t('simulation.simulator')}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('simulation.simulatorHint')}
        </p>
      </div>

      {/* Test Inputs list */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 px-1">
          <span className="col-span-5">{t('simulation.parameterName')}</span>
          <span className="col-span-6">{t('simulation.simulationValue')}</span>
          <span className="col-span-1"></span>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {inputs.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  placeholder="e.g. usageType"
                  value={row.key}
                  onChange={(e) => handleRowChange(index, 'key', e.target.value)}
                  disabled={row.isExtracted}
                  className={row.isExtracted ? 'bg-gray-50 font-mono text-xs text-gray-600 font-bold border-gray-200' : 'font-mono text-xs'}
                />
              </div>
              <div className="col-span-6">
                <Input
                  placeholder="Input value..."
                  value={row.value}
                  onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {!row.isExtracted ? (
                  <button
                    onClick={() => handleRemoveRow(index)}
                    title="Delete parameter"
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-gray-300" title="Auto-extracted from rule block criteria">
                    <HelpCircle className="w-4 h-4 text-gray-350" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddRow}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition w-fit mt-1.5 px-2 py-1 rounded hover:bg-indigo-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('simulation.addCustomParameter')}</span>
        </button>
      </div>

      <Button
        variant="primary"
        onClick={handleRunSimulation}
        isLoading={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-medium py-2.5 rounded-lg shadow-sm active:scale-[0.99]"
        icon={Play}
      >
        {t('simulation.runSimulation')}
      </Button>

      {/* Results panel */}
      {executionResult && (
        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-700">{t('simulation.resultOutput')}</h4>
          
          {executionResult.success !== false ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('simulation.successMessage')}</span>
              </div>
              <pre className="text-[11px] bg-slate-950 text-slate-350 p-4 rounded-lg overflow-auto max-h-[200px] font-mono leading-relaxed select-text border border-slate-800 shadow-inner">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{t('simulation.failureMessage')}</span>
              </div>
              <pre className="text-[11px] bg-rose-950 text-rose-250 p-4 rounded-lg overflow-auto max-h-[160px] font-mono leading-relaxed select-text border border-rose-900 shadow-inner">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
