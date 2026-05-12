import { unstable_cache } from 'next/cache';
import type { BankMasterData } from '@/types/bank-master.types';
import { getBanksSummary } from '@/lib/api/configuration-settings/bank/bank-master.services';
import { BANK_MASTER_METADATA_TAG } from './actions.utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BANK_MASTER_METADATA_CACHE_KEY = 'bank-master-metadata-v3';
const BANK_MASTER_CACHE_TTL_MINUTES = 5;
const BANK_MASTER_METADATA_REVALIDATE_SECONDS = BANK_MASTER_CACHE_TTL_MINUTES * 60;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BankMasterMetadata = {
  activeCount: number;
  uniqueStates: string[];
};

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

export function buildBankMasterMetadata(summary: BankMasterData[]): BankMasterMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCount = summary.reduce((count, bank: any) => {
    // Check both camelCase and PascalCase
    const val = bank.isActive ?? bank.IsActive;
    
    const isActive =
      val !== null &&
      val !== undefined &&
      (String(val).toLowerCase() === 'active' ||
        String(val) === '1' ||
        String(val).toLowerCase() === 'true' ||
        val === true);

    return isActive ? count + 1 : count;
  }, 0);

  const uniqueStates = Array.from(
    new Set(
      summary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((bank: any) => (bank.state ?? bank.State)?.trim())
        .filter((state): state is string => Boolean(state) && state !== '—')
    )
  ).sort((a, b) => a.localeCompare(b));

  return { activeCount, uniqueStates };
}

// ---------------------------------------------------------------------------
// Cached Metadata Access
// ---------------------------------------------------------------------------

export const getCachedBankMasterMetadata = unstable_cache(
  async (): Promise<BankMasterMetadata> => {
    const summary = await getBanksSummary();
    return buildBankMasterMetadata(summary);
  },
  [BANK_MASTER_METADATA_CACHE_KEY],
  {
    tags: [BANK_MASTER_METADATA_TAG],
    revalidate: BANK_MASTER_METADATA_REVALIDATE_SECONDS,
  }
);
