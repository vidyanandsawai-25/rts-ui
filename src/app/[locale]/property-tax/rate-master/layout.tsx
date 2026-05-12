import { PageContainer } from "@/components/common/PageContainer";
import { RateTabsNavigation } from "@/components/modules/property-tax/RVRateMaster/RateTabsNavigation";

export default function RateMasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <RateTabsNavigation />
      <div className="">
        {children}
      </div>
    </PageContainer>
  );
}