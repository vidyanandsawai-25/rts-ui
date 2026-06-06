import { notFound } from "next/navigation";
import { getWaterRateByIdAction } from "@/app/[locale]/property-tax/water-connection-master/actions";
import { WaterRateForm } from "@/components/modules/property-tax/WaterConnectionMaster";

export const dynamic = "force-dynamic";

interface EditPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditWaterRatePage({ params }: EditPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId) || numericId <= 0) {
    notFound();
  }

  try {
    const initialData = await getWaterRateByIdAction(numericId);
    return <WaterRateForm id={numericId} initialData={initialData} />;
  } catch {
    notFound();
  }
}
