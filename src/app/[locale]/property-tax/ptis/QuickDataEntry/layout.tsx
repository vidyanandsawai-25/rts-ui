import QuickDataEntryLayout from "@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataEntryLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
            <QuickDataEntryLayout>
                {children}
            </QuickDataEntryLayout>      
    );  
}
