'use client';

import { useMemo } from 'react';
import { Database, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  Input,
  SearchSelect,
  MultiSelect,
  SaveButton,
} from '@/components/common';
import { Checkbox } from '@/components/common/checkbox';

import { useFieldRegistryState } from '@/hooks/commonDetailsUpdate/useFieldRegistryState';

interface FieldRegistryFormProps {
  t: (key: string) => string;
  state: ReturnType<typeof useFieldRegistryState>;
}

export const FieldRegistryForm = ({ t, state }: FieldRegistryFormProps) => {
  const {
    sourceTable,
    setSourceTable,
    updateCode,
    setUpdateCode,
    approvalRequired,
    setApprovalRequired,
    fieldConfigs,
    updateFieldConfig,
    tables,
    sourceTableFields,
    loadingTables,
    submitting,
    handleAddFieldToRegistry,
  } = state;

  const tableOptions = useMemo(
    () => tables.map((t) => ({ label: t.tableName, value: String(t.id) })),
    [tables]
  );
  const columnOptions = useMemo(() => {
    return sourceTableFields.map((col) => ({
      value: col.tableFieldName,
      label: col.tableFieldName,
    }));
  }, [sourceTableFields]);

  const disableSave = !updateCode || !sourceTable || submitting;

  return (
    <Card
      variant="default"
      padding="none"
      className="border border-blue-200 rounded-xl overflow-visible bg-white relative z-50"
    >
      <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t('fieldRegistry.addFieldFromDb.title')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('fieldRegistry.addFieldFromDb.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0">
              <Lock className="w-3 h-3 shrink-0" />
              <span>{t('fieldRegistry.authenticatedUserOnly')}</span>
            </div>
            <SaveButton
              size="xs"
              type="button"
              label={t('fieldRegistry.addFieldFromDb.saveFields')}
              onClick={handleAddFieldToRegistry}
              disabled={disableSave}
            />
          </div>
        </div>
      </div>

      <CardContent className="p-2 bg-blue-50/30">
        <div className="flex flex-wrap gap-4 items-end mb-3">
          <div className="w-[250px]">
            <div className="block text-sm font-medium mb-1.5 text-slate-700">
              {t('fieldRegistry.addFieldFromDb.sourceTable')}
            </div>
            <SearchSelect
              value={sourceTable}
              onChange={(_, val) => setSourceTable(val)}
              options={tableOptions}
              placeholder={loadingTables ? '...' : t('fieldRegistry.addFieldFromDb.selectTable')}
            />
          </div>
          
          {fieldConfigs.map((config, index) => (
            <div key={index} className="flex items-end gap-4">
              <div className="w-[240px]">
                <div className="block text-sm font-medium mb-1.5 text-slate-700">
                  {t('fieldRegistry.addFieldFromDb.fieldName')} <span className="text-red-500 ml-0.5">*</span>
                </div>
                <MultiSelect
                  id={`field-name-${index}`}
                  value={config.fieldName}
                  onChange={(val) => {
                    const oldFirstVal = (config.fieldName && config.fieldName.length > 0) ? config.fieldName[0] : '';
                    const newFirstVal = (val && val.length > 0) ? val[0] : '';
                    
                    updateFieldConfig(index, {
                      fieldName: val,
                    });

                    if (newFirstVal && (!updateCode || updateCode === oldFirstVal)) {
                      setUpdateCode(newFirstVal);
                    }
                  }}
                  options={columnOptions}
                  placeholder={t('fieldRegistry.addFieldFromDb.selectFieldName') || 'Select Field Name'}
                  disabled={submitting || !sourceTable}
                  className="text-sm [&>button]:h-9 [&>button]:py-1.5 [&>button:disabled]:opacity-60 [&>div.absolute]:!max-h-65 [&>div.absolute>div[role=listbox]]:!max-h-40"
                />
              </div>
            </div>
          ))}

          <div className="w-[200px]">
            <div className="block text-sm font-medium mb-1.5 text-slate-700">
              {t('fieldRegistry.addFieldFromDb.updateCode')} <span className="text-red-500 ml-0.5">*</span>
            </div>
            <Input
              required
              type="text"
              value={updateCode}
              onChange={(e) => setUpdateCode(e.target.value)}
              placeholder={t('fieldRegistry.addFieldFromDb.updateNamePlaceholder')}
              className="w-full h-9 text-slate-900"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium select-none h-9">
            <Checkbox
              checked={approvalRequired}
              onCheckedChange={(checked) => setApprovalRequired(Boolean(checked))}
              disabled={submitting}
              className="data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
            />
            {t('fieldRegistry.addFieldFromDb.isApprovalRequired')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
