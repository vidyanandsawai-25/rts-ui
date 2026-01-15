import { MainLayout } from '@/components/layout';
import { ServiceCards } from '@/components/modules/dashboard';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  return (
    <MainLayout locale={locale}>
      <ServiceCards />
    </MainLayout>
  );
}
