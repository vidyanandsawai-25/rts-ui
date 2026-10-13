import RtsAppealsDashboard from '@/components/modules/rts/appeal/RtsAppealsDashboard';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsAppealsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="w-full">
      <RtsAppealsDashboard locale={locale} />
    </div>
  );
}
