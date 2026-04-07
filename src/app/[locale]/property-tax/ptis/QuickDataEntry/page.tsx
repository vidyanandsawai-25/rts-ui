// Force re-build for async parameter passing
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import PropertyFormPage from './[propertyId]/Property/page';
import { redirect } from 'next/navigation';

// ✅ Next.js 15: searchParams is a Promise
interface QuickDataEntryPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        wardNo?: string;
        propertyNo?: string;
        partitionNo?: string;
    }>;
}

export async function closeDrawer(formData: FormData) {
  const locale = formData.get('locale') as string;
  const wardNo = formData.get('wardNo') as string;
  const propertyNo = formData.get('propertyNo') as string;
  const partitionNo = formData.get('partitionNo') as string;
  const propertyId = formData.get('propertyId') as string;

  const query = new URLSearchParams();
  if (wardNo) query.set('wardNo', wardNo);
  if (propertyNo) query.set('propertyNo', propertyNo);
  if (partitionNo) query.set('partitionNo', partitionNo);
  if (propertyId) query.set('propertyId', propertyId);

  const queryString = query.toString();
  redirect(`/${locale}/property-tax/ptis${queryString ? `?${queryString}` : ''}`);
}

export const dynamic = 'force-dynamic';

export default async function QuickDataEntryPage({ params, searchParams }: QuickDataEntryPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PropertyFormPage params={params} searchParams={searchParams} />
        </Suspense>
    );
}   