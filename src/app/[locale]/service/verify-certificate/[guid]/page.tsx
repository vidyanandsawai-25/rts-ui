import { notFound } from "next/navigation";
import { verifyCertificatePublic } from "@/lib/api/rts/rtscertificate.service";
import CertificateVerificationView from "@/components/modules/rts/certificate/CertificateVerificationView";

type PageProps = {
  params: Promise<{
    locale: string;
    guid: string;
  }>;
};

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { locale, guid } = await params;

  if (!guid) {
    notFound();
  }

  const data = await verifyCertificatePublic(guid);

  return <CertificateVerificationView data={data} locale={locale} />;
}
