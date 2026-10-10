'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/common';
import { exportAuditTrail, exportDetailedCoverage, exportMissingProperties } from '@/lib/utils/PropertyMedia/propertyMediaExport.client';
import { AuditTrailExportParams, DetailedCoverageExportParams, MissingPropertiesExportParams } from '@/types/PropertyMedia/PropertyMedia.types';

/**
 * Custom React Hook that integrates with `useToast()` from `@/components/common`.
 */
export function usePropertyMediaExport() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCoverage = useCallback(
        async (params: Omit<DetailedCoverageExportParams, 'toastHandlers'>) => {
            if (isExporting) return;
            setIsExporting(true);
            try {
                await exportDetailedCoverage({
                    ...params,
                    toastHandlers: { success: toastSuccess, error: toastError },
                });
            } finally {
                setIsExporting(false);
            }
        },
        [isExporting, toastSuccess, toastError]
    );

    const handleExportMissing = useCallback(
        async (params: Omit<MissingPropertiesExportParams, 'toastHandlers'>) => {
            if (isExporting) return;
            setIsExporting(true);
            try {
                await exportMissingProperties({
                    ...params,
                    toastHandlers: { success: toastSuccess, error: toastError },
                });
            } finally {
                setIsExporting(false);
            }
        },
        [isExporting, toastSuccess, toastError]
    );

    const handleExportAuditTrail = useCallback(
        async (params: AuditTrailExportParams) => {
            if (isExporting) return;
            setIsExporting(true);
            try {
                await exportAuditTrail(params);
            } finally {
                setIsExporting(false);
            }
        },
        [isExporting]
    );

    return {
        exportDetailedCoverage: handleExportCoverage,
        exportMissingProperties: handleExportMissing,
        exportAuditTrail: handleExportAuditTrail,
        isExporting,
    };
}
