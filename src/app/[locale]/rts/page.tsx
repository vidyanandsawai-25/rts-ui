<<<<<<< HEAD
import { redirect } from "next/navigation";

export default async function CmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/rts/dashboard/rts-mis`);
=======
import React from "react";
import { WelcomeLandingPage } from "@/components/modules";

export default async function RtsRootPage() {
  return (
    <WelcomeLandingPage
      translationKey="menu.rts"
      iconName="Timer"
    />
  );
>>>>>>> main
}
