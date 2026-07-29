import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function RtsApplicationDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  redirect(`/${locale}/rts/dashboard/rts-applications/${encodeURIComponent(id)}`);
}
