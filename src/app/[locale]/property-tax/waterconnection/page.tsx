import { WaterConnectionPage } from "@/components/modules/property-tax/waterconnection";
import { getWaterConnectionPageData } from "./action";

interface PageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { propertyId } = await searchParams;
  const resolvedPropertyId = Number(propertyId ?? 1);
  const data = await getWaterConnectionPageData(resolvedPropertyId);
  return <WaterConnectionPage initialData={data} propertyId={resolvedPropertyId} />;
}
