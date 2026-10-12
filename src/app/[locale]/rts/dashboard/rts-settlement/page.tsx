import RtsPaymentSettlementDashboard from '@/components/modules/rts/dashboard/RtsPaymentSettlementDashboard';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RtsPaymentSettlementPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="w-full">
      <RtsPaymentSettlementDashboard locale={locale} />
    </div>
  );
}
