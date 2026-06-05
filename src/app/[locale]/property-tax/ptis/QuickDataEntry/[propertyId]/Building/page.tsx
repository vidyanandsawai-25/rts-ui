import { setRequestLocale } from 'next-intl/server';
import BuildingForm from "@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm";
import { getBuildingPermissionsAction } from "./action";

export const dynamic = 'force-dynamic';

interface BuildingPageProps {
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function BuildingPage({ params }: BuildingPageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    // Fetch building permissions from the server
    const response = await getBuildingPermissionsAction(propertyId);

    // Generate a unique key based on propertyId and the certificates data state to reset state upon navigation or save
    const dataKey = `${propertyId}-${(response.data || []).map(c => `${c.propertyCertificateId || ''}-${c.certificateNo || ''}-${c.issueDate || ''}-${c.documentGuid || ''}`).join('-')}`;

    return (
        <BuildingForm
            key={dataKey}
            initialBuildingPermission={response.data || null}
            propertyId={propertyId}
        />
    );
}