import { notFound } from "next/navigation";
import { WaterConnectionPage } from "@/components/modules/property-tax/waterconnection";
import { getWaterConnectionPageData } from "./action";

interface PageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { propertyId } = await searchParams;
  const resolvedPropertyId = propertyId ? parseInt(propertyId, 10) : NaN;
  if (!Number.isFinite(resolvedPropertyId) || resolvedPropertyId <= 0) {
    notFound();
  }
  const data = await getWaterConnectionPageData(resolvedPropertyId);
  return <WaterConnectionPage initialData={data} propertyId={resolvedPropertyId} />;
}
