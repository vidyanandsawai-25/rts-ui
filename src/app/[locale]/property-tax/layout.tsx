import { MainLayout } from '@/components/layout';

interface PropertyTaxLayoutProps {
  children: React.ReactNode;
}

export default function PropertyTaxLayout({ children }: Readonly<PropertyTaxLayoutProps>) {
  return <MainLayout>{children}</MainLayout>;
}
