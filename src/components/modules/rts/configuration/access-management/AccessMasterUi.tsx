'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AccessResult } from '@/types/rts/access-management.types';
import { toast } from 'sonner';

export const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100';
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Check({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded"
      />
      {label}
    </label>
  );
}
export function useMasterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  function navigate(changes: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    startTransition(() => router.push(`${pathname}?${next}`, { scroll: false }));
  }
  return { navigate, pending, refresh: () => router.refresh() };
}
export function useMasterMutation() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();
  function run(operation: () => Promise<AccessResult<unknown>>, onSuccess?: () => void) {
    setError('');
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.success) {
          setError(result.error);
          toast.error(result.error);
          return;
        }
        toast.success('Changes saved.');
        onSuccess?.();
        router.refresh();
      } catch {
        const message = 'The request could not complete. Check your connection and retry.';
        setError(message);
        toast.error(message);
      }
    });
  }
  return { pending, error, run };
}
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {message}
    </p>
  ) : null;
}
