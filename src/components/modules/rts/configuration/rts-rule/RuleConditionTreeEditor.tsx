'use client';
/* eslint-disable i18next/no-literal-string */

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Input, Label, Select } from '@/components/common';
import { Button as ActionButton } from '@/components/common/ActionButton';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { fieldOptions, operatorLabel, operatorsForField } from '@/lib/utils/rts/rts-rule-master';
import type { RuleMasterPageData } from '@/app/[locale]/rts/configuration-settings/rts-rule/actions';
import type { RtsRuleCondition } from '@/types/rts/rts-rulemaster.types';

const MAXIMUM_DEPTH = 5;
const inputClass =
  'w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const selectClass =
  'w-full [&_button]:!h-10 [&_button]:!rounded-lg [&_button]:!border-slate-300 [&_button]:!bg-white [&_button]:!px-3 [&_button]:!text-sm';

type Field = RuleMasterPageData['fields'][number];
type Path = number[];
type DateParts = { day: string; month: string; year: string };
type DateTimeParts = DateParts & { time: string };
const DATE_PARTS_PREFIX = 'DATE_PARTS:';
const DATETIME_PARTS_PREFIX = 'DATETIME_PARTS:';
const equalityOperators = new Set(['=', '!=']);

function datePartsFromExpectedValue(value: string | null | undefined): DateParts {
  const raw = value?.trim() ?? '';
  if (raw.startsWith(DATE_PARTS_PREFIX)) {
    const [day = '', month = '', year = ''] = raw.slice(DATE_PARTS_PREFIX.length).split('-');
    return {
      day: day === '*' ? '' : day,
      month: month === '*' ? '' : month,
      year: year === '*' ? '' : year,
    };
  }

  // Existing date-only rules remain editable after this enhancement.
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return { day: iso[3], month: iso[2], year: iso[1] };
  const local = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (local) return { day: local[1], month: local[2], year: local[3] };
  return { day: '', month: '', year: '' };
}

function datePartsToExpectedValue(parts: DateParts): string {
  const day = parts.day.trim();
  const month = parts.month.trim();
  const year = parts.year.trim();
  if (!day && !month && !year) return '';
  return `${DATE_PARTS_PREFIX}${day || '*'}-${month || '*'}-${year || '*'}`;
}

function datePartsToOrderedExpectedValue(parts: DateParts): string {
  const day = parts.day.trim();
  const month = parts.month.trim();
  const year = parts.year.trim();
  if (day && month && year) {
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Retain the partially entered values in the editor. The API deliberately
  // rejects this encoding for range operators until a complete date is present.
  return datePartsToExpectedValue(parts);
}

function dateTimePartsFromExpectedValue(value: string | null | undefined): DateTimeParts {
  const raw = value?.trim() ?? '';
  if (raw.startsWith(DATETIME_PARTS_PREFIX)) {
    const [dateParts = '', time = ''] = raw.slice(DATETIME_PARTS_PREFIX.length).split('|');
    const [day = '', month = '', year = ''] = dateParts.split('-');
    return {
      day: day === '*' ? '' : day,
      month: month === '*' ? '' : month,
      year: year === '*' ? '' : year,
      time: time === '*' ? '' : time,
    };
  }

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{2}:\d{2})/);
  if (iso) return { day: iso[3], month: iso[2], year: iso[1], time: iso[4] };
  return { day: '', month: '', year: '', time: '' };
}

function dateTimePartsToExpectedValue(parts: DateTimeParts): string {
  const day = parts.day.trim();
  const month = parts.month.trim();
  const year = parts.year.trim();
  const time = parts.time.trim();
  if (!day && !month && !year && !time) return '';
  return `${DATETIME_PARTS_PREFIX}${day || '*'}-${month || '*'}-${year || '*'}|${time || '*'}`;
}

function isEqualityOperator(value: string | null | undefined) {
  return equalityOperators.has(value ?? '=');
}

