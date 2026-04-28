import { Suspense } from "react";
import UseGroupForm from "@/components/modules/property-tax/typeofusemaster/UseGroupForm";
import { getTypeOfUseMasterData } from "../../actions";

export default async function AddGroupPage() {
  // Fetch groups for duplicate checking
  const masterData = await getTypeOfUseMasterData();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UseGroupForm 
        id={null} 
        allGroups={masterData.groups || []}
      />
    </Suspense>
  );
}
