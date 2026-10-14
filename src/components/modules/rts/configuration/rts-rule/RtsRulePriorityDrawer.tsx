'use client';
/* eslint-disable i18next/no-literal-string */

import { useState } from 'react';
import { ArrowDown, ArrowUp, ListOrdered, X } from 'lucide-react';
import { CancelButton, Card, Drawer, SaveButton } from '@/components/common';
import type { RtsRuleMasterRule } from '@/types/rts/rts-rulemaster.types';

export default function RtsRulePriorityDrawer({
  open,
  rules,
  title,
  onClose,
  onSave,
}: {
  open: boolean;
  rules: RtsRuleMasterRule[];
  title: string;
  onClose: () => void;
  onSave: (ruleIdsInOrder: number[]) => Promise<void>;
}) {
  const [ordered, setOrdered] = useState<RtsRuleMasterRule[]>(rules);
  const [saving, setSaving] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    setOrdered((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await onSave(ordered.map((rule) => rule.id));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={() => !saving && onClose()}
      width="xl"
      className="max-w-[94vw]"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full justify-end gap-2">
          <CancelButton label="Cancel" disabled={saving} onClick={onClose} />
          <SaveButton label="Save priority order" disabled={saving || ordered.length === 0} isLoading={saving} onClick={save} />
        </div>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-50/70">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143d7d] px-5 py-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10">
              <ListOrdered className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold tracking-tight">{title}</h2>
              <p className="truncate text-[11px] font-medium text-blue-100">Priority 1 is evaluated first</p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-2">
          <Card padding="sm" className="rounded-2xl border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-blue-950">Rule evaluation order</h3>
                <p className="mt-1 text-[11px] text-slate-500">Use the arrows to set the order in which matching rules take precedence.</p>
              </div>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {ordered.length} {ordered.length === 1 ? 'rule' : 'rules'}
              </span>
            </div>

            {ordered.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-12 text-center text-xs text-slate-500">No rules are available to order.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {ordered.map((rule, index) => (
                  <li
                    key={rule.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <span className="w-5 text-center text-xs font-bold text-blue-800">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{rule.ruleDescription}</p>
                      <p className="truncate text-[11px] text-slate-500">Rule #{rule.id}{rule.isActive ? '' : ' · Inactive'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                        <button
                          type="button"
                          disabled={saving || index === 0}
                          onClick={() => move(index, -1)}
                          aria-label={`Move ${rule.ruleDescription} up`}
                          className="flex size-8 items-center justify-center border-r border-slate-200 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                        >
                          <ArrowUp className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={saving || index === ordered.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label={`Move ${rule.ruleDescription} down`}
                          className="flex size-8 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                        >
                          <ArrowDown className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">Priority {index + 1}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </main>
      </div>
    </Drawer>
  );
}
