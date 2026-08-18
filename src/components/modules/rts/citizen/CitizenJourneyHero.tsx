'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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

type JourneyStepKey = 'choose' | 'apply' | 'track' | 'certificate';

type JourneyStep = {
  key: JourneyStepKey;
  icon: LucideIcon;
  color: string;
};

interface CitizenJourneyHeroProps {
  serviceCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onApply: () => void;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: 'choose',
    icon: Search,
    color: 'from-sky-400 to-blue-600',
  },
  {
    key: 'apply',
    icon: UploadCloud,
    color: 'from-amber-400 to-orange-600',
  },
  {
    key: 'track',
    icon: Clock3,
    color: 'from-violet-500 to-indigo-700',
  },
  {
    key: 'certificate',
    icon: BadgeCheck,
    color: 'from-emerald-400 to-teal-600',
  },
];

export function CitizenJourneyHero({
  serviceCount,
  searchQuery,
  onSearchChange,
  onApply,
}: CitizenJourneyHeroProps) {
  const t = useTranslations('rts.landing');
  const reduceMotion = useReducedMotion();
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const copy = {
    actBadge: t('hero.actBadge'),
    eyebrow: t('hero.eyebrow'),
    titleStart: t('hero.titleStart'),
    titleAccent: t('hero.titleAccent'),
    subtitle: t('hero.subtitle'),
    searchPlaceholder: t('hero.searchPlaceholder'),
    searchLabel: t('hero.searchLabel'),
    applyLabel: t('hero.applyLabel'),
    exploreLabel: t('hero.exploreLabel'),
    trust: t('hero.trust'),
    photoLabel: t('hero.photoLabel'),
    photoCaption: t('hero.photoCaption'),
    digitalLabel: t('hero.digitalLabel'),
    journeyEyebrow: t('journey.eyebrow'),
    journeyTitle: t('journey.title'),
    slaProtected: t('journey.slaProtected'),
    applyShort: t('hero.applyShort'),
    certificateReady: t('hero.certificateReady'),
    delivered: t('hero.delivered'),
    showStat: t('hero.showStat'),
  };

  const stats = useMemo(
    () => [
      {
        value: `${serviceCount || 65}+`,
        label: t('heroStats.services.label'),
        detail: t('heroStats.services.detail'),
        badge: t('heroStats.services.badge'),
      },
      {
        value: '52,480+',
        label: t('heroStats.received.label'),
        detail: t('heroStats.received.detail'),
        badge: t('heroStats.received.badge'),
      },
      {
        value: '51,120+',
        label: t('heroStats.delivered.label'),
        detail: t('heroStats.delivered.detail'),
        badge: t('heroStats.delivered.badge'),
      },
      {
        value: '98.4%',
        label: t('heroStats.sla.label'),
        detail: t('heroStats.sla.detail'),
        badge: t('heroStats.sla.badge'),
      },
    ],
    [serviceCount, t]
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
      <div className="relative xl:min-h-[550px] 2xl:min-h-[610px]">
        <div className="relative h-[190px] overflow-hidden bg-sky-100 sm:h-[240px] md:h-[270px] xl:absolute xl:inset-0 xl:h-auto">
          <Image
            src="/images/corporation-building.png"
            alt={copy.photoLabel}
            fill
            priority
            unoptimized
            sizes="(max-width: 1279px) 100vw, 1600px"
            className="object-cover object-center xl:object-[center_48%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-white/5 xl:bg-gradient-to-r xl:from-white/10 xl:via-transparent xl:to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5 xl:hidden">
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

        <div className="relative z-10 grid min-w-0 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:min-h-[550px] xl:grid-cols-[minmax(0,0.88fr)_minmax(540px,1.12fr)] 2xl:min-h-[610px] 2xl:grid-cols-[minmax(640px,0.72fr)_minmax(940px,1.28fr)]">
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-w-0 bg-white p-5 sm:p-7 md:flex md:flex-col md:justify-center md:border-r md:border-slate-100 md:p-5 lg:p-7 xl:m-5 xl:mr-0 xl:self-center xl:rounded-[1.75rem] xl:border xl:border-white/80 xl:bg-white/95 xl:p-7 xl:shadow-[0_24px_70px_-34px_rgba(15,23,42,0.55)] xl:backdrop-blur-md 2xl:m-7 2xl:mr-0 2xl:bg-white/92 2xl:p-9"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase leading-4 tracking-[0.09em] text-amber-800 sm:text-[10px]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{copy.actBadge}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-800 xl:hidden 2xl:inline-flex">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                {copy.eyebrow}
              </span>
            </div>

            <h1
              id="citizen-hero-title"
              className="mt-4 max-w-2xl text-[2.15rem] font-black leading-[1.03] tracking-[-0.045em] text-[#082f6a] sm:text-[2.8rem] md:text-[2.25rem] lg:text-[2.45rem] xl:text-[2.85rem] 2xl:text-[3.2rem]"
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
                <span className="hidden sm:inline md:hidden lg:inline">{copy.searchLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onApply}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b4fc1] px-4 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#083f9c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 md:px-3 md:text-xs lg:px-4 lg:text-sm"
              >
                <FileText className="h-4 w-4" />
                {copy.applyLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-blue-900 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 md:px-3 md:text-xs lg:px-4 lg:text-sm"
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
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="min-w-0 bg-gradient-to-b from-slate-50 to-white p-3 pb-4 sm:p-5 md:flex md:items-center md:p-4 lg:p-5 xl:items-end xl:bg-none xl:bg-transparent xl:p-6 xl:pl-5"
          >
            <div
              id="citizen-journey"
              className="relative ml-auto w-full scroll-mt-24 overflow-hidden rounded-[1.6rem] border border-blue-300/25 bg-gradient-to-br from-[#0868de] via-[#0754c5] to-[#063797] p-4 text-white shadow-[0_28px_65px_-28px_rgba(2,28,79,0.9)] sm:p-5 lg:max-w-[1040px]"
            >
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-950/45 blur-3xl" />

              <div className="relative grid grid-cols-[minmax(0,1fr)_72px] gap-3 sm:grid-cols-[minmax(0,1fr)_88px] sm:gap-4 xl:grid-cols-[minmax(145px,0.7fr)_minmax(330px,1.55fr)_88px] xl:items-center">
                <div className="min-w-0">
                  <AnimatePresence mode="wait" initial={false}>
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
                            key={step.key}
                            type="button"
                            onClick={() => setActiveJourneyIndex(index)}
                            aria-label={t(`journey.steps.${step.key}.title`)}
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
                              {t(`journey.steps.${step.key}.shortTitle`)}
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
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeJourneyIndex}
                        initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="min-w-0"
                      >
                        <p className="text-[9px] font-black text-white sm:text-[10px]">
                          {t(`journey.steps.${activeStep.key}.title`)}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[7px] font-medium text-blue-100 sm:text-[8px]">
                          {t(`journey.steps.${activeStep.key}.description`)}
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
