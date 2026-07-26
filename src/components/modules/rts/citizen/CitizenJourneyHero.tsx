'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react';

type LocalizedCopy = {
  mr: string;
  hi: string;
  en: string;
};

type JourneyStep = {
  title: LocalizedCopy;
  shortTitle: LocalizedCopy;
  description: LocalizedCopy;
  icon: LucideIcon;
  color: string;
};

interface CitizenJourneyHeroProps {
  locale: string;
  serviceCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onApply: () => void;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    title: {
      mr: 'सेवा निवडा',
      hi: 'सेवा चुनें',
      en: 'Choose a service',
    },
    shortTitle: {
      mr: 'सेवा शोधा',
      hi: 'सेवा खोजें',
      en: 'Choose',
    },
    description: {
      mr: 'विभाग किंवा सेवेच्या नावाने शोधा.',
      hi: 'विभाग या सेवा के नाम से खोजें।',
      en: 'Find the right service and check eligibility.',
    },
    icon: Search,
    color: 'from-sky-400 to-blue-600',
  },
  {
    title: {
      mr: 'ऑनलाइन अर्ज करा',
      hi: 'ऑनलाइन आवेदन करें',
      en: 'Apply online',
    },
    shortTitle: {
      mr: 'ई-अर्ज',
      hi: 'ई-आवेदन',
      en: 'e-File',
    },
    description: {
      mr: 'अर्ज भरा आणि कागदपत्रे अपलोड करा.',
      hi: 'फॉर्म भरें और दस्तावेज अपलोड करें।',
      en: 'Complete the form and upload documents.',
    },
    icon: UploadCloud,
    color: 'from-amber-400 to-orange-600',
  },
  {
    title: {
      mr: 'SLA स्थिती पाहा',
      hi: 'SLA स्थिति देखें',
      en: 'Track the SLA',
    },
    shortTitle: {
      mr: 'ट्रॅक करा',
      hi: 'ट्रैक करें',
      en: 'Track',
    },
    description: {
      mr: 'अर्जाची स्थिती आणि उर्वरित वेळ पाहा.',
      hi: 'आवेदन की स्थिति और शेष समय देखें।',
      en: 'See application status and remaining time.',
    },
    icon: Clock3,
    color: 'from-violet-500 to-indigo-700',
  },
  {
    title: {
      mr: 'डिजिटल दाखला मिळवा',
      hi: 'डिजिटल प्रमाणपत्र पाएं',
      en: 'Get the certificate',
    },
    shortTitle: {
      mr: 'ई-दाखला',
      hi: 'ई-प्रमाण',
      en: 'e-Cert',
    },
    description: {
      mr: 'मंजूर दाखला सुरक्षितपणे डाउनलोड करा.',
      hi: 'स्वीकृत प्रमाणपत्र सुरक्षित रूप से डाउनलोड करें।',
      en: 'Securely download the approved certificate.',
    },
    icon: BadgeCheck,
    color: 'from-emerald-400 to-teal-600',
  },
];

function localized(locale: string, copy: LocalizedCopy): string {
  if (locale === 'mr') return copy.mr;
  if (locale === 'hi') return copy.hi;
  return copy.en;
}

