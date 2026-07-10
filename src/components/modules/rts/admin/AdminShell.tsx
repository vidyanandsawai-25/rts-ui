"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CircleHelp,
  ClipboardList,
  House,
  Languages,
  LogOut,
  Menu,
  Moon,
  Search,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { adminLogoutAction } from "@/app/[locale]/login/admin/actions";

type AdminShellProps = {
  children: React.ReactNode;
  locale: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
  match?: (pathname: string) => boolean;
};

function AdminFooter() {
  return (
    <footer className="border-t border-[#eadff3] bg-gradient-to-r from-[#fff6fb] via-[#fffdf9] to-[#fff9ef] px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-xs text-[#20305c]">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white shadow-sm">
            <Image src="/favicon.ico" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <div>
            <p className="font-medium">Government of Maharashtra | Right to Service Act 2015</p>
            <p className="text-[11px] text-[#5d6b8a]">© 2025 All Rights Reserved - by Sthapatya Consultants Pvt. Ltd.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {["Terms of Service", "Contact", "Privacy"].map((item, index) => (
            <span
              key={item}
              className={`rounded-full px-3 py-1 text-[11px] font-medium text-white shadow-sm ${
                index === 0 ? "bg-[#7c84ff]" : index === 1 ? "bg-[#cf6df7]" : "bg-[#ff69b8]"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function AdminShell({ children, locale }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        href: `/${locale}/rts/admin`,
        label: "Home",
        icon: House,
        match: (currentPath) => currentPath === `/${locale}/rts/admin`,
      },
      {
        href: `/${locale}/rts/admin/department`,
        label: "Department",
        icon: Building2,
        group: "Management",
      },
      {
        href: `/${locale}/rts/admin/services`,
        label: "Services",
        icon: ClipboardList,
        group: "Management",
      },
      {
        href: `/${locale}/rts/admin/reports`,
        label: "Reports",
        icon: Sparkles,
        group: "Analytics",
      },
    ],
    [locale]
  );

  const navContent = (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#f4fffe_0%,#fbffff_100%)]">
      <div className="border-b border-[#d8e7ea] px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0fb3ad] text-lg font-bold text-white shadow-[0_10px_20px_rgba(15,179,173,0.28)]">
            N
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#55708b]">Workspace</p>
            <h2 className="text-[1.05rem] font-semibold text-[#102b55]">Dashboard</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {navItems.map((item, index) => {
          const showGroup = item.group && (index === 0 || navItems[index - 1]?.group !== item.group);
          const isActive = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <div key={item.href} className="mb-2">
              {showGroup ? (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#35527d]">
                  {item.group}
                </p>
              ) : null}
              <Link
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#119f98] text-white shadow-[0_12px_24px_rgba(17,159,152,0.28)]"
                    : "text-[#1f3764] hover:bg-white hover:shadow-sm"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#d8e7ea] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0fb3ad] text-sm font-bold text-white shadow-sm">
            N
          </div>
          <div>
            <p className="text-sm font-semibold text-[#102b55]">Nodal User</p>
            <p className="text-xs text-[#60708b]">Admin console</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#eadff3] bg-gradient-to-r from-[#fff7fb] via-[#fffafc] to-[#fffdf3] shadow-[0_2px_8px_rgba(30,41,59,0.06)]">
        <div className="flex flex-wrap items-center gap-3 px-4 py-4 lg:flex-nowrap lg:gap-5 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d7dceb] bg-white text-[#16305f] lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href={`/${locale}/rts/admin`} className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
              <Image src="/favicon.ico" alt="Municipal logo" width={44} height={44} className="object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[1.05rem] font-medium leading-tight text-[#2146d0]">Municipal Corporation</p>
              <p className="truncate text-sm text-[#ff2f48]">Right to Service Act 2015 (RTS)</p>
            </div>
          </Link>

          <div className="order-3 w-full lg:order-none lg:mx-auto lg:max-w-[450px] lg:flex-1">
            <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#d8deea] bg-white px-4 text-[#62708a] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="search"
                placeholder="Search services..."
                className="w-full bg-transparent text-sm text-[#20305c] outline-none placeholder:text-[#7d8ba5]"
              />
              <Search className="h-4 w-4 shrink-0 text-[#8a96af]" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden h-11 items-center gap-2 rounded-2xl border border-[#d8deea] bg-white px-4 text-sm font-medium text-[#102b55] md:inline-flex">
              <Languages className="h-4 w-4" />
              English
            </button>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8deea] bg-white text-[#33446f]">
              <Moon className="h-4 w-4" />
            </button>
            <button className="hidden h-11 items-center gap-2 rounded-2xl bg-[#10a83c] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(16,168,60,0.22)] md:inline-flex">
              <CircleHelp className="h-4 w-4" />
              Help
            </button>
            <button className="relative hidden h-11 items-center rounded-2xl bg-gradient-to-r from-[#8e1fff] to-[#cc14ff] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(158,31,255,0.24)] md:inline-flex">
              Track Service
              <span className="absolute right-3 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff354f] px-1 text-[10px] font-bold">
                1
              </span>
            </button>
            <div className="hidden h-11 items-center gap-2 rounded-2xl bg-[#2359f0] px-4 text-white shadow-[0_10px_22px_rgba(35,89,240,0.22)] md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#2359f0]">
                <Shield className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold">Administrator</p>
                <p className="text-[10px] text-white/90">RTS2024001234</p>
              </div>
            </div>
            <form action={adminLogoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff1018] text-white shadow-[0_10px_22px_rgba(255,16,24,0.2)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[258px] shrink-0 border-r border-[#dfe7ef] lg:block">{navContent}</aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6 lg:px-8">{children}</div>
          <AdminFooter />
        </main>
      </div>

      <button
        type="button"
        className="fixed bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#242424] text-white shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        aria-label="Open help"
      >
        <CircleHelp className="h-5 w-5" />
      </button>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#091429]/45 backdrop-blur-[1px]"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="relative h-full w-[290px] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#102b55] shadow-sm"
              aria-label="Close admin navigation"
            >
              <X className="h-4 w-4" />
            </button>
            {navContent}
          </div>
        </div>
      ) : null}
    </div>
  );
}
