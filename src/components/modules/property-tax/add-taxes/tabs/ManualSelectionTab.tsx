'use client';

import { AddTaxesConsoleApi } from '@/types/add-taxes.types';
import { ScopeSelection } from '../scope/ScopeSelection';
import { OperationPanel } from '../operation/OperationPanel';

interface Props {
  api: AddTaxesConsoleApi;
}

export function ManualSelectionTab({ api }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
      <ScopeSelection api={api} />
      <OperationPanel api={api} />
    </div>
  );
}
