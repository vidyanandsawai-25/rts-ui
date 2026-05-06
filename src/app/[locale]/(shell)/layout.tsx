import { MainLayout } from '@/components/layout';

export default function ShellLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
