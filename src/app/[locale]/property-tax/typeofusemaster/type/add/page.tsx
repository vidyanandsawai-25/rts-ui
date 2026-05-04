import UseTypeForm from "@/components/modules/property-tax/typeofusemaster/UseTypeForm";
import { getTypeOfUseMasterData } from "../../actions";

// Force this page to be dynamic (don't pre-render at build time)
export const dynamic = 'force-dynamic';

export default async function AddTypePage() {
  // Fetch groups and types for dropdown and duplicate checking
  const masterData = await getTypeOfUseMasterData();
  
  return (
    <>
      <UseTypeForm 
        id={null}
        allGroups={masterData.groups || []}
        allTypes={masterData.types || []}
      />
    </>
  );
}
