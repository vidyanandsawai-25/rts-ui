import UseTypeForm from "@/components/modules/property-tax/typeofusemaster/UseTypeForm";
import { getTypeById, getTypeOfUseMasterData } from "../../../actions";
import { notFound } from "next/navigation";

// Force this page to be dynamic (don't pre-render at build time)
 export const dynamic = 'force-dynamic';

export default async function EditTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch data server-side
  const [typeData, masterData] = await Promise.all([
    getTypeById(id),
    getTypeOfUseMasterData(),
  ]);
  
  if (!typeData) {
    notFound();
  }
  
  return (
    <>
      <UseTypeForm 
        id={id}
        initialData={typeData}
        allGroups={masterData.groups || []}
        allTypes={masterData.types || []}
      />
    </>
  );
}

