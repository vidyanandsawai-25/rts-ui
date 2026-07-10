import { getAllUseCategories } from "../actions";
import CategoryListDrawer from "@/components/modules/property-tax/typeofusemaster/CategoryListDrawer";

export const dynamic = 'force-dynamic';

export default async function CategoryListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const categoriesResp = await getAllUseCategories(q);
  
  return (
    <CategoryListDrawer 
      categories={categoriesResp.items || []} 
    />
  );
}
