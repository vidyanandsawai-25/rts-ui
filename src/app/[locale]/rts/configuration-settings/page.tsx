import { getRtsMastersAction } from "../actions";
import RtsMastersConfig from "@/components/modules/rts/configuration-settings/RtsMastersConfig";

export default async function RtsMastersPage() {
  const masters = await getRtsMastersAction();

  return (
    <div className="w-full">
      <RtsMastersConfig masters={masters} />
    </div>
  );
}
