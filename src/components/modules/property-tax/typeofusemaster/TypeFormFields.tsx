/**
 * TypeFormFields Component
 * 
 * Reusable form field components for UseType forms
 * Includes type selector, group selector, and input fields
 */

import type { UseGroup, TranslatorFunction } from '@/types/typeOfUse.types';
import { Input } from '@/components/common/Input';
import { ValidationMessage } from '@/components/common';
import { Label } from '@/components/common/label';

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onClearError?: () => void;
  error?: string;
  showError?: boolean;
  t: TranslatorFunction;
}

export function TypeSelector({
  value,
  onChange,
  onClearError,
  error,
  showError,
  t,
}: TypeSelectorProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor="type-select" required>
        {t('type.fields.type')}
      </Label>
      <select
        id="type-select"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onClearError?.();
        }}
        className="w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="" disabled>
          {t('type.selectType')}
        </option>
        <option value="R">{t('type.options.residential')}</option>
        <option value="C">{t('type.options.commercial')}</option>
        <option value="I">{t('type.options.industrial')}</option>
        <option value="N">{t('type.options.nontaxable')}</option>
      </select>
      <ValidationMessage message={error} visible={showError ?? false} />
    </div>
  );
}

interface GroupSelectorProps {
  allGroups: UseGroup[];
  selectedGroupId: number;
  onChange: (groupId: number) => void;
  onClearError?: () => void;
  error?: string;
  showError?: boolean;
  t: TranslatorFunction;
}

export function GroupSelector({
  allGroups,
  selectedGroupId,
  onChange,
  onClearError,
  error,
  showError,
  t,
}: GroupSelectorProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor="use-type-group-select" required>
        {t('type.fields.useTypeGroup')}
      </Label>

      <select
        id="use-type-group-select"
        value={selectedGroupId || ""}
        onChange={(e) => {
          onChange(Number(e.target.value) || 0);
          onClearError?.();
        }}
        className="w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="" disabled>
          {t('type.selectUseTypeGroup')}
        </option>
        {allGroups.map((g) => (
          <option key={g.typeOfUseGroupId} value={g.typeOfUseGroupId}>
            {g.groupName}
          </option>
        ))}
      </select>

      <ValidationMessage message={error} visible={showError ?? false} />
    </div>
  );
}

interface TypeCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
  t: TranslatorFunction;
}

export function TypeCodeInput({
  value,
  onChange,
  error,
  showError,
  t,
}: TypeCodeInputProps) {
  return (
    <div className="flex flex-col">
      <Input
        label={t('type.fields.typeId')}
        name="typeOfUseCode"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('type.placeholders.typeId')}
        fullWidth
        required={true}
        className="rounded-xl px-4 py-2"
        maxLength={10}
      />
      <ValidationMessage message={error} visible={showError ?? false} />
    </div>
  );
}

interface SearchSequenceInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  showError?: boolean;
  t: TranslatorFunction;
}

export function SearchSequenceInput({
  value,
  onChange,
  error,
  showError,
  t,
}: SearchSequenceInputProps) {
  return (
    <div className="flex flex-col">
      <Input
        label={t('messages.searchSequenceLabel')}
        name="searchSequence"
        type="number"
        value={String(value ?? 0)}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        placeholder="0"
        min={0}
        fullWidth
        className="rounded-xl px-4 py-2"
      />
      <ValidationMessage message={error} visible={showError ?? false} />
    </div>
  );
}

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
  t: TranslatorFunction;
}

export function DescriptionInput({
  value,
  onChange,
  error,
  showError,
  t,
}: DescriptionInputProps) {
  return (
    <div className="flex flex-col col-span-2">
      <Input
        label={t('type.fields.description')}
        name="description"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('type.placeholders.description')}
        fullWidth
        className="rounded-xl px-4 py-2"
        maxLength={100}
        required
      />
      <ValidationMessage message={error} visible={showError ?? false} />
    </div>
  );
}
