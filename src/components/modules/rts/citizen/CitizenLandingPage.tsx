'use client';

import { useState, useMemo, useEffect, useRef, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Download,
  Scale,
  MessageSquare,
  FileEdit,
  UserCheck,
  CreditCard,
  Clock,
  LoaderCircle,
} from 'lucide-react';
import { Modal, Button } from '@/components/common';
import {
  getServiceDetailsModalInfoAction,
  resolveExternalServiceNavigationAction,
} from '@/app/[locale]/service/dashboard/actions';
import {
  getInternalRtsServiceHref,
  isExternalServiceUrl,
  isLoginRequiredForService,
  isServiceUrlStruck,
  openExternalServiceTab,
  navigateExternalServiceTab,
  prepareExternalServiceNavigation,
} from '@/lib/utils/rts/service-navigation';
import type { DepartmentDTO } from '@/types/rts-citizen.types';
import { CitizenJourneyHero } from './CitizenJourneyHero';
import ApplicationAndTrackingDrawer from './ApplicationAndTrackingDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CitizenLandingPageProps {
  isLoggedIn: boolean;
  ulbData?: unknown;
  /** Departments with services — fetched from DB by page.tsx */
  departments?: DepartmentDTO[];
}

type I18nLabel = { en?: string; hi?: string; mr?: string } & Record<string, string | undefined>;

// ─── Palette — colors cycle by department index (no DB column needed) ─────────