export function createPredicate(order: number): RtsRuleCondition {
  return {
    conditionType: 'PREDICATE',
    conditionMatchType: null,
    fieldDefinitionId: null,
    comparisonOperator: '=',
    expectedValue: '',
    conditionOrder: order,
    children: [],
  };
}

export function createGroup(order: number): RtsRuleCondition {
  return {
    conditionType: 'GROUP',
    conditionMatchType: 'ALL',
    fieldDefinitionId: null,
    comparisonOperator: null,
    expectedValue: null,
    conditionOrder: order,
    children: [createPredicate(1)],
  };
}

export function normalizeConditionOrders(nodes: RtsRuleCondition[]): RtsRuleCondition[] {
  return nodes.map((node, index) => ({
    ...node,
    conditionType: node.conditionType ?? 'PREDICATE',
    conditionMatchType:
      node.conditionType === 'GROUP' ? node.conditionMatchType ?? 'ALL' : null,
    conditionOrder: index + 1,
    children: normalizeConditionOrders(node.children ?? []),
  }));
}

function updateAtPath(
  nodes: RtsRuleCondition[],
  path: Path,
  update: (node: RtsRuleCondition) => RtsRuleCondition
): RtsRuleCondition[] {
  return nodes.map((node, index) => {
    if (index !== path[0]) return node;
    if (path.length === 1) return update(node);
    return { ...node, children: updateAtPath(node.children ?? [], path.slice(1), update) };
  });
}

function removeAtPath(nodes: RtsRuleCondition[], path: Path): RtsRuleCondition[] {
  if (path.length === 1) return nodes.filter((_, index) => index !== path[0]);
  return nodes.map((node, index) =>
    index === path[0]
      ? { ...node, children: removeAtPath(node.children ?? [], path.slice(1)) }
      : node
  );
}

function moveAtPath(nodes: RtsRuleCondition[], path: Path, direction: -1 | 1): RtsRuleCondition[] {
  const index = path[0];
  if (path.length === 1) {
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return nodes;
    const next = [...nodes];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  }

  return nodes.map((node, nodeIndex) =>
    nodeIndex === index
      ? { ...node, children: moveAtPath(node.children ?? [], path.slice(1), direction) }
      : node
  );
}

function fieldLabel(field: Pick<Field, 'id' | 'fieldLabel' | 'fieldType'>) {
  const type = field.fieldType.replace(/[_-]/g, ' ');
  return `${field.fieldLabel} (${type} · #${field.id})`;
}

