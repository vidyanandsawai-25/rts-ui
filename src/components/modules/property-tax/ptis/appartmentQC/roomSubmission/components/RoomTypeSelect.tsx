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
        const selectedDetail = roomTypeDetails?.find(
            (detail) => (detail.roomTypeName || detail.description || detail.roomTypeCode) === newVal
        );
        const roomTypeId = selectedDetail?.roomTypeId;
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
