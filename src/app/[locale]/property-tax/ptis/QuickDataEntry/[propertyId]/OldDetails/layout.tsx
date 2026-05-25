import { ReactNode } from "react";
import OldDetailsClientWrapper from "@/components/modules/property-tax/ptis/QuickDataEntry/old-details/OldDetilasClientWrapper";

interface Props {
    children: ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <OldDetailsClientWrapper>
            {children}
        </OldDetailsClientWrapper>
    );
}