import { setRequestLocale } from "next-intl/server";
import { InventoryCategoryForm } from "@/components/modules/assets/configuration/master-data/inventory-category-master";
import { getInventoryCategoryByIdAction } from "../../actions";
import { getAssetMasterDataProvider } from "@/lib/api/asset-masters/asset-master-provider";
import { MASTER_IDS } from "@/types/asset-masters/master-data.types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function EditPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const [initialData, categoriesResult] = await Promise.all([
    getInventoryCategoryByIdAction(id).catch(() => null),
    getAssetMasterDataProvider(MASTER_IDS.CATEGORY, "all", 1, 1000, ""),
  ]);

  if (!initialData) {
    notFound();
  }

  const groups = categoriesResult.success && categoriesResult.data
    ? (categoriesResult.data.records
      ?.filter((r: Record<string, unknown>) => r.status === "Active" || String(r.id) === String(initialData.group))
      .map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: String(r.name ?? ""),
        status: String(r.status ?? "Active"),
      })) || [])
    : [];

  return (
    <InventoryCategoryForm initialData={initialData as never} groups={groups as never} />
  );
}
