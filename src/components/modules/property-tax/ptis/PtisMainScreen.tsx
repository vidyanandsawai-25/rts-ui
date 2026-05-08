import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils/cn';
import { Tabs, TabPanel } from '@/components/common/Tabs';
import { ToastNotifier } from '@/components/common';
import { DualMethodSection } from '@/components/modules/property-tax/ptis/dualmethod';
import { CapitalTaxDetailsSection } from '@/components/modules/property-tax/ptis/capital';
import { RateableTaxDetailsSection } from '@/components/modules/property-tax/ptis/rateable';
import ApartmentTaxDetailsSection from '@/components/modules/property-tax/ptis/apartment/components/ApartmentTaxDetailsSection';
import { type PtisSearchParams, buildPtisUrl } from '@/lib/utils/params';
import { OldDetailsData, defaultOldDetails } from '@/types/ptis.types';
import PtisLoading from '@/app/[locale]/property-tax/ptis/loading';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';

interface PtisMainScreenProps {
  locale: string;
  propertyId?: number;
  initialOldDetails: OldDetailsData;
  ptisParams: PtisSearchParams;
  resolvedSearchParams: Record<string, string | string[] | undefined>;
  error?: string;
}

/**
 * PtisMainScreen (Server Component)
 * Orchestrates the PTIS valuation tabs and their respective sections.
 */
export async function PtisMainScreen({
  locale,
  propertyId,
  initialOldDetails,
  ptisParams,
  resolvedSearchParams,
  error,
}: PtisMainScreenProps) {
  const t = await getTranslations({ locale, namespace: 'ptis' });
  const activeTab = ptisParams.tab;

  // Use an explicit pathname + query to ensure Next's App Router reliably re-renders on tab change.
  const ptisPath = `/${locale}/property-tax/ptis`;
  const rateableTabHref = `${ptisPath}${buildPtisUrl(resolvedSearchParams, { tab: 'rateable' })}`;
  const capitalTabHref = `${ptisPath}${buildPtisUrl(resolvedSearchParams, { tab: 'capital' })}`;
  const dualTabHref = `${ptisPath}${buildPtisUrl(resolvedSearchParams, { tab: 'dual' })}`;
  const apartmentTabHref = `${ptisPath}${buildPtisUrl(resolvedSearchParams, { tab: 'apartment' })}`;
  return (
    <div className="bg-[#f1f5f9]">
      <div className="w-full px-1 py-0 sm:px-2">
        <main className="mx-auto w-full">
          <div className="overflow-hidden rounded-xl border border-indigo-50 bg-white shadow-lg">
            {error && <ToastNotifier message={error} />}
            <Tabs value={activeTab}>
              <div className="border-b border-indigo-50 bg-slate-50 p-1.5">
                <div className={PTIS_UI_CLASSES.tabContainer}>
                  <Link
                    href={rateableTabHref}
                    scroll={false}
                    className={cn(
                      'inline-flex items-center justify-center min-w-[100px] rounded-full text-xs font-bold px-4 py-2 transition-all outline-none',
                      activeTab === 'rateable'
                        ? PTIS_UI_CLASSES.tabActive
                        : PTIS_UI_CLASSES.tabInactive
                    )}
                  >
                    {t('tabs.rateable')}
                  </Link>

                  <Link
                    href={capitalTabHref}
                    scroll={false}
                    className={cn(
                      'inline-flex items-center justify-center min-w-[100px] rounded-full text-xs font-bold px-4 py-2 transition-all outline-none',
                      activeTab === 'capital'
                        ? PTIS_UI_CLASSES.tabActive
                        : PTIS_UI_CLASSES.tabInactive
                    )}
                  >
                    {t('tabs.capital')}
                  </Link>

                  <Link
                    href={dualTabHref}
                    scroll={false}
                    className={cn(
                      'inline-flex items-center justify-center min-w-[100px] rounded-full text-xs font-bold px-4 py-2 transition-all outline-none',
                      activeTab === 'dual'
                        ? PTIS_UI_CLASSES.tabActive
                        : PTIS_UI_CLASSES.tabInactive
                    )}
                  >
                    {t('tabs.dual')}
                  </Link>
                  <Link
  href={apartmentTabHref}
  scroll={false}
  className={cn(
    'inline-flex items-center justify-center min-w-[100px] rounded-full text-xs font-bold px-4 py-2 transition-all outline-none',
    activeTab === 'apartment'
      ? PTIS_UI_CLASSES.tabActive
      : PTIS_UI_CLASSES.tabInactive
  )}
>
  {t('tabs.apartment')}
</Link>
                </div>
              </div>

              <div className="min-h-[200px] bg-white">
                {activeTab === 'rateable' && (
                  <TabPanel value="rateable">
                    <Suspense fallback={<PtisLoading />}>
                      <RateableTaxDetailsSection
                        locale={locale}
                        propertyId={propertyId}
                        oldDetails={initialOldDetails || defaultOldDetails}
                        searchParams={resolvedSearchParams}
                      />
                    </Suspense>
                  </TabPanel>
                )}

                {activeTab === 'capital' && (
                  <TabPanel value="capital">
                    <Suspense fallback={<PtisLoading />}>
                      <CapitalTaxDetailsSection
                        locale={locale}
                        propertyId={propertyId}
                        oldDetails={initialOldDetails || defaultOldDetails}
                        searchParams={resolvedSearchParams}
                      />
                    </Suspense>
                  </TabPanel>
                )}

                {activeTab === 'dual' && (
                  <TabPanel value="dual">
                    <Suspense fallback={<PtisLoading />}>
                      <DualMethodSection
                        locale={locale}
                        propertyId={propertyId}
                        initialOldDetails={initialOldDetails || defaultOldDetails}
                        searchParams={resolvedSearchParams}
                      />
                    </Suspense>
                  </TabPanel>
                )}

                {activeTab === 'apartment' && (
                  <TabPanel value="apartment">
                    <Suspense fallback={<PtisLoading />}>
                      <ApartmentTaxDetailsSection
                        locale={locale}
                        propertyId={propertyId}
                        initialOldDetails={initialOldDetails || defaultOldDetails}
                        searchParams={resolvedSearchParams}
                      />
                    </Suspense>
                  </TabPanel>
                )}
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PtisMainScreen;
