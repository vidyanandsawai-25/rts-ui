import { getCmsMastersAction } from "../actions";
import CmsMastersConfig from "@/components/modules/cms/CmsMastersConfig";

export default async function CmsMastersPage() {
  const masters = await getCmsMastersAction();

  return (
    <div className="w-full">
      <CmsMastersConfig masters={masters} />
    </div>
  );
}
