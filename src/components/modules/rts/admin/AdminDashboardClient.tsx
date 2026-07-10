"use client";

import Link from "next/link";
import { Building2, ClipboardList, FilePenLine } from "lucide-react";
import { departments } from "@/lib/mock/rts/departments";

type AdminDashboardClientProps = {
  locale: string;
};

const cards = [
  {
    title: "Create Department",
    description: "Manage all departments and their configurations",
    icon: Building2,
    accent: "from-[#eef5ff] to-[#f8fbff]",
    badgeBg: "bg-[#d8e8ff]",
    iconColor: "text-[#2563eb]",
    hrefKey: "department",
  },
  {
    title: "Create Services",
    description: "Add and manage services under departments",
    icon: ClipboardList,
    accent: "from-[#eefdfb] to-[#f8fffd]",
    badgeBg: "bg-[#d8fff6]",
    iconColor: "text-[#0f988f]",
    hrefKey: "services",
  },
  {
    title: "Create Service Form Builder",
    description: "Build custom forms for services",
    icon: FilePenLine,
    accent: "from-[#fbf4ff] to-[#fffafd]",
    badgeBg: "bg-[#f1ddff]",
    iconColor: "text-[#a020f6]",
    hrefKey: "reports",
  },
] as const;

export default function AdminDashboardClient({ locale }: AdminDashboardClientProps) {
  const totalServices = departments.reduce((count, department) => count + department.services.length, 0);

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-10">
        <h1 className="text-4xl font-medium tracking-tight text-[#102b55]">Admin Dashboard</h1>
        <p className="mt-3 text-[1.05rem] text-[#3e5074]">Manage departments, services, and forms</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const total =
            card.hrefKey === "department" ? departments.length : card.hrefKey === "services" ? totalServices : 0;

          return (
            <Link
              key={card.title}
              href={`/${locale}/rts/admin/${card.hrefKey === "reports" ? "reports" : card.hrefKey}`}
              className={`rounded-[24px] border border-[#dfe7ef] bg-gradient-to-br ${card.accent} p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]`}
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${card.badgeBg}`}>
                <Icon className={`h-8 w-8 ${card.iconColor}`} />
              </div>
              <h2 className="text-[2rem] leading-none text-[#112c56]">{card.title}</h2>
              <p className="mt-3 max-w-[30ch] text-base text-[#46607f]">{card.description}</p>
              <div className="mt-8 inline-flex rounded-2xl bg-white/80 px-4 py-2 text-[1.1rem] font-semibold text-[#0b928c] shadow-sm">
                Total: {total}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
