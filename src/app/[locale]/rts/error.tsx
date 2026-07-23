"use client";

import { ErrorPage } from "@/components/common";

type RtsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RtsError({ error, reset }: RtsErrorProps) {
  return <ErrorPage error={error} reset={reset} />;
}