const DEPT_PALETTE = [
  { bannerBg: 'bg-[#4B0082]', btnColor: 'bg-indigo-600 hover:bg-indigo-700' },
  { bannerBg: 'bg-[#3F7C9E]', btnColor: 'bg-sky-600 hover:bg-sky-700' },
  { bannerBg: 'bg-[#C66922]', btnColor: 'bg-amber-600 hover:bg-amber-700' },
  { bannerBg: 'bg-[#0B3C5D]', btnColor: 'bg-blue-600 hover:bg-blue-700' },
  { bannerBg: 'bg-[#2D8C4E]', btnColor: 'bg-emerald-600 hover:bg-emerald-700' },
  { bannerBg: 'bg-[#8A2BE2]', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  { bannerBg: 'bg-[#551A8B]', btnColor: 'bg-violet-600 hover:bg-violet-700' },
  { bannerBg: 'bg-[#008B8B]', btnColor: 'bg-cyan-600 hover:bg-cyan-700' },
  { bannerBg: 'bg-[#B22222]', btnColor: 'bg-rose-600 hover:bg-rose-700' },
  { bannerBg: 'bg-[#008080]', btnColor: 'bg-teal-600 hover:bg-teal-700' },
  { bannerBg: 'bg-[#228B22]', btnColor: 'bg-green-600 hover:bg-green-700' },
  { bannerBg: 'bg-[#FF8C00]', btnColor: 'bg-orange-600 hover:bg-orange-700' },
] as const;

const FIRE_DEPARTMENT_PALETTE = {
  bannerBg: 'bg-[#C2410C]',
  btnColor: 'bg-orange-700 hover:bg-orange-800',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ICONS = Icons as unknown as Record<string, LucideIcon>;

function resolveIcon(iconName: string | undefined): LucideIcon {
  if (iconName && ICONS[iconName]) return ICONS[iconName];
  return ICONS.LayoutGrid;
}

function pickLang(v: I18nLabel | string | undefined, lang: string): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v[lang] || v.en || v.hi || v.mr || '';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CitizenLandingPage({ isLoggedIn, departments = [] }: CitizenLandingPageProps) {
  const locale = useLocale();
  const t = useTranslations('rts.landing');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isCreatingExternalApplication, startExternalTransition] = useTransition();
  const departmentScrollRef = useRef<HTMLElement | null>(null);
  const departmentScrollFrameRef = useRef<number | null>(null);

  const [modalDetails, setModalDetails] = useState<{
    loading: boolean;
    documents: { en: string; mr?: string; hi?: string }[];
    receivingOfficer: string;
    receivingOfficerDetails: {
      fullName: string | null;
      userName: string | null;
      designation: string | null;
    };
    receivingOfficers: Array<{
      stageOrder: number;
      fullName: string | null;
      userName: string | null;
      designation: string | null;
    }>;
  }>({
    loading: false,
    documents: [],
    receivingOfficer: '-',
    receivingOfficerDetails: { fullName: null, userName: null, designation: null },
    receivingOfficers: [],
  });

  useEffect(() => {
    if (!isDetailsOpen || !selectedServiceId) {
      setModalDetails({
        loading: false,
        documents: [],
        receivingOfficer: '-',
        receivingOfficerDetails: { fullName: null, userName: null, designation: null },
        receivingOfficers: [],
      });
      return;
    }

    let active = true;
    setModalDetails((prev) => ({ ...prev, loading: true }));

    void (async () => {
      try {
        const info = await getServiceDetailsModalInfoAction(Number(selectedServiceId));
        if (!active) return;
        setModalDetails({
          loading: false,
          documents: info.documents,
          receivingOfficer: info.receivingOfficer,
          receivingOfficerDetails: info.receivingOfficerDetails,
          receivingOfficers: info.receivingOfficers,
        });
      } catch {
        if (!active) return;
        setModalDetails({
          loading: false,
          documents: [],
          receivingOfficer: '-',
          receivingOfficerDetails: { fullName: null, userName: null, designation: null },
          receivingOfficers: [],
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [isDetailsOpen, selectedServiceId]);

  const stopDepartmentAutoScroll = () => {
    if (departmentScrollFrameRef.current !== null) {
      cancelAnimationFrame(departmentScrollFrameRef.current);
      departmentScrollFrameRef.current = null;
    }
  };

  const startDepartmentAutoScroll = (direction: -1 | 1) => {
    stopDepartmentAutoScroll();

    const scroll = () => {
      const container = departmentScrollRef.current;
      if (!container) return;

      container.scrollLeft += direction * 6;
      departmentScrollFrameRef.current = requestAnimationFrame(scroll);
    };

    departmentScrollFrameRef.current = requestAnimationFrame(scroll);
  };

  useEffect(() => () => {
    if (departmentScrollFrameRef.current !== null) {
      cancelAnimationFrame(departmentScrollFrameRef.current);
    }
  }, []);

  const totalServiceCount = useMemo(
    () => departments.reduce((acc, d) => acc + d.services.length, 0),
    [departments]
  );

  // ── Build deptCards dynamically from API data ──────────────────────────────
  const deptCards = useMemo(() => {
    return departments.map((dept, idx) => {
      const departmentName = pickLang(dept.name, 'en').trim().toLowerCase();
      const palette = departmentName === 'fire'
        ? FIRE_DEPARTMENT_PALETTE
        : DEPT_PALETTE[idx % DEPT_PALETTE.length];
      const IconComp = resolveIcon(dept.icon);
      return {
        id: dept.id,
        title: pickLang(dept.name, locale),
        bannerBg: palette.bannerBg,
        btnColor: palette.btnColor,
        icon: <IconComp className="w-4 h-4" />,
        iconName: dept.icon,
        services: (dept.services || []).map((svc) => ({
          id: svc.id,
          name: pickLang(svc.name, locale),
          serviceUrl: svc.serviceUrl ?? null,
          sla: svc.sla,
          fees: svc.fees,
          feesRequired: svc.feesRequired,
        })),
        stats: t('serviceBrowser.serviceCount', { count: dept.services.length }),
      };
    });
  }, [departments, locale, t]);

  const requestedDepartment = deptCards.find(
    (department) => String(department.id) === String(searchParams.get('deptId') ?? '')
  );
  const resolvedActiveTab = activeTab || requestedDepartment?.id || (deptCards[0]?.id ?? '');
  const trackParam = searchParams.get('track') || '';
  const receiptParam = searchParams.get('receipt') || '';
  const isTrackingOpen = searchParams.get('applicaAndtracking') === 'true' || Boolean(trackParam) || Boolean(receiptParam);

  const updateTrackingDrawerRoute = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (open) {
      params.set('applicaAndtracking', 'true');
    } else {
      params.delete('applicaAndtracking');
      params.delete('track');
      params.delete('receipt');
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleActionClick = () => {
    const section = document.getElementById('citizen-service-browser');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}/service/login`);
    }
  };

  const saveDeptServiceContext = (
    department: (typeof deptCards)[number],
    service: (typeof deptCards)[number]['services'][number]
  ) => {
    localStorage.setItem('selectedDeptId', String(department.id));
    localStorage.setItem('selectedDeptName', JSON.stringify(department.title));
    localStorage.setItem('selectedServiceName', JSON.stringify(service.name));
    localStorage.setItem('selectedDeptServicesCount', String(department.services.length));
  };

  const handleServiceClick = async (
    department: (typeof deptCards)[number],
    service: (typeof deptCards)[number]['services'][number]
  ) => {
    const serviceId = service.id;
    const rawUrl = service.serviceUrl?.trim() ?? '';

    // 1. '#' or placeholder -> Struck / stop: Do NOT redirect and do NOT show form
    if (isServiceUrlStruck(rawUrl)) {
      setApplyError(
        locale === 'mr'
          ? 'ही सेवा सध्या प्रगतीपथावर आहे / उपलब्ध नाही.'
          : locale === 'hi'
            ? 'यह सेवा वर्तमान में उपलब्ध नहीं है।'
            : 'This service is currently under development / not available.'
      );
      return;
    }

    // Check if service requires login (Property Tax, Water Bill, Trade License)
    const needsLogin = isLoginRequiredForService(service, department);
    if (needsLogin && !isLoggedIn) {
      router.push(`/${locale}/service/login?externalServiceId=${encodeURIComponent(serviceId)}`);
      return;
    }

    // 2. Valid URL -> External Redirect Logic (Passes UPIC if citizen is logged in)
    if (isExternalServiceUrl(rawUrl)) {
      if (isLoggedIn) {
        const externalTab = openExternalServiceTab();
        if (!externalTab) {
          setApplyError(
            locale === 'mr'
              ? 'तुमच्या ब्राउझरने नवीन टॅब ब्लॉक केला आहे. कृपया पॉप-अपला परवानगी द्या.'
              : locale === 'hi'
                ? 'आपके ब्राउज़र ने नया टैब ब्लॉक कर दिया है। कृपया पॉप-अप की अनुमति दें।'
                : 'Your browser blocked the external service tab. Please allow pop-ups and try again.'
          );
          return;
        }

        startExternalTransition(async () => {
          const result = await resolveExternalServiceNavigationAction(Number(serviceId));

          if (!result.success) {
            externalTab.close();
            if (result.errorCode === 'login-required') {
              router.push(`/${locale}/service/login?externalServiceId=${encodeURIComponent(serviceId)}`);
              return;
            }

            setApplyError(result.error);
            return;
          }

          saveDeptServiceContext(department, service);
          setIsDetailsOpen(false);
          setSelectedServiceId(null);
          navigateExternalServiceTab(externalTab, result.destination);
        });
        return;
      }

      const initialNavigation = prepareExternalServiceNavigation(rawUrl);
      if (!initialNavigation.ok && initialNavigation.reason === 'invalid-url') {
        setApplyError('This service has an invalid external URL. Please contact the administrator.');
        return;
      }

      saveDeptServiceContext(department, service);
      setIsDetailsOpen(false);
      setSelectedServiceId(null);
      window.open(initialNavigation.ok ? initialNavigation.destination : rawUrl, '_blank');
      return;
    }

    // 3. null / empty -> Show dynamic fields form
    const internalHref = getInternalRtsServiceHref(locale, serviceId, String(department.id));

    saveDeptServiceContext(department, service);
    setIsDetailsOpen(false);
    setSelectedServiceId(null);
    router.push(internalHref);
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return deptCards.flatMap((dept) =>
      dept.services
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => ({ service: s.name, id: s.id, dept }))
    );
  }, [searchQuery, deptCards]);

  // ── Quick Actions ──────────────────────────────────────────────────────────
  const quickActions = [
    {
      id: 'apply',
      label: t('quickAccess.actions.apply.label'),
      description: t('quickAccess.actions.apply.description'),
      icon: <FileEdit className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      accent: 'from-blue-500 to-cyan-500',
      hoverClass: 'hover:border-blue-200 hover:bg-blue-50/50',
    },
    {
      id: 'download',
      label: t('quickAccess.actions.download.label'),
      description: t('quickAccess.actions.download.description'),
      icon: <Download className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      accent: 'from-purple-500 to-fuchsia-500',
      hoverClass: 'hover:border-purple-200 hover:bg-purple-50/50',
    },
    {
      id: 'pay',
      label: t('quickAccess.actions.pay.label'),
      description: t('quickAccess.actions.pay.description'),
      icon: <CreditCard className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-50',
      accent: 'from-orange-500 to-amber-500',
      hoverClass: 'hover:border-orange-200 hover:bg-orange-50/50',
    },
    {
      id: 'appeal',
      label: t('quickAccess.actions.appeal.label'),
      description: t('quickAccess.actions.appeal.description'),
      icon: <Scale className="w-5 h-5 text-red-600" />,
      iconBg: 'bg-red-50',
      accent: 'from-rose-500 to-red-500',
      hoverClass: 'hover:border-rose-200 hover:bg-rose-50/50',
    },
    {
      id: 'grievance',
      label: t('quickAccess.actions.grievance.label'),
      description: t('quickAccess.actions.grievance.description'),
      icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
      iconBg: 'bg-teal-50',
      accent: 'from-teal-500 to-emerald-500',
      hoverClass: 'hover:border-teal-200 hover:bg-teal-50/50',
    },
    {
      id: 'track',
      label: t('quickAccess.actions.track.label'),
      description: t('quickAccess.actions.track.description'),
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      accent: 'from-indigo-500 to-blue-500',
      hoverClass: 'hover:border-indigo-200 hover:bg-indigo-50/50',
    },
  ];

  // ── Active dept ────────────────────────────────────────────────────────────
  const activeDept = deptCards.find((d) => d.id === resolvedActiveTab) ?? deptCards[0];

  const totalLabel = t('serviceBrowser.totalServices', { count: totalServiceCount });
  const sectionTitle = t('serviceBrowser.title');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.65),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] pb-2 font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <div className="w-full space-y-5">
        <CitizenJourneyHero
          serviceCount={totalServiceCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onApply={handleActionClick}
        />

        <main id="citizen-service-browser" className="scroll-mt-24 space-y-5">
          <section
            aria-labelledby="quick-actions-title"
            className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.5)] sm:rounded-[1.75rem]"
          >
            <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 sm:px-5 sm:pt-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-900/20">
                  <Icons.Zap className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-600 sm:text-[10px]">
                    {t('quickAccess.eyebrow')}
                  </p>
                  <h2
                    id="quick-actions-title"
                    className="truncate text-base font-black text-slate-900 sm:text-lg"
                  >
                    {t('quickAccess.title')}
                  </h2>
                </div>
              </div>
              <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-800 sm:inline-flex">
                {t('quickAccess.badge')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-3 sm:px-4 lg:grid-cols-6">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if (action.id === 'track' || action.id === 'pay' || action.id === 'download') {
                      updateTrackingDrawerRoute(true);
                      return;
                    }
                    handleActionClick();
                  }}
                  className={`group relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-h-[78px] sm:items-start sm:text-left ${action.hoverClass}`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${action.accent}`}
                  />
                  <div className="flex w-full items-center justify-center gap-2 sm:justify-between">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${action.iconBg}`}
                    >
                      {action.icon}
                    </span>
                    <Icons.ArrowUpRight className="hidden h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600 sm:block" />
                  </div>
                  <h3 className="mt-2 text-[10px] font-black leading-tight text-slate-800 sm:text-[11px]">
                    {action.label}
                  </h3>
                  <p className="mt-1 hidden text-[9px] font-semibold leading-3 text-slate-400 2xl:line-clamp-1">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="department-services-title"
            className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] sm:rounded-[1.75rem]"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icons.LayoutGrid className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 sm:text-[10px]">
                    {t('serviceBrowser.eyebrow')}
                  </p>
                  <h2
                    id="department-services-title"
                    className="text-base font-black leading-tight text-slate-900 sm:text-lg"
                  >
                    {sectionTitle}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500 sm:text-xs">
                    {t('serviceBrowser.subtitle')}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-900 px-3 py-1.5 text-[10px] font-black text-white sm:text-xs">
                <Icons.CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {totalLabel}
              </span>
            </div>

            {searchQuery.trim() !== '' ? (
              <div className="p-3 sm:p-4">
                <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-cyan-300" />
                    <h3 className="text-sm font-black">{t('serviceBrowser.searchResults')}</h3>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black">
                      {t('serviceBrowser.resultsFound', { count: filteredServices.length })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black transition hover:bg-white/20"
                  >
                    <Icons.ArrowLeft className="h-3.5 w-3.5" />
                    {t('serviceBrowser.viewAllDepartments')}
                  </button>
                </div>

                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredServices.map((item) => (
                      <button
                        key={`${item.dept.id}-${item.id}`}
                        type="button"
                        onClick={() => {
                          setApplyError(null);
                          setSelectedServiceId(item.id);
                          setIsDetailsOpen(true);
                        }}
                        className="group flex min-h-[64px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100">
                          {item.dept.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-[11px] font-black leading-4 text-slate-800 sm:text-xs">
                            {item.service}
                          </span>
                          <span className="mt-0.5 block truncate text-[9px] font-bold text-slate-400">
                            {item.dept.title}
                          </span>
                        </span>
                        <Icons.ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                      <Search className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-black text-slate-700">
                      {t('serviceBrowser.noServices')}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {t('serviceBrowser.tryDifferentKeyword')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="relative border-b border-slate-100 bg-slate-50/70">
                  <nav
                    ref={departmentScrollRef}
                    aria-label={t('serviceBrowser.departmentsAriaLabel')}
                    className="no-scrollbar flex w-full gap-2 overflow-x-auto px-3 py-3 sm:px-4"
                  >
                    {deptCards.map((dept) => {
                      const isActive = dept.id === resolvedActiveTab;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setActiveTab(dept.id)}
                          className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black shadow-sm transition-all duration-200 sm:px-4 sm:text-xs ${isActive
                              ? `${dept.bannerBg} scale-[1.02] border-transparent text-white shadow-md`
                              : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-800'
                            }`}
                        >
                          <span className={isActive ? 'text-white' : 'shrink-0 text-slate-400'}>
                            {dept.icon}
                          </span>
                          <span className="whitespace-nowrap">{dept.title}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[8px] ${isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-400'}`}
                          >
                            {dept.services.length}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  <div
                    aria-hidden="true"
                    onMouseEnter={() => startDepartmentAutoScroll(-1)}
                    onMouseLeave={stopDepartmentAutoScroll}
                    className="absolute inset-y-0 left-0 z-10 hidden w-10 cursor-w-resize items-center justify-start bg-gradient-to-r from-slate-100 via-slate-100/85 to-transparent pl-1.5 md:flex"
                  >
                    <Icons.ChevronLeft className="h-4 w-4 text-blue-700 drop-shadow-sm" />
                  </div>
                  <div
                    aria-hidden="true"
                    onMouseEnter={() => startDepartmentAutoScroll(1)}
                    onMouseLeave={stopDepartmentAutoScroll}
                    className="absolute inset-y-0 right-0 z-10 hidden w-10 cursor-e-resize items-center justify-end bg-gradient-to-l from-slate-100 via-slate-100/85 to-transparent pr-1.5 md:flex"
                  >
                    <Icons.ChevronRight className="h-4 w-4 text-blue-700 drop-shadow-sm" />
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  {activeDept ? (
                    <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
                      <aside
                        className={`relative overflow-hidden rounded-2xl p-5 text-white ${activeDept.bannerBg}`}
                      >
                        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                        <span className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-black/10" />
                        <div className="relative flex h-full min-h-[190px] flex-col">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">
                            {activeDept.icon}
                          </span>
                          <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-white/70">
                            {t('serviceBrowser.selectedDepartment')}
                          </p>
                          <h3 className="mt-1 text-lg font-black leading-tight">
                            {activeDept.title}
                          </h3>
                          <p className="mt-1 text-[11px] font-bold text-white/75">
                            {activeDept.stats}
                          </p>
                          <button
                            type="button"
                            onClick={handleActionClick}
                            className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-[11px] font-black text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
                          >
                            {t('serviceBrowser.startApplication')}
                            <Icons.ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </aside>

                      <div className="grid content-start grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {activeDept.services.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setApplyError(null);
                              setSelectedServiceId(item.id);
                              setIsDetailsOpen(true);
                            }}
                            className="group flex min-h-[58px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/65 p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                              <FileEdit className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 text-[10px] font-black leading-4 text-slate-700 group-hover:text-blue-900 sm:text-[11px]">
                                {item.name}
                              </span>
                              {item.sla !== undefined && item.sla !== null && (
                                <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wide text-slate-400">
                                  {t('serviceBrowser.slaLabel')} {String(item.sla)}
                                </span>
                              )}
                            </span>
                            <Icons.ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-14 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                        <Search className="h-6 w-6" />
                      </span>
                      <p className="mt-3 text-sm font-black text-slate-700">
                        {t('serviceBrowser.noDepartments')}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {t('serviceBrowser.tryAgainLater')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Service Details Modal */}
      {isDetailsOpen &&
        selectedServiceId &&
        (() => {
          let serviceName = '';
          let deptName = '';
          let serviceItem: (typeof deptCards)[number]['services'][number] | null = null;
          let departmentItem: (typeof deptCards)[number] | null = null;
          for (const dept of deptCards) {
            const svc = dept.services.find((s) => String(s.id) === String(selectedServiceId));
            if (svc) {
              serviceName = svc.name;
              deptName = dept.title;
              serviceItem = svc;
              departmentItem = dept;
              break;
            }
          }

          let transSla = t('serviceDetails.days', { count: 7 });
          if (serviceItem?.sla !== undefined && serviceItem?.sla !== null) {
            transSla =
              typeof serviceItem.sla === 'number'
                ? t('serviceDetails.days', { count: serviceItem.sla })
                : String(serviceItem.sla);
          }

          let transFees = t('serviceDetails.free');
          if (serviceItem?.feesRequired === false) {
            transFees = t('serviceDetails.free');
          } else if (serviceItem?.fees !== undefined && serviceItem?.fees !== null) {
            transFees = Number(serviceItem.fees) > 0 ? `₹${serviceItem.fees}` : t('serviceDetails.free');
          }

          const officerDetails = modalDetails.receivingOfficerDetails;
          const fullName = officerDetails.fullName || t('serviceDetails.notAssigned');
          const officerDisplay = officerDetails.userName
            ? `${fullName} (${officerDetails.userName})`
            : fullName;
          const receivingOfficers = modalDetails.receivingOfficers;

          const transDocs: string[] = modalDetails.documents.map((doc) => {
            if (locale === 'mr') return doc.mr || doc.en;
            if (locale === 'hi') return doc.hi || doc.en;
            return doc.en;
          });

          return (
            <Modal
              open={isDetailsOpen}
              onClose={() => {
                setIsDetailsOpen(false);
                setSelectedServiceId(null);
                setApplyError(null);
              }}
              title={serviceName || t('serviceDetails.title')}
              subtitle={deptName}
              maxWidth="md"
            >
              <div className="space-y-5">
                {applyError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    {applyError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                        {t('serviceDetails.timeLimit')}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transSla}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                        {t('serviceDetails.fees')}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transFees}</p>
                    </div>
                  </div>
                </div>

                <section className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4">
                  <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                      {t('serviceDetails.receivingOfficer')}
                    </p>
                  </div>
                  {receivingOfficers.length > 0 ? (
                    <div className="pt-3">
                      {receivingOfficers.map((officer, index) => {
                        const name = officer.fullName || t('serviceDetails.notAssigned');
                        const display = officer.userName ? `${name} (${officer.userName})` : name;

                        return (
                          <div key={`${officer.stageOrder}-${officer.userName ?? officer.designation ?? 'officer'}`} className="flex gap-3 pb-3 last:pb-0">
                            <div className="flex w-6 shrink-0 flex-col items-center">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white">
                                {officer.stageOrder}
                              </span>
                              {index < receivingOfficers.length - 1 && <span className="mt-1 w-px flex-1 bg-emerald-200" />}
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className="min-w-0 break-words text-sm font-extrabold leading-snug text-slate-800">{display}</p>
                                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  {officer.designation || `Stage ${officer.stageOrder}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="pt-3 break-words text-base font-extrabold leading-snug text-slate-800">
                      {officerDisplay}
                    </p>
                  )}
                </section>

                <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3">
                  <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>{t('serviceDetails.mandatoryDocuments')}</span>
                  </h5>
                  {modalDetails.loading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold py-2">
                      <LoaderCircle className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading required documents...</span>
                    </div>
                  ) : transDocs.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-semibold list-disc pl-5">
                      {transDocs.map((doc, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold italic">
                      {t('serviceDetails.noDocuments')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedServiceId(null);
                      setApplyError(null);
                    }}
                    className="font-bold"
                  >
                    {t('serviceDetails.close')}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isCreatingExternalApplication}
                    onClick={() => {
                      if (serviceItem && departmentItem) {
                        void handleServiceClick(departmentItem, serviceItem);
                      }
                    }}
                    className="font-extrabold"
                  >
                    <>{t('serviceDetails.apply')} &rarr;</>
                  </Button>
                </div>
              </div>
            </Modal>
          );
        })()}

      <ApplicationAndTrackingDrawer
        open={isTrackingOpen}
        initialSearchValue={trackParam}
        initialReceiptValue={receiptParam}
        onClose={() => updateTrackingDrawerRoute(false)}
      />
    </div>
  );
}
