import UseSubTypeForm from "@/components/modules/property-tax/typeofusemaster/UseSubTypeForm";
import { getTypeById, getAllSubTypes } from "../../actions";
import type { UseSubType } from "@/types/typeOfUse.types";

export default async function AddSubTypePage({
  searchParams,
}: {
  searchParams: Promise<{ typeId?: string }>;
}) {
  const params = await searchParams;
  const typeId = Number(params.typeId || 0);
  
  // Fetch type info and all subtypes for duplicate checking if typeId is provided
  let typeInfo = null;
  let allSubTypes: UseSubType[] = [];
  
  if (typeId > 0) {
    const [typeData, allSubTypesData] = await Promise.all([
      getTypeById(typeId),
      getAllSubTypes(typeId),
    ]);
    typeInfo = typeData;
    allSubTypes = allSubTypesData.items || [];
  }
  
  return (
    <>
      <UseSubTypeForm 
        id={null}
        typeInfo={typeInfo}
        allSubTypes={allSubTypes}
      />
    </>
  );
}
