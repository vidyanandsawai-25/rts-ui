import { redirect } from 'next/navigation';

interface PropertyTaxPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PropertyTaxRootPage({ params }: PropertyTaxPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/property-tax/search-property`);
}
