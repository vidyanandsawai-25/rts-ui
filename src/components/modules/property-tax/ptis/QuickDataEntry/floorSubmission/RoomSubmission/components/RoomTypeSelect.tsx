"use client";

import React from "react";
import { Select } from "@/components/common";
import { useRoomTypeMaster } from "@/hooks/ptis/RoomSubmission/useRoomTypeMaster";
import { useTranslations } from "next-intl";

interface RoomTypeSelectProps {
    value: string | undefined;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export const RoomTypeSelect: React.FC<RoomTypeSelectProps> = ({ value, onChange, className, disabled }) => {
    const { roomTypes, isLoading } = useRoomTypeMaster();
    const t = useTranslations("quickDataEntry");

    const options = [
        { label: t("roomSubmission.input.roomTypes.select"), value: "-Select-" },
        ...(roomTypes?.map((type) => ({ label: type, value: type })) || []),
    ];

    return (
        <Select
            options={options}
            value={value || "-Select-"}
            onChange={(_, newVal) => onChange(newVal)}
            disabled={disabled || isLoading}
            placeholder={isLoading ? t("floor.loading") : t("roomSubmission.input.roomTypes.select")}
            selectSize="md"
            className={className}
        />
    );
};
