import { PageContainer } from "@/components/common/PageContainer";
import { WaterConnectionHeader } from "@/components/modules/water-bill/water-connection-master";

interface LayoutProps {
  children: React.ReactNode;
}

export default function WaterConnectionMasterLayout({
  children,
}: Readonly<LayoutProps>) {
  return (
    <PageContainer>
      <div className="w-full flex flex-col gap-4">
        <WaterConnectionHeader />
        <div className="w-full">{children}</div>
      </div>
    </PageContainer>
  );
}
