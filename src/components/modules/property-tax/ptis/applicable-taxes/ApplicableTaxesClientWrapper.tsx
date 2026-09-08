'use client';

import { ReactNode } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Drawer } from '@/components/common/Drawer';

export default function ApplicableTaxesClientWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    router.push(`/${locale}/property-tax/ptis?${newParams.toString()}`);
  };

  return (
    <Drawer
      open={true}
      onClose={handleClose}
      width="lg"
      hideHeader={true}
    >
      <div className="flex h-screen flex-col bg-white">
        {/* Page children */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </Drawer>
  );
}