export function CitizenJourneyHero({
  locale,
  serviceCount,
  searchQuery,
  onSearchChange,
  onApply,
}: CitizenJourneyHeroProps) {
  const reduceMotion = useReducedMotion();
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const copy = useMemo(
    () => ({
      actBadge: localized(locale, {
        mr: 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५',
        hi: 'महाराष्ट्र लोक सेवा अधिकार अधिनियम 2015',
        en: 'Maharashtra Right to Public Services Act 2015',
      }),
      eyebrow: localized(locale, {
        mr: 'अकोल्याचे डिजिटल नागरिक प्रवेशद्वार',
        hi: 'अकोला का डिजिटल नागरिक प्रवेशद्वार',
        en: "Akola's digital citizen gateway",
      }),
      titleStart: localized(locale, {
        mr: 'नागरिक सेवा आता',
        hi: 'नागरिक सेवाएं अब',
        en: 'Public services made',
      }),
      titleAccent: localized(locale, {
        mr: 'सोप्या, पारदर्शक आणि वेळेत.',
        hi: 'सरल, पारदर्शी और समयबद्ध।',
        en: 'simple, transparent and time-bound.',
      }),
      subtitle: localized(locale, {
        mr: 'योग्य सेवा शोधा, ऑनलाइन अर्ज करा, वैधानिक SLA ट्रॅक करा आणि मंजूर दाखला तुमच्या मोबाईलवर मिळवा.',
        hi: 'सही सेवा खोजें, ऑनलाइन आवेदन करें, वैधानिक SLA ट्रैक करें और स्वीकृत प्रमाणपत्र अपने मोबाइल पर पाएं।',
        en: 'Find the right service, apply online, track the statutory SLA and receive the approved certificate on your phone.',
      }),
      searchPlaceholder: localized(locale, {
        mr: 'जन्म दाखला, पाणी जोडणी, मालमत्ता कर...',
        hi: 'जन्म प्रमाणपत्र, जल कनेक्शन, संपत्ति कर...',
        en: 'Birth certificate, water connection, property tax...',
      }),
      searchLabel: localized(locale, {
        mr: 'सेवा शोधा',
        hi: 'सेवा खोजें',
        en: 'Find a service',
      }),
      applyLabel: localized(locale, {
        mr: 'ऑनलाइन अर्ज सुरू करा',
        hi: 'ऑनलाइन आवेदन शुरू करें',
        en: 'Start online application',
      }),
      exploreLabel: localized(locale, {
        mr: 'सर्व सेवा पाहा',
        hi: 'सभी सेवाएं देखें',
        en: 'Explore all services',
      }),
      trust: localized(locale, {
        mr: 'सुरक्षित पोर्टल • पारदर्शक प्रक्रिया • २४x७ उपलब्ध',
        hi: 'सुरक्षित पोर्टल • पारदर्शी प्रक्रिया • 24x7 उपलब्ध',
        en: 'Secure portal • Transparent process • Available 24x7',
      }),
      photoLabel: localized(locale, {
        mr: 'अकोला महानगरपालिका',
        hi: 'अकोला नगर निगम',
        en: 'Akola Municipal Corporation',
      }),
      photoCaption: localized(locale, {
        mr: 'तुमच्या नागरी सेवा, आता ऑनलाइन',
        hi: 'आपकी नागरिक सेवाएं, अब ऑनलाइन',
        en: 'Your civic services, now online',
      }),
      servicesLabel: localized(locale, {
        mr: 'ऑनलाइन सेवा',
        hi: 'ऑनलाइन सेवाएं',
        en: 'Online services',
      }),
      digitalLabel: localized(locale, {
        mr: 'डिजिटल उपलब्धता',
        hi: 'डिजिटल उपलब्धता',
        en: 'Digital access',
      }),
      slaLabel: localized(locale, {
        mr: 'SLA पालन',
        hi: 'SLA अनुपालन',
        en: 'SLA delivery',
      }),
      journeyEyebrow: localized(locale, {
        mr: 'चार सोपे टप्पे',
        hi: 'चार आसान चरण',
        en: 'Four simple steps',
      }),
      journeyTitle: localized(locale, {
        mr: 'सेवा शोधण्यापासून डिजिटल दाखल्यापर्यंत',
        hi: 'सेवा खोजने से डिजिटल प्रमाणपत्र तक',
        en: 'From service search to digital certificate',
      }),
      slaProtected: localized(locale, {
        mr: 'SLA संरक्षित',
        hi: 'SLA संरक्षित',
        en: 'SLA protected',
      }),
      startHere: localized(locale, {
        mr: 'तुमचा प्रवास येथे सुरू होतो',
        hi: 'आपकी यात्रा यहां से शुरू होती है',
        en: 'Your journey starts here',
      }),
      applyShort: localized(locale, {
        mr: 'अर्ज करा',
        hi: 'आवेदन करें',
        en: 'Apply',
      }),
      certificateReady: localized(locale, {
        mr: 'दाखला तयार',
        hi: 'प्रमाणपत्र तैयार',
        en: 'Certificate ready',
      }),
      delivered: localized(locale, {
        mr: 'सुरक्षितपणे मिळाले',
        hi: 'सुरक्षित रूप से मिला',
        en: 'Securely delivered',
      }),
      showStat: localized(locale, {
        mr: 'आकडेवारी दाखवा',
        hi: 'आंकड़ा दिखाएं',
        en: 'Show statistic',
      }),
    }),
    [locale]
  );

  const stats = useMemo(
    () => [
      {
        value: `${serviceCount || 65}+`,
        label: localized(locale, {
          mr: 'ऑनलाइन सेवा',
          hi: 'ऑनलाइन सेवाएं',
          en: 'Online services',
        }),
        detail: localized(locale, {
          mr: 'सर्व सेवा एकाच ठिकाणी',
          hi: 'सभी सेवाएं एक ही स्थान पर',
          en: 'Available in one place',
        }),
        badge: localized(locale, {
          mr: '२४×७ डिजिटल',
          hi: '24×7 डिजिटल',
          en: '24×7 digital',
        }),
      },
      {
        value: '52,480+',
        label: localized(locale, {
          mr: 'प्राप्त अर्ज',
          hi: 'प्राप्त आवेदन',
          en: 'Applications received',
        }),
        detail: localized(locale, {
          mr: 'नागरिकांकडून ऑनलाइन सादर',
          hi: 'नागरिकों द्वारा ऑनलाइन जमा',
          en: 'Submitted online by citizens',
        }),
        badge: localized(locale, {
          mr: 'डिजिटल अर्ज',
          hi: 'डिजिटल आवेदन',
          en: 'Digital filing',
        }),
      },
      {
        value: '51,120+',
        label: localized(locale, {
          mr: 'वितरित अर्ज',
          hi: 'वितरित आवेदन',
          en: 'Applications delivered',
        }),
        detail: localized(locale, {
          mr: 'मंजूर आणि नागरिकांना वितरित',
          hi: 'स्वीकृत और नागरिकों को वितरित',
          en: 'Approved and delivered',
        }),
        badge: localized(locale, {
          mr: 'SLA पूर्ण',
          hi: 'SLA पूर्ण',
          en: 'SLA completed',
        }),
      },
      {
        value: '98.4%',
        label: localized(locale, {
          mr: 'SLA यश दर',
          hi: 'SLA सफलता दर',
          en: 'SLA success rate',
        }),
        detail: localized(locale, {
          mr: 'निर्धारित वेळेत सेवा वितरण',
          hi: 'निर्धारित समय में सेवा वितरण',
          en: 'Delivered within the timeline',
        }),
        badge: localized(locale, {
          mr: 'वेळेची हमी',
          hi: 'समय की गारंटी',
          en: 'Time guaranteed',
        }),
      },
    ],
    [locale, serviceCount]
  );

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveStatIndex((current) => (current + 1) % stats.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduceMotion, stats.length]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveJourneyIndex((current) => (current + 1) % JOURNEY_STEPS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const scrollToServices = () => {
    document.getElementById('citizen-service-browser')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    scrollToServices();
  };

  const activeStep = JOURNEY_STEPS[activeJourneyIndex];
  const activeStat = stats[activeStatIndex];

  return (
    <section
      aria-labelledby="citizen-hero-title"
      className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)] sm:rounded-[2rem]"
    >
      <div className="relative lg:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[610px]">
        <div className="relative h-[190px] overflow-hidden bg-sky-100 sm:h-[240px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/images/corporation-building.png"
            alt={copy.photoLabel}
            fill
            priority
            unoptimized
            sizes="(max-width: 1023px) 100vw, 1600px"
            className="object-cover object-center lg:object-[center_48%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-white/5 lg:bg-gradient-to-r lg:from-white/10 lg:via-transparent lg:to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5 lg:hidden">
            <div>
              <p className="text-xs font-black sm:text-sm">{copy.photoLabel}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white/80 sm:text-xs">
                {copy.photoCaption}
              </p>
            </div>
            <span className="rounded-full border border-white/30 bg-slate-950/35 px-3 py-1 text-[10px] font-black backdrop-blur-md">
              {copy.digitalLabel}
            </span>
          </div>
        </div>

        <div className="relative z-10 grid min-w-0 lg:min-h-[500px] lg:grid-cols-[minmax(0,0.88fr)_minmax(540px,1.12fr)] xl:min-h-[550px] 2xl:min-h-[610px] 2xl:grid-cols-[minmax(640px,0.72fr)_minmax(940px,1.28fr)]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-w-0 bg-white p-5 sm:p-7 lg:m-4 lg:mr-0 lg:self-center lg:rounded-[1.75rem] lg:border lg:border-white/80 lg:bg-white/95 lg:p-6 lg:shadow-[0_24px_70px_-34px_rgba(15,23,42,0.55)] lg:backdrop-blur-md xl:m-5 xl:mr-0 xl:p-7 2xl:m-7 2xl:mr-0 2xl:bg-white/92 2xl:p-9"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase leading-4 tracking-[0.09em] text-amber-800 sm:text-[10px]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{copy.actBadge}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-800 lg:hidden 2xl:inline-flex">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                {copy.eyebrow}
              </span>
            </div>

            <h1
              id="citizen-hero-title"
              className="mt-4 max-w-2xl text-[2.15rem] font-black leading-[1.03] tracking-[-0.045em] text-[#082f6a] sm:text-[2.8rem] lg:text-[2.65rem] xl:text-[2.85rem] 2xl:text-[3.2rem]"
            >
              {copy.titleStart}{' '}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                {copy.titleAccent}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
              {copy.subtitle}
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-4 flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.45)] transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100"
            >
              <Search className="ml-2 h-5 w-5 shrink-0 text-blue-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchLabel}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-xs font-black text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:px-5 sm:text-sm"
              >
                <span className="hidden sm:inline">{copy.searchLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onApply}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b4fc1] px-4 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#083f9c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <FileText className="h-4 w-4" />
                {copy.applyLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-blue-900 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <Search className="h-4 w-4 text-emerald-600" />
                {copy.exploreLabel}
              </button>
            </div>

            <p className="mt-3 flex items-start gap-2 text-[10px] font-bold leading-4 text-slate-500 sm:text-[11px]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {copy.trust}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="min-w-0 bg-gradient-to-b from-slate-50 to-white p-3 pb-4 sm:p-5 lg:flex lg:items-end lg:bg-none lg:bg-transparent lg:p-5 lg:pl-4 xl:p-6 xl:pl-5"
          >
            <div
              id="citizen-journey"
              className="relative ml-auto w-full scroll-mt-24 overflow-hidden rounded-[1.6rem] border border-blue-300/25 bg-gradient-to-br from-[#0868de] via-[#0754c5] to-[#063797] p-4 text-white shadow-[0_28px_65px_-28px_rgba(2,28,79,0.9)] sm:p-5 lg:max-w-[1040px]"
            >
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-950/45 blur-3xl" />

              <div className="relative grid grid-cols-[minmax(0,1fr)_72px] gap-3 sm:grid-cols-[minmax(0,1fr)_88px] sm:gap-4 xl:grid-cols-[minmax(145px,0.7fr)_minmax(330px,1.55fr)_88px] xl:items-center">
                <div className="min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStatIndex}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      <span className="inline-flex rounded-md border border-white/20 bg-white/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-blue-50 sm:text-[9px]">
                        {activeStat.badge}
                      </span>
                      <strong className="mt-2 block text-3xl font-black leading-none tracking-tight sm:text-4xl xl:text-3xl 2xl:text-4xl">
                        {activeStat.value}
                      </strong>
                      <span className="mt-1.5 block text-[11px] font-black leading-tight text-white sm:text-xs">
                        {activeStat.label}
                      </span>
                      <span className="mt-1 block text-[9px] font-semibold leading-3 text-blue-100 sm:text-[10px]">
                        {activeStat.detail}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-3 flex items-center gap-1.5">
                    {stats.map((stat, index) => (
                      <button
                        key={stat.label}
                        type="button"
                        onClick={() => setActiveStatIndex(index)}
                        aria-label={`${copy.showStat} ${index + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          index === activeStatIndex
                            ? 'w-6 bg-white'
                            : 'w-2 bg-white/35 hover:bg-white/65'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={onApply}
                    className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[10px] font-black text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 sm:text-xs"
                  >
                    {copy.applyShort}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="relative order-3 col-span-2 mt-1 rounded-2xl border border-white/10 bg-slate-950/15 p-3 backdrop-blur-sm sm:p-4 xl:order-none xl:col-span-1 xl:mt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200 sm:text-[9px]">
                        {copy.journeyEyebrow}
                      </p>
                      <h2 className="mt-1 text-xs font-black leading-tight text-white sm:text-sm">
                        {copy.journeyTitle}
                      </h2>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2 py-1 text-[7px] font-black text-emerald-100 sm:text-[8px]">
                      <ShieldCheck className="h-3 w-3" />
                      {copy.slaProtected}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <div className="absolute left-[8%] right-[8%] top-5 h-0.5 rounded-full bg-white/20" />
                    <motion.div
                      className="absolute left-[8%] top-5 h-0.5 rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-emerald-300"
                      animate={{
                        width: `${(activeJourneyIndex / (JOURNEY_STEPS.length - 1)) * 84}%`,
                      }}
                      transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                    />

                    <div className="relative grid grid-cols-4 gap-1">
                      {JOURNEY_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === activeJourneyIndex;
                        const isComplete = index < activeJourneyIndex;
                        const isReached = index <= activeJourneyIndex;

                        return (
                          <button
                            key={step.title.en}
                            type="button"
                            onClick={() => setActiveJourneyIndex(index)}
                            aria-label={localized(locale, step.title)}
                            className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none"
                          >
                            <motion.span
                              animate={
                                reduceMotion
                                  ? undefined
                                  : isActive
                                    ? { y: [0, -4, 0], scale: [1, 1.08, 1] }
                                    : { y: 0, scale: 1 }
                              }
                              transition={{ duration: 1.35, repeat: isActive ? Infinity : 0 }}
                              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border text-white shadow-lg transition sm:h-10 sm:w-10 sm:rounded-2xl ${
                                isReached
                                  ? `bg-gradient-to-br ${step.color} border-white/70`
                                  : 'border-white/20 bg-blue-950/55 text-blue-200'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {isComplete && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 ring-2 ring-blue-700">
                                  <Check className="h-2.5 w-2.5 stroke-[4]" />
                                </span>
                              )}
                            </motion.span>
                            <span
                              className={`mt-1.5 line-clamp-2 text-[7px] font-black leading-tight sm:text-[9px] ${
                                isActive ? 'text-white' : 'text-blue-100/80'
                              }`}
                            >
                              {localized(locale, step.shortTitle)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex min-h-[38px] items-center gap-2 rounded-xl border border-white/10 bg-slate-950/15 px-2.5 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[10px] font-black text-cyan-100">
                      {activeJourneyIndex + 1}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeJourneyIndex}
                        initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="min-w-0"
                      >
                        <p className="text-[9px] font-black text-white sm:text-[10px]">
                          {localized(locale, activeStep.title)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[7px] font-medium text-blue-100 sm:text-[8px]">
                          {localized(locale, activeStep.description)}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative order-2 mx-auto h-[132px] w-[68px] rounded-[18px] border-[3px] border-slate-900 bg-slate-950 p-1 shadow-2xl sm:h-[150px] sm:w-[80px] sm:rounded-[22px] xl:order-none"
                  aria-hidden="true"
                >
                  <span className="absolute left-1/2 top-0 z-10 h-1.5 w-7 -translate-x-1/2 rounded-b-full bg-slate-900" />
                  <div className="flex h-full flex-col overflow-hidden rounded-[12px] bg-slate-50 p-1.5 sm:rounded-[15px] sm:p-2">
                    <div className="rounded-md bg-emerald-600 px-1 py-1 text-center text-[5px] font-black leading-tight text-white sm:text-[6px]">
                      {copy.certificateReady}
                    </div>
                    <div className="mt-2 flex flex-1 flex-col gap-1.5">
                      <div className="rounded border border-emerald-100 bg-white p-1">
                        <div className="h-1 w-3/4 rounded bg-emerald-500" />
                        <div className="mt-1 h-0.5 w-1/2 rounded bg-slate-200" />
                      </div>
                      <div className="rounded border border-blue-100 bg-white p-1">
                        <div className="h-1 w-2/3 rounded bg-blue-500" />
                        <div className="mt-1 h-0.5 w-4/5 rounded bg-slate-200" />
                      </div>
                      <div className="mt-auto flex items-center justify-center rounded-md bg-blue-50 py-1 text-blue-700">
                        <Download className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-0.5 text-[5px] font-black text-emerald-700 sm:text-[6px]">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {copy.delivered}
                    </div>
                  </div>
                  <motion.span
                    animate={reduceMotion ? undefined : { scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-700 bg-emerald-400 text-emerald-950 shadow-lg"
                  >
                    <Check className="h-4 w-4 stroke-[4]" />
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
