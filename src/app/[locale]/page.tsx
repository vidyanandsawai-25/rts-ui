import { MainLayout } from '@/components/layout';

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params: _params }: HomeProps) {
  // Unused params are now prefixed with underscore to satisfy no-unused-vars

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold"></h1>
      </div>
    </MainLayout>
  );
}