function fieldTypeLabel(fieldType: string) {
  return fieldType
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Feature-local field presentation; shared Select remains unchanged. */
export function ruleFieldOption(field: Pick<Field, 'id' | 'fieldLabel' | 'fieldType'>) {
  return {
    label: field.fieldLabel,
    value: String(field.id),
    icon: (
      <span aria-label={fieldLabel(field)} className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold">
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">
          {fieldTypeLabel(field.fieldType)}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">#{field.id}</span>
      </span>
    ),
  };
}

function NodeEditor({
  node,
  path,
  depth,
  fields,
  onChange,
  onRemove,
  onMove,
  siblingCount,
  canRemove = true,
}: {
  node: RtsRuleCondition;
  path: Path;
  depth: number;
  fields: Field[];
  onChange: (path: Path, update: (node: RtsRuleCondition) => RtsRuleCondition) => void;
  onRemove: (path: Path) => void;
  onMove: (path: Path, direction: -1 | 1) => void;
  siblingCount: number;
  canRemove?: boolean;
}) {
  const { confirm } = useConfirm();
  const serialNumber = path.map((index) => index + 1).join('.');
  const siblingIndex = path[path.length - 1];
  const removeNode = () => {
    const isGroup = node.conditionType === 'GROUP';
    confirm({
      variant: 'delete',
      title: isGroup ? 'Remove sub-group?' : 'Remove condition?',
      description: isGroup
        ? 'This will remove the sub-group and all of its nested conditions. This cannot be undone before the rule is saved.'
        : 'This will remove this condition from the rule. This cannot be undone before the rule is saved.',
      confirmText: 'Remove',
      onConfirm: () => onRemove(path),
    });
  };

  if (node.conditionType === 'GROUP') {
    const canAddGroup = depth < MAXIMUM_DEPTH;
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white" title={`Condition group ${serialNumber}`}>{serialNumber}</span>
            <span>Sub-group</span>
            <span>If</span>
            <Select
              className="w-[92px] [&_button]:!h-8"
              selectSize="sm"
              value={node.conditionMatchType ?? 'ALL'}
              options={[{ label: 'All', value: 'ALL' }, { label: 'Any', value: 'ANY' }]}
              onChange={(_, value) =>
                onChange(path, (current) => ({
                  ...current,
                  conditionMatchType: value as 'ALL' | 'ANY',
                }))
              }
            />
            <span>of the following conditions are met</span>
          </div>
          <div className="flex items-center gap-1">
            <ActionButton type="button" size="md" variant="secondary" icon={ChevronUp} className="!h-10 !w-10 !px-0" disabled={siblingIndex === 0} aria-label={`Move group ${serialNumber} up`} title="Move up" onClick={() => onMove(path, -1)} />
            <ActionButton type="button" size="md" variant="secondary" icon={ChevronDown} className="!h-10 !w-10 !px-0" disabled={siblingIndex >= siblingCount - 1} aria-label={`Move group ${serialNumber} down`} title="Move down" onClick={() => onMove(path, 1)} />
            {canRemove && (
              <ActionButton type="button" size="md" variant="ghost" icon={Trash2} className="!h-10 !w-10 !px-0 border border-red-200 bg-white !text-red-600 hover:!bg-red-50" aria-label={`Remove group ${serialNumber}`} title="Remove group" onClick={removeNode} />
            )}
          </div>
        </div>
        <div className="space-y-2 border-l-2 border-blue-200 pl-3">
          {(node.children ?? []).map((child, index) => (
            <NodeEditor
              key={child.id ?? `${path.join('-')}-${index}`}
              node={child}
              path={[...path, index]}
              depth={depth + 1}
              fields={fields}
              onChange={onChange}
              onRemove={onRemove}
              onMove={onMove}
              siblingCount={(node.children ?? []).length}
              canRemove={(node.children ?? []).length > 1}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            type="button"
            size="xs"
            variant="outline"
            icon={Plus}
            onClick={() =>
              onChange(path, (current) => ({
                ...current,
                children: [...(current.children ?? []), createPredicate((current.children ?? []).length + 1)],
              }))
            }
          >
            Add condition
          </ActionButton>
          <ActionButton
            type="button"
            size="xs"
            variant="outline"
            icon={Plus}
            disabled={!canAddGroup}
            title={!canAddGroup ? `Maximum ${MAXIMUM_DEPTH} nesting levels` : undefined}
            onClick={() =>
              onChange(path, (current) => ({
                ...current,
                children: [...(current.children ?? []), createGroup((current.children ?? []).length + 1)],
              }))
            }
          >
            Add sub-group
          </ActionButton>
        </div>
      </div>
    );
  }

  const selectedField = fields.find((field) => field.id === node.fieldDefinitionId);
  const operators = selectedField ? operatorsForField(selectedField.fieldType) : ['=', '!='];
  const options = selectedField ? fieldOptions(selectedField) : [];
  const choiceField = selectedField && ['select', 'dropdown', 'radio'].includes(selectedField.fieldType.toLowerCase());
  const temporalType = selectedField?.fieldType.trim().toLowerCase();
  const dateField = temporalType === 'date';
  const dateTimeField = ['datetime', 'date_time', 'date-time', 'datetime-local'].includes(temporalType ?? '');
  const timeField = temporalType === 'time';
  const monthField = temporalType === 'month';
  const numericField = selectedField && ['number', 'decimal', 'amount', 'year'].includes(selectedField.fieldType.toLowerCase());
  const usesPartialDateParts = dateTimeField && isEqualityOperator(node.comparisonOperator);
  const dateUsesRangeOperator = dateField && !isEqualityOperator(node.comparisonOperator);
  const dateParts = datePartsFromExpectedValue(node.expectedValue);
  const dateTimeParts = dateTimePartsFromExpectedValue(node.expectedValue);
  const updateDatePart = (part: keyof DateParts, value: string) =>
    onChange(path, (current) => ({
      ...current,
      expectedValue: (isEqualityOperator(current.comparisonOperator)
        ? datePartsToExpectedValue
        : datePartsToOrderedExpectedValue)({
        ...datePartsFromExpectedValue(current.expectedValue),
        [part]: value,
      }),
    }));
  const updateDateTimePart = (part: keyof DateTimeParts, value: string) =>
    onChange(path, (current) => ({
      ...current,
      expectedValue: dateTimePartsToExpectedValue({
        ...dateTimePartsFromExpectedValue(current.expectedValue),
        [part]: value,
      }),
    }));

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-white" title={`Condition ${serialNumber}`}>{serialNumber}</span>
          <span className="text-xs font-semibold text-slate-700">Condition</span>
        </div>
        <div className="flex items-center gap-1">
          <ActionButton type="button" size="md" variant="secondary" icon={ChevronUp} className="!h-10 !w-10 !px-0" disabled={siblingIndex === 0} aria-label={`Move condition ${serialNumber} up`} title="Move up" onClick={() => onMove(path, -1)} />
          <ActionButton type="button" size="md" variant="secondary" icon={ChevronDown} className="!h-10 !w-10 !px-0" disabled={siblingIndex >= siblingCount - 1} aria-label={`Move condition ${serialNumber} down`} title="Move down" onClick={() => onMove(path, 1)} />
          {canRemove && <ActionButton type="button" size="md" variant="ghost" icon={Trash2} className="!h-10 !w-10 !px-0 border border-red-200 bg-white !text-red-600 hover:!bg-red-50" aria-label={`Remove condition ${serialNumber}`} title="Remove condition" onClick={removeNode} />}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)]">
        <div className="space-y-1"><Label className="text-xs font-semibold">Field</Label><Select className={selectClass} selectSize="sm" value={String(node.fieldDefinitionId ?? '')} options={[{ label: 'Select field', value: '' }, ...fields.map(ruleFieldOption)]} onChange={(_, value) => onChange(path, (current) => ({ ...current, fieldDefinitionId: Number(value) || null, comparisonOperator: '=', expectedValue: '' }))} /></div>
        <div className="space-y-1"><Label className="text-xs font-semibold">Operator</Label><Select className={selectClass} selectSize="sm" value={node.comparisonOperator ?? '='} options={operators.map((operator) => ({ label: operatorLabel(operator), value: operator }))} onChange={(_, value) => onChange(path, (current) => ({ ...current, comparisonOperator: value }))} /></div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Expected value</Label>
          {choiceField && options.length ? (
            <Select
              className={selectClass}
              selectSize="sm"
              value={node.expectedValue ?? ''}
              options={[{ label: 'Expected value', value: '' }, ...options.map((option) => ({ label: option.label, value: option.value }))]}
              onChange={(_, value) => onChange(path, (current) => ({ ...current, expectedValue: value }))}
            />
          ) : dateField ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  className={inputClass}
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day"
                  aria-label={dateUsesRangeOperator ? 'Day (required)' : 'Day (optional)'}
                  value={dateParts.day}
                  onChange={(event) => updateDatePart('day', event.target.value)}
                />
                <Input
                  className={inputClass}
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Month"
                  aria-label={dateUsesRangeOperator ? 'Month (required)' : 'Month (optional)'}
                  value={dateParts.month}
                  onChange={(event) => updateDatePart('month', event.target.value)}
                />
                <Input
                  className={inputClass}
                  type="number"
                  min="1"
                  max="9999"
                  placeholder="Year"
                  aria-label={dateUsesRangeOperator ? 'Year (required)' : 'Year (optional)'}
                  value={dateParts.year}
                  onChange={(event) => updateDatePart('year', event.target.value)}
                />
              </div>
              <p className="text-[11px] leading-4 text-slate-500">
                {dateUsesRangeOperator
                  ? 'Enter day, month, and year to compare a complete calendar date.'
                  : 'Enter any combination of day, month, and year. Empty fields match any value.'}
              </p>
            </>
          ) : dateTimeField && usesPartialDateParts ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Input
                className={inputClass}
                type="number"
                min="1"
                max="31"
                placeholder="Day"
                aria-label="Day (optional)"
                value={dateTimeParts.day}
                onChange={(event) => updateDateTimePart('day', event.target.value)}
              />
              <Input
                className={inputClass}
                type="number"
                min="1"
                max="12"
                placeholder="Month"
                aria-label="Month (optional)"
                value={dateTimeParts.month}
                onChange={(event) => updateDateTimePart('month', event.target.value)}
              />
              <Input
                className={inputClass}
                type="number"
                min="1"
                max="9999"
                placeholder="Year"
                aria-label="Year (optional)"
                value={dateTimeParts.year}
                onChange={(event) => updateDateTimePart('year', event.target.value)}
              />
              <Input
                className={inputClass}
                type="time"
                aria-label="Time (optional)"
                value={dateTimeParts.time}
                onChange={(event) => updateDateTimePart('time', event.target.value)}
              />
            </div>
          ) : (
            <Input
              className={inputClass}
              type={
                dateField ? 'date' : dateTimeField ? 'datetime-local' : monthField ? 'month' : timeField ? 'time' : numericField ? 'number' : 'text'
              }
              step={numericField ? 'any' : undefined}
              min={numericField ? String(selectedField?.minValue ?? '') || undefined : undefined}
              max={numericField ? String(selectedField?.maxValue ?? '') || undefined : undefined}
              value={node.expectedValue ?? ''}
              maxLength={500}
              onChange={(event) =>
                onChange(path, (current) => ({ ...current, expectedValue: event.target.value }))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RuleConditionTreeEditor({
  conditions,
  fields,
  rootConditionMatchType,
  onChange,
}: {
  conditions: RtsRuleCondition[];
  fields: Field[];
  rootConditionMatchType: 'ALL' | 'ANY';
  onChange: (conditions: RtsRuleCondition[]) => void;
}) {
  // The rule master owns the ALL/ANY selector for this outer list. Its children
  // may therefore be either direct predicates or nested groups.
  const replace = (next: RtsRuleCondition[]) => onChange(normalizeConditionOrders(next));
  return (
    <div className="space-y-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/30 p-3">
      <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 pb-3 text-xs font-semibold text-slate-700">
        <span className="rounded-md bg-blue-600 px-2 py-1 text-white">Root</span>
        <span>If</span>
        <span className="rounded-md border border-blue-200 bg-white px-2 py-1 text-blue-800">{rootConditionMatchType === 'ANY' ? 'Any' : 'All'}</span>
        <span>of the following conditions and groups are met</span>
        <span className="text-[11px] font-normal text-slate-500">Configured in Rule details.</span>
      </div>
      <div className="space-y-2">
      {conditions.map((node, index) => (
        <NodeEditor
          key={node.id ?? index}
          node={node}
          path={[index]}
          depth={1}
          fields={fields}
          onChange={(path, update) => replace(updateAtPath(conditions, path, update))}
          onRemove={(path) => replace(removeAtPath(conditions, path))}
          onMove={(path, direction) => replace(moveAtPath(conditions, path, direction))}
          siblingCount={conditions.length}
          canRemove={conditions.length > 1}
        />
      ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton type="button" size="xs" variant="outline" icon={Plus} onClick={() => replace([...conditions, createPredicate(conditions.length + 1)])}>Add condition</ActionButton>
        <ActionButton type="button" size="xs" variant="outline" icon={Plus} onClick={() => replace([...conditions, createGroup(conditions.length + 1)])}>Add sub-group</ActionButton>
      </div>
    </div>
  );
}
