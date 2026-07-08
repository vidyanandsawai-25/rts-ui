import { QuickDataEntryClientWrapper } from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper";
import { getPropertyBasicDetailsAction } from "./FloorSubmission/actions";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children, params }: Props) {
    const { propertyId } = await params;
    const basicDetails = propertyId ? await getPropertyBasicDetailsAction(propertyId) : null;
    const categoryName = basicDetails?.categoryName || "";

    return (
        <QuickDataEntryClientWrapper categoryName={categoryName}>
            {children}
        </QuickDataEntryClientWrapper>
    );
}