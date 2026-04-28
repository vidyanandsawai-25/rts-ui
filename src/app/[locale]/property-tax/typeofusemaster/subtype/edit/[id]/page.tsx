import { Suspense } from "react";
import UseSubTypeForm from "@/components/modules/property-tax/typeofusemaster/UseSubTypeForm";
import { getSubTypeById, getTypeById, getAllSubTypes } from "../../../actions";
import { notFound } from "next/navigation";

export default async function EditSubTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch subtype data first
  const subTypeData = await getSubTypeById(id);
  
  if (!subTypeData) {
    notFound();
  }
  
  // Fetch related type info and all subtypes for duplicate check
  const [typeInfo, allSubTypesData] = await Promise.all([
    getTypeById(subTypeData.typeOfUseId),
    getAllSubTypes(subTypeData.typeOfUseId),
  ]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UseSubTypeForm 
        id={id}
        initialData={subTypeData}
        typeInfo={typeInfo}
        allSubTypes={allSubTypesData.items || []}
      />
    </Suspense>
  );
}


