

import React from "react";
import Link from "next/link";
import { Service, ServiceCardProps } from "@/types/home/home.types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/common/Badge";
import {
    Home,
    Droplet,
    ShoppingCart,
    FileText,
    Trash2,
    Building2,
    Megaphone,
    Timer,
    Landmark
} from "lucide-react";

// Helper to map icon string to component with colors matching the original emoji feel
const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'property-tax': return <Home className="w-8 h-8 text-gray-700" />; // House
        case 'water-tax': return <Droplet className="w-8 h-8 text-blue-500 fill-blue-500" />; // Water Drop
        case 'bajar-parwana': return <ShoppingCart className="w-8 h-8 text-orange-600" />; // Cart
        case 'birth-death': return <FileText className="w-8 h-8 text-amber-700" />; // Scroll/Certificate
        case 'garbage-collection': return <Trash2 className="w-8 h-8 text-green-700" />; // Trash
        case 'building-permission': return <Building2 className="w-8 h-8 text-purple-700" />; // Building
        case 'grievance': return <Megaphone className="w-8 h-8 text-red-600" />; // Megaphone
        case 'rts': return <Timer className="w-8 h-8 text-indigo-600" />; // Timer
        case 'assets': return <Landmark className="w-8 h-8 text-teal-700" />; // Bank/Landmark
        default: return <Home className="w-8 h-8 text-gray-700" />;
    }
};


const ServiceCard: React.FC<ServiceCardProps> = ({
    link,
    icon,
    title,
    subtext,
    stats
}) => {
    return (
        <Link href={link} className="block group decoration-0 no-underline h-full">
            <div className={cn(
                "relative p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 min-h-[180px]",
                "flex flex-col justify-between border-l-[6px] border-solid border-[#004c8c] hover:scale-[1.02] h-full"
            )}>
                <div className="absolute top-2 right-3 flex flex-col items-end z-10 gap-1">
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
                        <div className="text-xl font-bold text-gray-800 group-hover:text-[#004c8c] transition-colors leading-tight">{title}</div>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3">{subtext}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

interface ServiceCardsProps {
    services?: Service[];
}

const ServiceCards: React.FC<ServiceCardsProps> = ({ services = [] }) => {
    if (!services || !services.length) return null;

    return (
        <section className="w-full p-4 sm:p-8 md:p-12 min-h-[400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
                {services.map(({ id, ...rest }) => (
                    <ServiceCard key={id} {...rest} />
                ))}
            </div>
        </section>
    );
};

export default ServiceCards;
