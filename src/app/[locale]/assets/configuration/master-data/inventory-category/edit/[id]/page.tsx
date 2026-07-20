import { InventoryCategoryForm } from "@/components/modules/assets/configuration/master-data/inventory-category-master";
import { getInventoryCategoryByIdAction } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;

  let initialData = null;
  try {
    initialData = await getInventoryCategoryByIdAction(id);
  } catch (_error) {
    // Action handles error logging
  }

  if (!initialData) {
    notFound();
  }

  return (
    <InventoryCategoryForm initialData={initialData as never} />
  );
}
