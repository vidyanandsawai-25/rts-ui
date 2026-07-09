"use client";

import ErrorPage from "@/components/common/ErrorPage";

interface ServiceFormErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ServiceFormError({ error, reset }: ServiceFormErrorProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <main className="flex-1 overflow-x-hidden px-3 pb-4 pt-16 sm:px-4 sm:pt-20 md:px-6">
        <ErrorPage error={error} reset={reset} />
      </main>
    </div>
  );
}
