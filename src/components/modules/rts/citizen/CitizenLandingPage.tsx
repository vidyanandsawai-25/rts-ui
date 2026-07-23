'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Modal, Button } from '@/components/common';
import type { DepartmentDTO } from '@/types/rts-citizen.types';

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);



  const t = (mr: string, hi: string, en: string) =>
    locale === 'mr' ? mr : locale === 'hi' ? hi : en;

  const totalServiceCount = useMemo(
    () => departments.reduce((acc, d) => acc + d.services.length, 0),
    [departments]
  );
  const countDisplay = totalServiceCount > 0 ? `${totalServiceCount}+` : '65+';

  // ── Auto-rotating portfolio stats inside the hero promo blue card ───────────
  const heroStats = useMemo(() => [
    {
      value: countDisplay,
      title: t('ऑनलाईन नागरीक सेवा', 'ऑनलाइन सेवाएं', 'Online Services'),
      subtitle: t('तुमची सेवा, आमचे कर्तव्य', 'आपकी सेवा, हमारा कर्तव्य', 'Your service, our duty'),
      badge: t('२४x७ डिजिटल', '24x7 डिजिटल', '24x7 Digital'),
    },
    {
      value: '52,480+',
      title: t('प्राप्त नागरीक अर्ज', 'प्राप्त नागरिक आवेदन', 'Received Applications'),
      subtitle: t('पोर्टलवरील एकूण नोंदणीकृत अर्ज', 'पोर्टल पर कुल प्राप्त आवेदन', 'Total registered applications'),
      badge: t('एकूण अर्ज', 'कुल आवेदन', 'Total Received'),
    },
    {
      value: '51,120+',
      title: t('निकाली काढलेले अर्ज', 'निवारित आवेदन', 'Disposed Applications'),
      subtitle: t('वेळेत मंजूर व सेवा वितरित', 'समयबद्ध स्वीकृत एवं वितरित', 'Approved & delivered'),
      badge: t('निकाली अर्ज', 'निवारित', 'SLA Disposed'),
    },
    {
      value: '98.4%',
      title: t('SLA पूर्तता यश दर', 'SLA सफलता दर', 'SLA Success Rate'),
      subtitle: t('लोकसेवा हक्क कायदा उद्दिष्ट', 'लोक सेवा अधिकार कानून लक्ष्य', 'Statutory SLA resolution'),
      badge: t('SLA यश दर', 'SLA सफलता', 'SLA Target'),
    },
  ], [countDisplay, locale]);

  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % heroStats.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroStats.length]);

  const currentStat = heroStats[currentStatIndex];

  // ── Build deptCards dynamically from API data ──────────────────────────────
  const deptCards = useMemo(() => {
    return departments.map((dept, idx) => {
      const palette = DEPT_PALETTE[idx % DEPT_PALETTE.length];
      const IconComp = resolveIcon(dept.icon);
      return {
        id: dept.id,
        title: pickLang(dept.name, locale),
        bannerBg: palette.bannerBg,
        btnColor: palette.btnColor,
        icon: <IconComp className="w-4 h-4" />,
        iconName: dept.icon,
        services: ((dept.services || []) as any[]).map((svc) => ({
          id: svc.id,
          name: pickLang(svc.name, locale),
          sla: svc.sla,
          fees: svc.fees,
          feesRequired: svc.feesRequired,
        })),
        stats:
          locale === 'mr'
            ? `${dept.services.length} सेवा`
            : locale === 'hi'
            ? `${dept.services.length} सेवाएं`
            : `${dept.services.length} Service${dept.services.length !== 1 ? 's' : ''}`,
      };
    });
  }, [departments, locale]);

  // Synchronize department tab from URL search parameters on mount/change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const deptId = params.get('deptId');
      if (deptId && deptCards.length > 0) {
        const match = deptCards.find((d) => String(d.id) === String(deptId));
        if (match) {
          setActiveTab(match.id);
        }
      }
    }
  }, [deptCards]);

  // Set initial active tab once deptCards are available
  const resolvedActiveTab = activeTab || (deptCards[0]?.id ?? '');

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleActionClick = () => {
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}/service/login`);
    }
  };

  const handleServiceClick = (serviceName: string, serviceId?: string) => {
    if (!serviceId) return;

    // Check if service requires login (PropertyTax, Trade License, Water Supply)
    const deptOfService = deptCards.find((d) => d.services.some((s) => String(s.id) === String(serviceId)));
    const deptName = deptOfService ? deptOfService.title : '';

    const s = serviceName.toLowerCase();
    const d = deptName.toLowerCase();

    const isPropertyTax = s.includes('property') || s.includes('tax') || d.includes('property') || d.includes('tax') ||
                          s.includes('मालमत्ता') || s.includes('कर') || d.includes('मालमत्ता') || d.includes('कर');
                          
    const isTrade = s.includes('trade') || s.includes('license') || d.includes('trade') || d.includes('license') ||
                    s.includes('व्यवसाय') || s.includes('व्यापार') || d.includes('व्यवसाय') || d.includes('व्यापार');
                    
    const isWater = s.includes('water') || d.includes('water') ||
                    s.includes('पाणी') || s.includes('जल') || d.includes('पाणी') || d.includes('जल');

    const requiresLogin = isPropertyTax || isTrade || isWater;

    if (requiresLogin && !isLoggedIn) {
      router.push(`/${locale}/service/login?redirect=/${locale}/service/${serviceId}`);
    } else {
      router.push(`/${locale}/service/${serviceId}`);
    }
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
      label: t('सेवा अर्ज करा', 'सेवा के लिए आवेदन करें', 'Apply for Service'),
      icon: <FileEdit className="w-5 h-5 text-blue-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-blue-50',
    },
    {
      label: t('प्रमाणपत्र डाउनलोड', 'प्रमाणपत्र डाउनलोड करें', 'Download Certificate'),
      icon: <Download className="w-5 h-5 text-purple-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-purple-50',
    },
    {
      label: t('शुल्क भरा', 'शुल्क भुगतान करें', 'Pay Fees'),
      icon: <CreditCard className="w-5 h-5 text-orange-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-orange-50',
    },
    {
      label: t('अपील दाखल करा', 'अपील दर्ज करें', 'File Appeal'),
      icon: <Scale className="w-5 h-5 text-red-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-red-50',
    },
    {
      label: t('तक्रार नोंदवा', 'शिकायत दर्ज करें', 'Register Grievance'),
      icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-teal-50',
    },
    {
      label: t('अर्ज ट्रॅक करा', 'आवेदन ट्रैक करें', 'Track Application'),
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      colorClass: 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50',
      iconBg: 'bg-indigo-50',
    },
  ];

  // ── Active dept ────────────────────────────────────────────────────────────
  const activeDept = deptCards.find((d) => d.id === resolvedActiveTab) ?? deptCards[0];

  const totalLabel =
    locale === 'mr'
      ? `${totalServiceCount} एकूण सेवा`
      : locale === 'hi'
      ? `${totalServiceCount} कुल सेवाएं`
      : `${totalServiceCount} Total Services`;

  const sectionTitle =
    locale === 'mr'
      ? `विभागनिहाय सेवा (१ ते ${totalServiceCount} सेवा)`
      : locale === 'hi'
      ? `विभागवार सेवाएं (1 से ${totalServiceCount} सेवाएं)`
      : `Department-wise Services (1 to ${totalServiceCount} Services)`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-slate-50 font-sans pb-4">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-50 text-slate-900 shadow-md min-h-[160px] sm:min-h-[200px] md:min-h-[240px] flex items-center border-b border-slate-200 w-full rounded-none">
        <div className="absolute inset-0 opacity-100 pointer-events-none z-0">
          <Image
            src="/images/corporation-building.png"
            alt="Municipal Corporation Building"
            fill
            className="object-cover object-[center_20%]"
            priority
            unoptimized
          />
        </div>

        <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 p-3 sm:p-4 md:p-6 items-center overflow-hidden">
          {/* Left: slogan + search */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 bg-white/95 backdrop-blur-md p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/60 shadow-lg max-w-2xl space-y-2.5 sm:space-y-3.5"
          >
            <span className="inline-block px-2.5 py-1 rounded bg-[#f39c12] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-sm">
              {t('महाराष्ट्र लोकसेवा हक्क अधिनियम 2015 अंतर्गत', 'महाराष्ट्र लोकसेवा हक्क अधिनियम 2015 के अंतर्गत', 'Under Right to Public Services Act 2015')}
            </span>

            <h2 className="text-base sm:text-xl md:text-2xl lg:text-[28px] font-black tracking-tight leading-tight text-[#0a3275]">
              {locale === 'mr' ? (
                <>वेळबद्ध, पारदर्शक आणि <span className="text-[#0f7a3f]">नागरीक केंद्रित सेवा</span></>
              ) : locale === 'hi' ? (
                <>समयबद्ध, पारदर्शी और <span className="text-[#0f7a3f]">नागरिक केंद्रित सेवा</span></>
              ) : (
                <>Time-bound, Transparent and <span className="text-[#0f7a3f]">Citizen Centric Services</span></>
              )}
            </h2>

            <div className="relative w-full max-w-xl bg-white p-1.5 rounded-xl border border-slate-250 shadow-md flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder={t('सेवा शोधा... (उदा. जन्म प्रमाणपत्र, पाणी जोडणी)', 'सेवा खोजें... (उदा. जन्म प्रमाण पत्र, जल कनेक्शन)', 'Search services... (e.g. Birth Certificate, Water connection)')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none border-none font-bold"
              />
              <button
                type="button"
                onClick={() => handleServiceClick(searchQuery)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm font-black rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('शोधा', 'खोजें', 'Search')}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-650 bg-white/50 backdrop-blur-sm rounded-lg py-1 px-2.5 border border-slate-200/40 w-fit">
              {[
                [t('वेळबद्ध सेवा', 'समयबद्ध सेवा', 'Time-bound Service')],
                [t('पारदर्शक प्रक्रिया', 'पारदर्शी प्रक्रिया', 'Transparent Process')],
                [t('नागरिक प्रथम', 'नागरिक प्रथम', 'Citizen First')],
                [t('अपिलाचा अधिकार', 'अपील का अधिकार', 'Right to Appeal')],
              ].map(([label], i, arr) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {label}
                  {i < arr.length - 1 && <span className="text-slate-300 ml-3">•</span>}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: animated promo card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="bg-gradient-to-br from-[#0b5cd5] via-[#094ebb] to-[#063996] text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-blue-400/30 relative overflow-hidden flex flex-row items-center justify-between min-h-[145px]">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-24 h-24 bg-blue-300/15 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-20 flex-1 flex flex-col justify-between h-full pr-3 min-h-0">
                <div className="min-h-[72px] overflow-hidden flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStatIndex}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="space-y-1"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black text-white uppercase tracking-wider shadow-sm border border-white/20">
                          {currentStat.badge}
                        </span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none block drop-shadow-lg">
                        {currentStat.value}
                      </h3>
                      <span className="text-xs sm:text-sm font-black text-white block leading-tight truncate">
                        {currentStat.title}
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-100 font-semibold block leading-tight truncate">
                        {currentStat.subtitle}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 mt-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className="px-3.5 py-1.5 bg-white text-[#0a4ebb] hover:bg-slate-50 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer shrink-0"
                  >
                    <span>{t('सेवा अर्ज करा', 'सेवा आवेदन करें', 'Apply')}</span>
                    <span className="text-xs font-black">&rarr;</span>
                  </button>

                  {/* Carousel Dots */}
                  <div className="flex items-center gap-1.5 ml-1">
                    {heroStats.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentStatIndex(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentStatIndex ? 'w-5 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Go to stat ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone mockup */}
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className="relative shrink-0 ml-2 z-10 self-center">
                <div className="relative w-[68px] h-[105px] bg-slate-900 rounded-[15px] p-[2px] shadow-2xl border border-slate-800 shrink-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-b-[3px] z-20 flex justify-center items-center gap-0.5">
                    <div className="w-2 h-[0.5px] bg-slate-700 rounded-full" />
                  </div>
                  <div className="w-full h-full bg-white rounded-[13px] pt-2 px-0.5 pb-0.5 flex flex-col gap-1 justify-start relative overflow-hidden shadow-inner">
                    {[...Array(3)].map((_, idx) => (
                      <motion.div key={idx} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + idx * 0.15, type: 'spring', stiffness: 100 }} className="flex items-center gap-0.5 pb-0.5 border-b border-slate-100 last:border-0 leading-none">
                        <div className="w-2 h-2 rounded-full bg-[#27ae60] flex items-center justify-center shrink-0">
                          <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="h-[1.5px] bg-slate-200 rounded w-6" />
                          <div className="h-[1px] bg-slate-150 rounded w-4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring', bounce: 0.6 }} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#27ae60] to-[#219653] border-2 border-[#073fa8] flex items-center justify-center shadow-lg z-30">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full space-y-4 py-3 px-3 md:px-5">

        {/* Quick Access Links */}
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>{t('त्वरित सेवा दुवे', 'त्वरित सेवा लिंक', 'Quick Access Links')}</span>
              <span className="text-slate-400 text-xs font-normal">▼</span>
            </h3>
            <span className="text-xs bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-lg font-black">
              {t('पोर्टल क्रिया', 'पोर्टल क्रियाएं', 'Portal Actions')}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={handleActionClick}
                className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer text-center h-[80px] sm:h-[90px] ${action.colorClass}`}
              >
                <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center shrink-0 mb-1.5`}>
                  {action.icon}
                </div>
                <h4 className="font-extrabold text-slate-800 text-[11px] sm:text-xs leading-tight group-hover:text-blue-900 transition-colors">
                  {action.label}
                </h4>
              </button>
            ))}
          </div>
        </div>

        {/* Department Browser / Search Results */}
        <section className="space-y-3">
          {searchQuery.trim() !== '' ? (
            /* Search Results */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <h4 className="font-extrabold text-sm sm:text-base">{t('शोध परिणाम', 'खोज परिणाम', 'Search Results')}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>&larr;</span>
                    <span>{t('विभाग पहा', 'विभाग देखें', 'View Departments')}</span>
                  </button>
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-lg font-black">
                    {filteredServices.length} {t('आढळले', 'मिले', 'Found')}
                  </span>
                </div>
              </div>
              <div className="p-5 bg-white min-h-[150px]">
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {filteredServices.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setSelectedServiceId(item.id); setIsDetailsOpen(true); }}
                        className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-green-50/20 hover:border-green-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-snug group-hover:text-green-950 transition-colors">{item.service}</span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{item.dept.icon}</span>
                          <span>{item.dept.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-700">{t('कोणत्याही सेवा आढळल्या नाहीत', 'कोई सेवा नहीं मिली', 'No services found')}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('कृपया वेगळे शब्द वापरून पहा.', 'कृपया कोई अन्य शब्द आज़माएं।', 'Please try with different keywords.')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tabbed Department Browser */
            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{sectionTitle}</span>
                  <span className="text-slate-400 text-xs font-normal">▼</span>
                </h3>
                <span className="text-xs bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-lg font-black">
                  {totalLabel}
                </span>
              </div>

              {/* Department Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar w-full">
                {deptCards.map((dept) => {
                  const isActive = dept.id === resolvedActiveTab;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setActiveTab(dept.id)}
                      className={`flex-grow md:flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-[11px] sm:text-xs font-extrabold cursor-pointer transition-all duration-200 shrink-0 shadow-sm ${
                        isActive
                          ? `${dept.bannerBg} text-white border-transparent scale-[1.02] shadow-md`
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-500 shrink-0'}>{dept.icon}</span>
                      <span className="whitespace-nowrap">{dept.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel */}
              {activeDept && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeDept.bannerBg}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                        {activeDept.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base leading-tight">{activeDept.title}</h4>
                        <p className="text-[10px] text-white/80 font-bold mt-0.5">{activeDept.stats}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleActionClick}
                      className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <span>{t('सर्व सेवा अर्ज करा', 'सभी सेवाएं आवेदन करें', 'Apply for Services')}</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {activeDept.services.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setSelectedServiceId(item.id); setIsDetailsOpen(true); }}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-200/50 transition-all cursor-pointer group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-snug group-hover:text-blue-900 transition-colors">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state when no departments from DB */}
              {deptCards.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-700">{t('विभाग लोड होत नाही', 'विभाग लोड नहीं हो रहे', 'Departments not available')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('कृपया नंतर पुन्हा प्रयत्न करा.', 'कृपया बाद में पुनः प्रयास करें।', 'Please try again later.')}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Service Details Modal */}
      {isDetailsOpen && selectedServiceId && (() => {
        let serviceName = '';
        let deptName = '';
        let serviceItem: any = null;
        for (const dept of deptCards) {
          const svc = dept.services.find((s) => s.id === selectedServiceId);
          if (svc) { 
            serviceName = svc.name; 
            deptName = dept.title; 
            serviceItem = svc;
            break; 
          }
        }
        
        let transSla = '7 Days';
        if (serviceItem?.sla !== undefined && serviceItem?.sla !== null) {
          transSla = typeof serviceItem.sla === 'number' ? `${serviceItem.sla} ${t('दिवस', 'दिन', 'Days')}` : String(serviceItem.sla);
        }

        let transFees = 'Free';
        if (serviceItem?.feesRequired === false) {
          transFees = t('मोफत', 'निःशुल्क', 'Free');
        } else if (serviceItem?.fees !== undefined && serviceItem?.fees !== null) {
          transFees = `₹${serviceItem.fees}`;
        }

        const transOfficer = '-';
        const transDocs: string[] = [];

        return (
          <Modal open={isDetailsOpen} onClose={() => { setIsDetailsOpen(false); setSelectedServiceId(null); }} title={serviceName || 'सेवा तपशील'} subtitle={deptName} maxWidth="md">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">{t('कालावधी (SLA)', 'समय सीमा (SLA)', 'Time Limit (SLA)')}</p>
                    <p className="text-sm font-extrabold text-slate-800">{transSla}</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">{t('शुल्क / आकार', 'शुल्क / प्रभार', 'Fees / Charges')}</p>
                    <p className="text-sm font-extrabold text-slate-800">{transFees}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0"><UserCheck className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">{t('स्वीकृती अधिकारी', 'स्वीकृति अधिकारी', 'Receiving Officer')}</p>
                    <p className="text-sm font-extrabold text-slate-800">{transOfficer}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3">
                <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>{t('आवश्यक बंधनकारक कागदपत्रे', 'आवश्यक अनिवार्य दस्तावेज', 'Mandatory Documents Required')}</span>
                </h5>
                {transDocs.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-semibold list-disc pl-5">
                    {transDocs.map((doc, dIdx) => <li key={dIdx} className="leading-relaxed">{doc}</li>)}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">
                    {t('या सेवेसाठी कोणतीही कागदपत्रे नमूद केलेली नाहीत.', 'इस सेवा के लिए कोई दस्तावेज निर्दिष्ट नहीं हैं।', 'No documents specified for this service.')}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="md" onClick={() => { setIsDetailsOpen(false); setSelectedServiceId(null); }} className="font-bold">
                  {t('बंद करा', 'बंद करें', 'Close')}
                </Button>
                <Button variant="primary" size="md" onClick={() => { setIsDetailsOpen(false); setSelectedServiceId(null); handleServiceClick(serviceName, selectedServiceId); }} className="font-extrabold">
                  {t('अर्ज प्रक्रियेला सुरुवात करा', 'आवेदन प्रक्रिया शुरू करें', 'Apply / Process')} &rarr;
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
