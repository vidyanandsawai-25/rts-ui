"use client";

import React from "react";
import { Select } from "@/components/common";
import { useRoomTypeMaster } from "@/hooks/ptis/RoomSubmission/useRoomTypeMaster";
import { useTranslations } from "next-intl";

interface RoomTypeSelectProps {
    value: string | undefined;
    onChange: (value: string, roomTypeId?: number) => void;
    className?: string;
    disabled?: boolean;
}

export const RoomTypeSelect: React.FC<RoomTypeSelectProps> = ({ value, onChange, className, disabled }) => {
    const { roomTypes, roomTypeDetails, isLoading } = useRoomTypeMaster();
    const t = useTranslations("quickDataEntry");

    const options = [
        { label: t("roomSubmission.input.roomTypes.select"), value: "-Select-" },
        ...(roomTypes?.map((type) => ({ label: type, value: type })) || []),
    ];

    const handleChange = (_: React.ChangeEvent<HTMLSelectElement> | null, newVal: string) => {
        // Find the roomTypeId from roomTypeDetails based on the selected name
        // Check all possible name fields with case-insensitive matching
        const normalizedVal = newVal?.trim().toLowerCase();
        const selectedDetail = roomTypeDetails?.find((detail) => {
            // Check all possible name fields from the API response
            const possibleNames = [
                detail.roomTypeName,
                detail.description,
                (detail as Record<string, unknown>).roomTypeDescription as string | undefined,
                detail.roomTypeCode,
            ].filter(Boolean);
            
            return possibleNames.some(name => 
                String(name).trim().toLowerCase() === normalizedVal
            );
        });
        
        // Get roomTypeId - check multiple possible field names
        const roomTypeId = selectedDetail?.roomTypeId ?? 
            (selectedDetail as Record<string, unknown> | undefined)?.id as number | undefined;
        
        onChange(newVal, roomTypeId);
    };

    return (
        <Select
            options={options}
            value={value || "-Select-"}
            onChange={handleChange}
            disabled={disabled || isLoading}
            placeholder={isLoading ? t("floor.loading") : t("roomSubmission.input.roomTypes.select")}
            selectSize="md"
            className={className}
        />
    );
};
