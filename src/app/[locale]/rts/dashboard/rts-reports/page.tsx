import RtsReportsCenterDashboard from '@/components/modules/rts/reports/RtsReportsCenterDashboard';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsReportsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="w-full">
      <RtsReportsCenterDashboard locale={locale} />
    </div>
  );
}
