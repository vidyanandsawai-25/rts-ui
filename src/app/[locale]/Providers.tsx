"use client";
import { ConfirmProvider } from "@/components/common";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <Toaster position="top-right" richColors closeButton />
      {children}
    </ConfirmProvider>
  );
}
