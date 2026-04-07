import DrawerShell from '@/components/modules/property-tax/ptis/QuickDataEntry/QuickDataDrawer/DrawerShell';

interface QuickDataEntryLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function QuickDataEntryLayout({
    children,
    params,
}: QuickDataEntryLayoutProps) {
    const { locale } = await params;

    return (
        // <Suspense fallback={null}>
        <DrawerShell locale={locale}>
            {children}
        </DrawerShell>
        // </Suspense>
    );
}
