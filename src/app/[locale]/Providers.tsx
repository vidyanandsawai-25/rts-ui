'use client';
import { Suspense } from 'react';
import { ConfirmProvider, ToastProvider } from '@/components/common';
import { SessionTimeoutGuard } from '@/components/modules/login/SessionTimeoutGuard';
import { LoginSuccessFlash } from '@/components/modules/login/LoginSuccessFlash';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <SessionTimeoutGuard />
        <Suspense fallback={null}>
          <LoginSuccessFlash />
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
        {children}
      </ConfirmProvider>
    </ToastProvider>
  );
}
