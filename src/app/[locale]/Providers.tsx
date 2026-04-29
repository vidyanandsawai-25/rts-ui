"use client";
import { ConfirmProvider, ToastProvider } from "@/components/common";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Toaster position="top-right" richColors closeButton />
        {children}
      </ConfirmProvider>
    </ToastProvider>
  );
}
