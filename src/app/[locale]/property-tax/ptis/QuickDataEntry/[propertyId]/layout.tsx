import { QuickDataEntryClientWrapper } from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryClientWrapper";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children }: Props) {

    return (
        <QuickDataEntryClientWrapper>
            {children}
        </QuickDataEntryClientWrapper>
    );
}