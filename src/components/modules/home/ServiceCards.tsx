
'use client';

import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Service, ServiceCardProps } from "@/types/home/home.types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/ActionButton";
import { getDepartmentIcon } from "@/config/home-services.config";

/**
 * Gets the icon component for a department name
 */
const getIcon = (departmentName: string) => {
    const { icon: IconComponent, className } = getDepartmentIcon(departmentName);
    return <IconComponent className={className} aria-hidden="true" />;
};


const ServiceCard: React.FC<ServiceCardProps> = ({
    link,
    icon,
    title,
    subtext,
    stats
}) => {
    return (
        <Link 
            href={link} 
            className="block group decoration-0 no-underline h-full"
            aria-label={`Navigate to ${title}`}
        >
            <article className={cn(
                "relative p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 min-h-[180px]",
                "flex flex-col justify-between border-l-[6px] border-solid border-[#004c8c] hover:scale-[1.02] h-full"
            )}>
                <div className="absolute top-2 right-3 flex flex-col items-end z-10 gap-1" aria-label="Statistics">
                    {stats?.map((stat: { label: string; value: string }, index: number) => (
                        <Badge 
                            key={index}
                            variant="secondary"
                            size="sm"
                            className="bg-blue-50/50 text-[#004c8c] border-blue-100 font-bold"
                        >
                            {stat.label}: {stat.value}
                        </Badge>
                    ))}
                </div>
                <div className="flex flex-col h-full pt-2">
                    <div className="mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                        {getIcon(icon)}
                    </div>
                    <div className="mt-auto">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#004c8c] transition-colors leading-tight">{title}</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3">{subtext}</p>
                    </div>
                </div>
            </article>
        </Link>
    );
};

interface ServiceCardsProps {
    services?: Service[];
    error?: string;
}

/**
 * Error state component
 */
const ServiceLoadError: React.FC<{ error: string }> = ({ error }) => {
    const handleRefresh = () => window.location.reload();

    return (
        <section className="w-full p-4 sm:p-8 md:p-12 min-h-[300px]" aria-label="Service Load Error">
            <div className="max-w-md mx-auto text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Unable to load services
                    </h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <Button
                        onClick={handleRefresh}
                        variant="secondary"
                        size="sm"
                        className="inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                </div>
            </div>
        </section>
    );
};

/**
 * Empty state when user has no department access
 */
const NoDepartmentsMessage: React.FC = () => (
    <section className="w-full p-4 sm:p-8 md:p-12 min-h-[300px]" aria-label="No Services">
        <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No departments assigned
                </h3>
                <p className="text-sm text-gray-500">
                    You don&apos;t have access to any departments yet. Please contact your administrator.
                </p>
            </div>
        </div>
    </section>
);

const ServiceCards: React.FC<ServiceCardsProps> = ({ services = [], error }) => {
    // Show error state
    if (error) {
        return <ServiceLoadError error={error} />;
    }

    // Show empty state when no services
    if (!services || services.length === 0) {
        return <NoDepartmentsMessage />;
    }

    return (
        <section className="w-full p-4 sm:p-8 md:p-12 min-h-[400px]" aria-label="Available Services">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
                {services.map(({ id, ...rest }) => (
                    <ServiceCard key={id} {...rest} />
                ))}
            </div>
        </section>
    );
};

export default ServiceCards;
