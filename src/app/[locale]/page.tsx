import { MainLayout } from '@/components/layout';
import { ServiceCards } from '@/components/modules/dashboard';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params: _params }: HomeProps) {
  // Unused params are now prefixed with underscore to satisfy no-unused-vars

  return (
    <MainLayout>
      <ServiceCards />
    </MainLayout>
  );
}
