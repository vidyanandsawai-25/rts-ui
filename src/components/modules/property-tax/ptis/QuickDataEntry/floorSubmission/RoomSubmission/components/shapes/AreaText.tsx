import React from "react";

interface AreaTextProps {
    area: number;
    unit: string;
    x: number;
    y: number;
    roomNo?: string;
}

export const AreaText: React.FC<AreaTextProps> = ({
    area,
    unit,
    x,
    y,
    roomNo,
}) => {
    if (area <= 0) return null;
    return (
        <g className="animate-in fade-in duration-500">
            {roomNo && (
                <text
                    x={x}
                    y={y - 25}
                    fill="#1E3A8A"
                    fontSize="16"
                    fontWeight="900"
                    textAnchor="middle"
                    className="drop-shadow-sm"
                >
                    {roomNo}
                </text>
            )}
            <rect
                x={x - 50}
                y={y - 12}
                width="100"
                height="24"
                rx="6"
                fill="white"
                fillOpacity="0.9"
                stroke="#10B981"
                strokeWidth="1.5"
                className="drop-shadow-sm"
            />
            <text
                x={x}
                y={y + 5}
                fill="#059669"
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
            >
                {area.toFixed(2)} {unit}
            </text>
        </g>
    );
};
