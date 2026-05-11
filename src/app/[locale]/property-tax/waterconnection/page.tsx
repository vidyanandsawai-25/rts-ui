import { WaterConnectionPage } from "@/components/modules/property-tax/waterconnection";
import { getWaterConnectionPageData } from "./action";

export default async function Page() {
  const data = await getWaterConnectionPageData();
  return <WaterConnectionPage initialData={data} />;
}
