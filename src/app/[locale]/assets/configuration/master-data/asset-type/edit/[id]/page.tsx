import { setRequestLocale } from "next-intl/server";
import { AssetTypeForm } from "@/components/modules/assets/configuration/master-data/asset-type-master";
import { getAssetMasterDataProvider } from "@/lib/api/asset-masters/asset-master-provider";
import { getAssetTypeByIdAction } from "../../actions";
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

  // Fetch categories and specific asset type
  const [categoriesResult, rawRecord] = await Promise.all([
    getAssetMasterDataProvider(MASTER_IDS.CATEGORY, "all", 1, 1000, ""),
    getAssetTypeByIdAction(id),
  ]);

  if (!rawRecord) {
    notFound();
  }

  const groups = categoriesResult.success && categoriesResult.data
    ? (categoriesResult.data.records
      ?.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: String(r.name ?? r.categoryName ?? ""),
        status: String(r.status ?? "Active"),
      })) || [])
    : [];

  let initialData = null;
  try {
    const allowUnit = rawRecord.allowUnitRegistration;
    const allowRoom = rawRecord.allowRoomRegistration;

    initialData = {
      id: String(rawRecord.id),
      code: rawRecord.typeCode || "",
      name: rawRecord.typeName || "",
      group: String((rawRecord as unknown as Record<string, unknown>).assetCategoryId || rawRecord.categoryId || ""),
      allowUnitRegistration: allowUnit === true || String(allowUnit).toLowerCase() === "true" || (allowUnit as unknown) === 1 || (rawRecord as unknown as Record<string, unknown>).isUnitRegistration === true,
      allowRoomRegistration: allowRoom === true || String(allowRoom).toLowerCase() === "true" || (allowRoom as unknown) === 1 || (rawRecord as unknown as Record<string, unknown>).isRoomRegistration === true,
      description: rawRecord.description || "",
      isActive: rawRecord.isActive ?? true,
    };
  } catch (_error) {
    // Should not happen if data mapping is safe, error logged in action otherwise
  }

  if (!initialData) {
    return (
      <>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <div className="flex items-center justify-center h-full p-12 text-slate-500">
          Asset Type not found or error loading data.
        </div>
      </>
    );
  }

  return (
    <AssetTypeForm initialData={initialData as never} groups={groups as never} />
  );
}
