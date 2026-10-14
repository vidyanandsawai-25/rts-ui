'use client';
/* eslint-disable i18next/no-literal-string */

import { useState } from 'react';
import { CircleDollarSign, ListFilter, Settings2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  CancelButton,
  Checkbox,
  Drawer,
  Input,
  Label,
  SaveButton,
  Select,
} from '@/components/common';
import {
  saveFeeRuleAction,
  type RuleMasterPageData,
} from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';
import type { RtsFeeRule, SaveRtsFeeRulePayload } from '@/types/rts/rts-rulemaster.types';
import RuleConditionTreeEditor, {
  createPredicate,
  normalizeConditionOrders,
  ruleFieldOption,
} from './RuleConditionTreeEditor';

const inputClass =
  'w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const selectClass =
  'w-full [&_button]:!h-10 [&_button]:!rounded-lg [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!px-3 [&_button]:!text-sm';
const labelClass = 'text-xs font-semibold text-slate-700';
const fieldGroupClass = 'space-y-1.5';

function blank(serviceId: number): SaveRtsFeeRulePayload {
  return {
    serviceId,
    ruleDescription: '',
    ruleActionType: 'BASE_FEE',
    conditionMatchType: 'ALL',
    calculationType: 'FIXED',
    rateAmount: 0,
    quantityFieldDefinitionId: null,
    priority: 1,
    isActive: true,
    conditions: [createPredicate(1)],
  };
}

function fromRule(rule: RtsFeeRule): SaveRtsFeeRulePayload {
  const { id: _id, ...payload } = rule;
  return { ...payload, conditions: normalizeConditionOrders(payload.conditions) };
}

