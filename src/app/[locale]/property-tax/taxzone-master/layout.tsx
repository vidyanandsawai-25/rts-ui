import { Suspense } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { TaxZoneMasterErrorProvider } from "@/components/modules/property-tax/taxzonemaster/TaxZoneMasterErrorContext";
import { TaxZoneMasterLayoutContent } from "@/components/modules/property-tax/taxzonemaster/TaxZoneMasterLayoutContent";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function TaxZoneMasterLayout({
  children,
}: LayoutProps) {
  return (
    <TaxZoneMasterErrorProvider>
      <PageContainer className="p-4 sm:p-6">
        <TaxZoneMasterLayoutContent>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            }
          >
            {children}
          </Suspense>
        </TaxZoneMasterLayoutContent>
      </PageContainer>
    </TaxZoneMasterErrorProvider>
  );
}
