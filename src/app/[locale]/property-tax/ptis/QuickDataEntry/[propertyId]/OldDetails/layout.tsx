import OldDetailsClientWrapper from "@/components/modules/property-tax/ptis/QuickDataEntry/old-details/OldDetilasClientWrapper";

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function Layout({ children }: Props) {

    return (
        <OldDetailsClientWrapper>
            {children}
        </OldDetailsClientWrapper>
    );
}