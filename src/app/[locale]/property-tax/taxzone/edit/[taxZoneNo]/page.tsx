import TaxZoneForm from "@/components/modules/property-tax/taxzonemaster/TaxZoneForm";
import { getTaxZoneById } from "@/lib/api/taxzone.services";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    taxZoneNo: string;
  }>;
}

export default async function EditPage({ params }: PageProps) {
  const { taxZoneNo } = await params; // taxZoneNo here actually contains the ID due to folder name

  // ✅ Fetch data server-side
  let taxZoneData = null;
  try {
    taxZoneData = await getTaxZoneById(taxZoneNo);
  } catch (error) {
    console.error("Failed to fetch tax zone:", error);
    notFound();
  }

  return (
    <>
      <TaxZoneForm initialData={taxZoneData} />
    </>
  );
}
