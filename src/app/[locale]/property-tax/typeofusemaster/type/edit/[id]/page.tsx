import { Suspense } from "react";
import UseTypeForm from "@/components/modules/property-tax/typeofusemaster/UseTypeForm";
import { getTypeById, getTypeOfUseMasterData } from "../../../actions";
import { notFound } from "next/navigation";

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
    <Suspense fallback={<div>Loading...</div>}>
      <UseTypeForm 
        id={id}
        initialData={typeData}
        allGroups={masterData.groups || []}
        allTypes={masterData.types || []}
      />
    </Suspense>
  );
}

