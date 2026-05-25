import React, { useRef, useEffect } from "react";
import { Input } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { ParameterInputProps } from "@/types/room-details.types";

export const ParameterInput: React.FC<ParameterInputProps & { areaUnit?: "sq.m" | "sq.ft"; onEnter?: () => void }> = ({
    param,
    value,
    label,
    isFilled,
    onChange,
    autoFocus = false,
    x,
    y,
    verticalLabel = false,
    areaUnit = "sq.m",
    onEnter,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const unit = areaUnit === "sq.m" ? "m" : "ft";

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // Allow only numbers and one decimal point
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            // Limit integer part to 4 digits
            if (val.includes(".")) {
                const [intPart, decPart] = val.split(".");
                val = intPart.slice(0, 4) + "." + (decPart.slice(0, 4));
            } else {
                val = val.slice(0, 4);
            }
            onChange(val);
        }
    };

    return (
        <foreignObject x={x - 45} y={y - 15} width="90" height="60">
            <div className={`flex flex-col items-center p-1 rounded-md transition-all duration-300 ${isFilled ? "bg-green-50/80 border border-green-200" : ""}`}>
                {verticalLabel && <span className="text-[10px] font-bold text-[#10B981] mb-1">{label}</span>}
                <div className="relative group w-full">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={value}
                        maxLength={5}
                        onFocus={(e) => e.target.select()}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if (e.key === "." && String(value).includes(".")) {
                                e.preventDefault();
                                return;
                            }
                            const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "."];
                            if (!/^[0-9]$/.test(e.key) && !controlKeys.includes(e.key)) {
                                e.preventDefault();
                            }
                            if (e.key === "Enter" && onEnter) {
                                onEnter();
                            }
                        }}
                        className={cn(
                            "w-full h-7 bg-white border-2 text-center text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all",
                            isFilled ? "border-[#10B981] text-[#10B981]" : "border-gray-200 text-gray-400 group-hover:border-[#10B981]"
                        )}
                        placeholder={label}
                        data-param={param}
                    />
                    <span className="absolute right-1 top-1.5 text-[8px] font-bold text-gray-400">{unit}</span>
                </div>
                {!verticalLabel && <span className="text-[10px] font-bold text-[#10B981] mt-1">{label}</span>}
            </div>
        </foreignObject>
    );
};
