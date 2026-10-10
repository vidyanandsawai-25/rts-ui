import React from "react";
import { UploadDownloadContainer } from "@/components/modules/property-tax/PropertyMedia/UploadDownload/UploadDownloadContainer";
import {
    fetchPropertyMediaCategoryOptionsAction,
    fetchSubCategoryOptionsAction,
    fetchPropertyMediaImportMatchPreviewAction,
    fetchPropertyMediaBrowseMatchPreviewAction,
    fetchZoneOptionsAction,
    fetchWardOptionsAction,
} from "../action";
import {
    CategoryOption,
    ImportMatchPreviewResult,
    BrowseMatchPreviewResult,
    ZoneItem,
    WardItem,
} from "@/types/PropertyMedia/PropertyMedia.types";
import {
    mapZonesToOptions,
    mapWardsToOptions,
} from "@/lib/utils/PropertyMedia/propertyMediaHelper";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        category?: string;
        subCategory?: string;
        sourceTab?: string;
        previewId?: string;
        page?: string;
        pageSize?: string;
        zone?: string;
        ward?: string;
    }>;
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
    const resolvedSearchParams = await searchParams;
    const categoryParam = resolvedSearchParams?.category;
    const categoryId = categoryParam ? Number(categoryParam) : undefined;
    const previewId = resolvedSearchParams?.previewId || undefined;
    const page = Number(resolvedSearchParams?.page) || 1;
    const pageSize = Number(resolvedSearchParams?.pageSize) || 10;
    const zoneParam = resolvedSearchParams?.zone;

    const [categoryOptions, subCategoryOptions, previewData, devicePreviewData, rawZoneOptions, rawWardOptions] = await Promise.all([
        fetchPropertyMediaCategoryOptionsAction(),
        fetchSubCategoryOptionsAction(categoryId),
        fetchPropertyMediaImportMatchPreviewAction(page, pageSize),
        previewId ? fetchPropertyMediaBrowseMatchPreviewAction(previewId, page, pageSize) : Promise.resolve(null),
        fetchZoneOptionsAction(),
        zoneParam ? fetchWardOptionsAction(zoneParam) : Promise.resolve(null),
    ]);

    return (
        <UploadDownloadContainer
            categoryOptions={categoryOptions as CategoryOption[]}
            subCategoryOptions={(subCategoryOptions || []) as CategoryOption[]}
            previewData={previewData as ImportMatchPreviewResult}
            devicePreviewData={devicePreviewData as BrowseMatchPreviewResult | null}
            zoneOptions={mapZonesToOptions((rawZoneOptions ?? []) as ZoneItem[])}
            wardOptions={mapWardsToOptions((rawWardOptions ?? []) as WardItem[])}
        />
    );
}
