import { AliasMaster } from "@/components/modules/property-tax/alias-master/AliasMaster";
import { PageContainer } from "@/components/common";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <PageContainer>
      <AliasMaster />
    </PageContainer>
  );
}
