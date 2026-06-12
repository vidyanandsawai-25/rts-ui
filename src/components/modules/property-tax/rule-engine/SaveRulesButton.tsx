'use client';

import React from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/common';

interface SaveRulesButtonProps {
  /** Serialized current state — parent recomputes this each render */
  currentData: string;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * Save Rules button with built-in change detection.
 *
 * Strategy: capture the baseline AFTER all mount effects settle using
 * setTimeout(0). This guarantees child components' on-mount onChange calls
 * (e.g. API option loading, operator normalisation) have already fired and
 * updated state before we take the snapshot. Any change after that point is
 * a genuine user edit.
 */
export default function SaveRulesButton({ currentData, isSaving, onSave }: SaveRulesButtonProps) {
  const t = useTranslations('ruleEngine');
  const toast = useToast();

  // Keep a ref always pointing to latest currentData so the setTimeout
  // callback captures the settled value, not a stale closure.
  const currentDataRef = React.useRef(currentData);
  
  React.useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  // null = still stabilising; string = stable baseline for comparison
  const [snapshot, setSnapshot] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Wait for all on-mount child effects (API fetches, operator normalisation,
    // category sync, etc.) to finish updating state before locking the baseline.
    const timer = setTimeout(() => {
      setSnapshot(currentDataRef.current);
    }, 0);
    return () => clearTimeout(timer);
  }, []); // run once only

  // hasChanges is false while stabilising (snapshot === null)
  const hasChanges = snapshot !== null && currentData !== snapshot;



  const handleClick = () => {
    if (isSaving) return;
    if (!hasChanges) {
      toast.error(t('builder.noChanges'));
      return;
    }
    onSave();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSaving}
      className={[
        'relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition-all shadow-sm border border-transparent',
        isSaving
          ? 'bg-emerald-500 opacity-70 cursor-not-allowed'
          : hasChanges
            ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer ring-2 ring-emerald-300 ring-offset-1'
            : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer opacity-75',
      ].join(' ')}
    >
      {/* Pulsing dot — visible only when there are unsaved changes */}
      {hasChanges && !isSaving && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white animate-pulse" />
      )}
      {isSaving
        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('builder.saving')}</>
        : <><PlusCircle className="w-3.5 h-3.5" />{t('builder.saveRules')}</>
      }
    </button>
  );
}