export default function RtsFeeRuleEditorDrawer({
  open,
  rule,
  service,
  fields,
  onClose,
  onSaved,
}: {
  open: boolean;
  rule?: RtsFeeRule;
  service: NonNullable<RuleMasterPageData['service']>;
  fields: RuleMasterPageData['fields'];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<SaveRtsFeeRulePayload>(() =>
    rule ? fromRule(rule) : blank(service.id)
  );
  const [rateAmountInput, setRateAmountInput] = useState(() => String(rule?.rateAmount ?? 0));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isPerUnit = draft.calculationType === 'PER_UNIT';
  const isPerSquareMeter = draft.calculationType === 'PER_SQUARE_METER';
  const isPerSquareFoot = draft.calculationType === 'PER_SQUARE_FOOT';
  const isQuantityBased = isPerUnit || isPerSquareMeter || isPerSquareFoot;
  const isPercentage = draft.calculationType === 'PERCENTAGE';

  const update = <K extends keyof SaveRtsFeeRulePayload>(
    key: K,
    value: SaveRtsFeeRulePayload[K]
  ) => setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    if (busy) return;
    const trimmedRateAmount = rateAmountInput.trim();
    const rateAmount = Number(trimmedRateAmount);
    if (trimmedRateAmount === '' || !Number.isFinite(rateAmount) || rateAmount < 0) {
      setError('Enter a valid non-negative fee amount.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await saveFeeRuleAction(service.id, rule?.id, {
        ...draft,
        rateAmount,
        conditions: normalizeConditionOrders(draft.conditions),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success('Fee rule saved.');
      onSaved();
    } catch {
      setError('Unable to save this fee rule. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={() => !busy && onClose()}
      width="2xl"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <CancelButton label="Cancel" disabled={busy} onClick={onClose} />
          <SaveButton label="Save fee rule" disabled={busy} isLoading={busy} onClick={save} />
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-50">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143D7D] px-5 py-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10">
              <CircleDollarSign className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="drawer-title" className="truncate text-base font-extrabold">
                {rule ? 'Edit fee rule' : 'Create fee rule'}
              </h2>
              <p className="truncate text-[11px] font-semibold text-blue-100">
                {service.serviceName} · Service ID: {service.id}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className="border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
              FEE RULE
            </Badge>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="w-full space-y-3">
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings2 className="size-4 text-blue-600" aria-hidden="true" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">Rule details</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`${fieldGroupClass} sm:col-span-2`}>
                  <Label className={labelClass}>Rule description</Label>
                  <Input className={inputClass} value={draft.ruleDescription} maxLength={200} onChange={(event) => update('ruleDescription', event.target.value)} />
                </div>
                <div className={fieldGroupClass}>
                  <Label className={labelClass}>Fee action</Label>
                  <Select className={selectClass} selectSize="sm" value={draft.ruleActionType} options={[{ label: 'Base fee', value: 'BASE_FEE' }, { label: 'Add-on fee', value: 'ADDON_FEE' }]} onChange={(_, value) => update('ruleActionType', value as SaveRtsFeeRulePayload['ruleActionType'])} />
                </div>
                <div className={fieldGroupClass}>
                  <Label className={labelClass}>Condition logic</Label>
                  <Select className={selectClass} selectSize="sm" value={draft.conditionMatchType} options={[{ label: 'All conditions should match', value: 'ALL' }, { label: 'Any condition can match', value: 'ANY' }]} onChange={(_, value) => update('conditionMatchType', value as SaveRtsFeeRulePayload['conditionMatchType'])} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ListFilter className="size-4 text-blue-600" aria-hidden="true" />
                  <div><h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">When these conditions match</h3><p className="mt-0.5 text-[11px] text-slate-500">Use active fields configured for this service.</p></div>
                </div>
              </div>
              <RuleConditionTreeEditor
                conditions={draft.conditions}
                fields={fields}
                rootConditionMatchType={draft.conditionMatchType}
                onChange={(conditions) => update('conditions', conditions)}
              />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Zap className="size-4 text-blue-600" aria-hidden="true" /><h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">Fee calculation</h3></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={fieldGroupClass}><Label className={labelClass}>Calculation type</Label><Select className={selectClass} selectSize="sm" value={draft.calculationType} options={(draft.ruleActionType === 'ADDON_FEE' ? ['FIXED', 'PER_UNIT', 'PER_SQUARE_METER', 'PER_SQUARE_FOOT', 'PERCENTAGE'] : ['FIXED', 'PER_UNIT', 'PER_SQUARE_METER', 'PER_SQUARE_FOOT']).map((value) => ({ label: value.replace(/_/g, ' '), value }))} onChange={(_, value) => { const calculationType = value as SaveRtsFeeRulePayload['calculationType']; update('calculationType', calculationType); if (!['PER_UNIT', 'PER_SQUARE_METER', 'PER_SQUARE_FOOT'].includes(calculationType)) update('quantityFieldDefinitionId', null); }} /></div>
                <div className={fieldGroupClass}><Label className={labelClass}>{isPercentage ? 'Percentage of base fee' : isPerSquareMeter ? 'Rate per square meter (₹)' : isPerSquareFoot ? 'Rate per square foot (₹)' : isPerUnit ? 'Rate per unit (₹)' : 'Fixed fee (₹)'}</Label><Input className={inputClass} type="number" min="0" step="0.01" value={rateAmountInput} onChange={(event) => setRateAmountInput(event.target.value)} /></div>
                {isQuantityBased && <div className={`${fieldGroupClass} sm:col-span-2`}><Label className={labelClass}>{isPerSquareMeter ? 'Area field (square meters)' : isPerSquareFoot ? 'Area field (square feet)' : 'Quantity field'}</Label><Select className={selectClass} selectSize="sm" value={String(draft.quantityFieldDefinitionId || '')} placeholder="Select numeric field" options={[{ label: 'Select numeric field', value: '' }, ...fields.filter((field) => ['number', 'decimal', 'integer', 'int', 'currency'].includes(field.fieldType.toLowerCase())).map(ruleFieldOption)]} onChange={(_, value) => update('quantityFieldDefinitionId', Number(value) || null)} /></div>}
                {rule && <div className="space-y-1.5"><Label className={labelClass}>Status</Label><div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"><Checkbox checked={draft.isActive} onCheckedChange={(checked) => update('isActive', checked)} />Active rule</div></div>}
              </div>
            </section>
          </div>
        </main>
      </div>
    </Drawer>
  );
}
