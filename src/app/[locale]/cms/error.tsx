"use client";

import { ErrorPage } from "@/components/common";

type CmsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CmsError({ error, reset }: CmsErrorProps) {
  return <ErrorPage error={error} reset={reset} />;
}
