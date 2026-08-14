import { QuickDataEntryClientWrapper } from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper";
import { getPropertyBasicDetailsAction, validateFloorCompatibilityAction } from "./Property/action";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children, params }: Props) {
    const { propertyId } = await params;
    const numericPropertyId = Number(propertyId);

    const [basicDetailsRes, compatibilityRes] = await Promise.all([
        propertyId ? getPropertyBasicDetailsAction(numericPropertyId) : Promise.resolve(null),
        numericPropertyId && !isNaN(numericPropertyId)
            ? validateFloorCompatibilityAction(numericPropertyId)
            : Promise.resolve(null),
    ]);

    const basicDetails = basicDetailsRes?.success ? basicDetailsRes.data : null;
    const categoryName = basicDetails?.categoryName || "";
    const propertyDescription = basicDetails?.propertyDescription || "";
    const initialHasIncompatibleFloor = compatibilityRes?.success ? !compatibilityRes.data?.isCompatible : false;

    return (
        <QuickDataEntryClientWrapper
            categoryName={categoryName}
            propertyDescription={propertyDescription}
            initialHasIncompatibleFloor={initialHasIncompatibleFloor}
        >
            {children}
        </QuickDataEntryClientWrapper>
    );
}