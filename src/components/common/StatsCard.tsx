// "use client";

// import * as React from "react";
// import {
//   Home,
//   Droplets,
//   Briefcase,
//   Calendar,
//   FileText,
//   MapPin,
//   Circle,
//   type LucideIcon,
// } from "lucide-react";
// import { Badge } from "./badge";

// type IconName = "Home" | "Droplets" | "Briefcase" | "Calendar" | "FileText" | "MapPin";

// const ICONS: Record<IconName, LucideIcon> = {
//   Home,
//   Droplets,
//   Briefcase,
//   Calendar,
//   FileText,
//   MapPin,
// };

// export type StatsCardProps<TId extends string = string> = {
//   id: TId;
//   icon: IconName | string;
//   title: string;
//   subtitle: string;
//   value?: string;
//   badge?: string;
//   badgeColor?: string;
//   onClick?: (id: TId) => void;
// };

// const COLOR_MAP: Record<string, { iconBg: string; outerBg: string; iconColor: string }> = {
//   Home: { iconBg: "bg-pink-100", outerBg: "bg-pink-50", iconColor: "text-pink-600" },
//   Droplets: { iconBg: "bg-cyan-100", outerBg: "bg-cyan-50", iconColor: "text-cyan-600" },
//   Briefcase: { iconBg: "bg-amber-100", outerBg: "bg-amber-50", iconColor: "text-amber-700" },
//   Calendar: { iconBg: "bg-green-100", outerBg: "bg-green-50", iconColor: "text-green-700" },
//   FileText: { iconBg: "bg-purple-100", outerBg: "bg-purple-50", iconColor: "text-purple-700" },
//   MapPin: { iconBg: "bg-orange-100", outerBg: "bg-orange-50", iconColor: "text-orange-700" },
// };

// export default function StatsCard<TId extends string = string>({
//   id,
//   icon,
//   title,
//   subtitle,
//   value,
//   badge,
//   badgeColor,
//   onClick,
// }: StatsCardProps<TId>) {
//   const IconComp = (ICONS as Record<string, LucideIcon>)[String(icon)] ?? Circle;

//   const colors =
//     COLOR_MAP[String(icon)] ?? {
//       iconBg: "bg-slate-100",
//       outerBg: "bg-slate-50",
//       iconColor: "text-slate-700",
//     };

//   return (
//     <button
//       type="button"
//       onClick={() => onClick?.(id)}
//       className={[
//         "w-full rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200",
//         "text-left p-3 sm:p-3.5",
//         onClick ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : "",
//         colors.outerBg,
//       ].join(" ")}
//     >
//       <div className="flex items-start gap-3">
//         <div className={[colors.iconBg, "rounded-lg p-2.5 flex-shrink-0"].join(" ")}>
//           <IconComp className={["w-5 h-5", colors.iconColor].join(" ")} />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="flex items-center justify-between gap-2">
//             <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>

//             {badge ? (
//               <Badge
//                 className={[
//                   "border-0 text-[10px] px-2 py-0 h-4 text-white rounded-full",
//                   badgeColor ?? "bg-slate-500",
//                 ].join(" ")}
//               >
//                 {badge}
//               </Badge>
//             ) : null}
//           </div>

//           <p className="mt-0.5 text-[15px] font-semibold text-slate-900 truncate">{title}</p>

//           {value ? <p className="mt-1 text-lg font-bold text-slate-900">{value}</p> : <div className="mt-1 h-[22px]" />}
//         </div>
//       </div>
//     </button>
//   );
// }
"use client";

import {
  Home,
  Droplets,
  Briefcase,
  Calendar,
  FileText,
  MapPin,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "./Badge";

type IconName =
  | "Home"
  | "Droplets"
  | "Briefcase"
  | "Calendar"
  | "FileText"
  | "MapPin";

const ICONS: Record<IconName, LucideIcon> = {
  Home,
  Droplets,
  Briefcase,
  Calendar,
  FileText,
  MapPin,
};

export type StatsCardProps<TId extends string = string> = {
  id: TId;
  icon: IconName | string;
  title: string;
  subtitle: string;
  value?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: (id: TId) => void;
};

const COLOR_MAP: Record<
  string,
  { iconBg: string; outerBg: string; iconColor: string }
> = {
  Home: { iconBg: "bg-pink-100", outerBg: "bg-pink-50", iconColor: "text-pink-600" },
  Droplets: { iconBg: "bg-cyan-100", outerBg: "bg-cyan-50", iconColor: "text-cyan-600" },
  Briefcase: { iconBg: "bg-amber-100", outerBg: "bg-amber-50", iconColor: "text-amber-700" },
  Calendar: { iconBg: "bg-green-100", outerBg: "bg-green-50", iconColor: "text-green-700" },
  FileText: { iconBg: "bg-purple-100", outerBg: "bg-purple-50", iconColor: "text-purple-700" },
  MapPin: { iconBg: "bg-orange-100", outerBg: "bg-orange-50", iconColor: "text-orange-700" },
};

export default function StatsCard<TId extends string = string>({
  id,
  icon,
  title,
  subtitle,
  value,
  badge,
  badgeColor,
  onClick,
}: StatsCardProps<TId>) {
  const IconComp = (ICONS as Record<string, LucideIcon>)[String(icon)] ?? Circle;

  const colors =
    COLOR_MAP[String(icon)] ?? {
      iconBg: "bg-slate-100",
      outerBg: "bg-slate-50",
      iconColor: "text-slate-700",
    };

  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={[
        "w-full rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200",
        "text-left p-3 sm:p-3.5",
        onClick ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : "",
        colors.outerBg,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={[colors.iconBg, "rounded-lg p-2.5 flex-shrink-0"].join(" ")}>
          <IconComp className={["w-5 h-5", colors.iconColor].join(" ")} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>

            {badge ? (
              <Badge
                className={[
                  "border-0 text-[10px] px-2 py-0 h-4 text-white rounded-full",
                  badgeColor ?? "bg-slate-500",
                ].join(" ")}
              >
                {badge}
              </Badge>
            ) : null}
          </div>

          <p className="mt-0.5 text-[15px] font-semibold text-slate-900 truncate">
            {title}
          </p>

          {value ? (
            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
          ) : (
            <div className="mt-1 h-[22px]" />
          )}
        </div>
      </div>
    </button>
  );
}
