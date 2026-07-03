'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import ReassesmentScreen from '@/components/modules/property-tax/ptis/reassement-screen/ReassesmentScreen';
import {
    getMappedReassessmentDataAction,
    getMappedRetrospectiveTaxDataAction,
    type MappedReassessmentData,
    type MappedRetrospectiveData,
} from './action';

interface ReassessmentPageProps {
    wardId?: number;
    propertyNo?: string;
    partitionNo?: string;
}

export default function ReassessmentPage({ 
    wardId: propWardId, 
    propertyNo: propPropertyNo, 
    partitionNo: propPartitionNo 
}: ReassessmentPageProps) {
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [data, setData] = useState<MappedReassessmentData | null>(null);
    const [retrospectiveData, setRetrospectiveData] = useState<MappedRetrospectiveData | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [retrospectiveError, setRetrospectiveError] = useState<string | undefined>();
    const [hasFetched, setHasFetched] = useState(false);

    // Get params from props or searchParams
    const wardId = propWardId || Number(searchParams.get('wardId')) || 0;
    const propertyNo = propPropertyNo || searchParams.get('propertyNo') || '';
    const partitionNo = propPartitionNo || searchParams.get('partitionNo') || '';

    useEffect(() => {
        // Don't fetch if required params are missing
        if (!wardId || !propertyNo) {
            return;
        }

        // Avoid re-fetching
        if (hasFetched) {
            return;
        }

        startTransition(async () => {
            try {
                const [reassessmentResult, retrospectiveResult] = await Promise.all([
                    getMappedReassessmentDataAction(wardId, propertyNo, partitionNo),
                    getMappedRetrospectiveTaxDataAction(wardId, propertyNo, partitionNo),
                ]);

                if (reassessmentResult.success && reassessmentResult.data) {
                    setData(reassessmentResult.data);
                    setError(undefined);
                } else {
                    setError(reassessmentResult.error || 'Failed to load reassessment data');
                }

                if (retrospectiveResult.success && retrospectiveResult.data) {
                    setRetrospectiveData(retrospectiveResult.data);
                    setRetrospectiveError(undefined);
                } else {
                    setRetrospectiveError(retrospectiveResult.error || 'Failed to load retrospective tax details');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            } finally {
                setHasFetched(true);
            }
        });
    }, [wardId, propertyNo, partitionNo, hasFetched]);

    // Show message if required params are missing
    if (!wardId || !propertyNo) {
        return (
            <div className="p-4">
                <ReassesmentScreen 
                    error="Ward ID and Property Number are required to view reassessment details."
                />
            </div>
        );
    }

    return (
        <div className="p-4">
            <ReassesmentScreen 
                oldFloorDetails={data?.oldFloorDetails}
                newFloorDetails={data?.newFloorDetails}
                taxColumns={data?.taxColumns}
                taxRows={data?.taxRows}
                error={error}
                isLoading={isPending}
                retrospectiveTaxColumns={retrospectiveData?.columns}
                retrospectiveTaxRows={retrospectiveData?.rows}
                retrospectiveError={retrospectiveError}
                photos={data?.photos}
            />
        </div>
    );
}