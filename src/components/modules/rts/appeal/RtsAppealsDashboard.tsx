'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gavel,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  RTSAppealDashboardCardsCountDto,
  RTSAppealDashboardDetailsDto,
  RTSAppealProcessDetailsDto,
  RTSAppealQueryParameters,
} from '@/types/rts/appeal.types';
import {
  getAppealDashboardCardsAction,
  getAppealDashboardGridAction,
  getAppealProcessDetailsAction,
} from '@/app/[locale]/rts/appeals/actions';
import RtsAppealProcessDrawer from './RtsAppealProcessDrawer';

interface RtsAppealsDashboardProps {
  locale: string;
}

export default function RtsAppealsDashboard({ locale }: RtsAppealsDashboardProps) {
  const isMr = locale === 'mr';
  const isHi = locale === 'hi';

  // ── States ─────────────────────────────────────────────────────────────────
  const [cards, setCards] = useState<RTSAppealDashboardCardsCountDto>({
    totalAppeals: 0,
    pendingAppeals: 0,
    approvedAppeals: 0,
    rejectedAppeals: 0,
    returnedAppeals: 0,
    firstAppeals: 0,
    secondAppeals: 0,
    delayedAppeals: 0,
  });

  const [gridItems, setGridItems] = useState<RTSAppealDashboardDetailsDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState<number | undefined>(undefined);

  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isLoadingGrid, setIsLoadingGrid] = useState(true);

  // Drawer states
  const [appealDetails, setAppealDetails] = useState<RTSAppealProcessDetailsDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Translations ───────────────────────────────────────────────────────────
  const t = {
    title: isMr ? 'अपील व्यवस्थापन केंद्र' : isHi ? 'अपील प्रबंधन केंद्र' : 'Appeals Management Center',
    subtitle: isMr
      ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ (MRTSA) अंतर्गत प्रथम व द्वितीय अपीलीय सुनावणी'
      : isHi
      ? 'महाराष्ट्र लोक सेवा अधिकार अधिनियम २०१५ अंतर्गत प्रथम व द्वितीय अपीलीय सुनवाई'
      : 'First & Second Appellate Adjudication under Maharashtra Right to Public Services Act (MRTSA 2015)',
    refresh: isMr ? 'ताजे करा' : isHi ? 'ताजा करें' : 'Refresh',
    searchPlaceholder: isMr
      ? 'अपील क्र., अर्ज क्र., नाव किंवा मोबाईलने शोधा...'
      : isHi
      ? 'अपील क्र., आवेदन क्र., नाम या मोबाइल से खोजें...'
      : 'Search by Appeal No, Application No, Name, or Mobile...',
    allStatuses: isMr ? 'सर्व स्थिती' : isHi ? 'सभी स्थितियाँ' : 'All Statuses',
    pending: isMr ? 'प्रलंबित' : isHi ? 'लंबित' : 'Pending',
    approved: isMr ? 'मंजूर' : isHi ? 'स्वीकृत' : 'Approved',
    rejected: isMr ? 'नामंजूर' : isHi ? 'खारिज' : 'Rejected',
    returned: isMr ? 'परत पाठवले' : isHi ? 'वापस भेजा गया' : 'Returned',
    allLevels: isMr ? 'सर्व अपीले (स्तर)' : isHi ? 'सभी स्तर' : 'All Tiers',
    firstLevel: isMr ? '१ ली अपील (प्रथम स्तर)' : isHi ? '१ ली अपील (प्रथम स्तर)' : '1st Appeal Tier',
    secondLevel: isMr ? '२ री अपील (द्वितीय स्तर)' : isHi ? '२ री अपील (द्वितीय स्तर)' : '2nd Appeal Tier',
    colAppealNo: isMr ? 'अपील क्रमांक' : isHi ? 'अपील क्रमांक' : 'Appeal No',
    colAppNo: isMr ? 'मूळ अर्ज क्रमांक' : isHi ? 'मूल आवेदन क्र.' : 'Original App No',
    colApplicant: isMr ? 'अर्जदाराचे नाव' : isHi ? 'आवेदक का नाम' : 'Applicant Name',
    colService: isMr ? 'लोकसेवा' : isHi ? 'लोक सेवा' : 'RTS Service',
    colLevel: isMr ? 'अपील स्तर' : isHi ? 'अपील स्तर' : 'Tier',
    colGround: isMr ? 'तक्रार प्रकार' : isHi ? 'शिकायत का आधार' : 'Statutory Ground',
    colDate: isMr ? 'दाखल दिनांक' : isHi ? 'दाखिल तिथि' : 'Filing Date',
    colStatus: isMr ? 'स्थिती' : isHi ? 'स्थिति' : 'Status',
    colActions: isMr ? 'कार्यवाही' : isHi ? 'कार्यवाही' : 'Action',
    reviewBtn: isMr ? 'तपासा व निर्णय घ्या' : isHi ? 'जांच व निर्णय' : 'Review & Adjudicate',
    noRecords: isMr ? 'कोणतेही अपील आढळले नाही' : isHi ? 'कोई अपील नहीं मिली' : 'No appeal records found',
    showing: isMr ? 'दर्शवित आहे' : isHi ? 'दिखा रहा है' : 'Showing',
    of: isMr ? 'पैकी' : isHi ? 'में से' : 'of',
  };

  // ── Load Data ──────────────────────────────────────────────────────────────
  const fetchCards = useCallback(async () => {
    setIsLoadingCards(true);
    try {
      const data = await getAppealDashboardCardsAction();
      setCards(data);
    } catch {
      toast.error(isMr ? 'डॅशबोर्ड आकडेवारी लोड करण्यात त्रुटी आली' : 'Failed to load card statistics');
    } finally {
      setIsLoadingCards(false);
    }
  }, [isMr]);

  const fetchGrid = useCallback(async () => {
    setIsLoadingGrid(true);
    try {
      const params: RTSAppealQueryParameters = {
        searchTerm: searchTerm.trim() || undefined,
        appealStatus: statusFilter !== 'All' ? statusFilter : undefined,
        appealLevel: levelFilter,
        pageNumber,
        pageSize,
        sortBy: 'CreatedDate',
        sortOrder: 'desc',
      };
      const result = await getAppealDashboardGridAction(params);
      setGridItems(result.items);
      setTotalCount(result.totalCount);
    } catch {
      toast.error(isMr ? 'अपील सूची लोड करण्यात त्रुटी आली' : 'Failed to load appeals grid');
    } finally {
      setIsLoadingGrid(false);
    }
  }, [searchTerm, statusFilter, levelFilter, pageNumber, pageSize, isMr]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    fetchGrid();
  }, [fetchGrid]);

  const handleRefresh = () => {
    fetchCards();
    fetchGrid();
    toast.success(isMr ? 'डेटा ताजा केला गेला' : 'Data refreshed');
  };

  // ── Open Drawer ────────────────────────────────────────────────────────────
  const handleOpenAppealDetails = async (appealId: number) => {
    setIsDrawerOpen(true);
    setIsLoadingDetails(true);
    try {
      const details = await getAppealProcessDetailsAction(appealId);
      setAppealDetails(details);
    } catch {
      toast.error(isMr ? 'तपशील लोड करण्यात त्रुटी आली' : 'Failed to load appeal details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCardFilterClick = (statusKey: string, levelVal?: number) => {
    setStatusFilter(statusKey);
    setLevelFilter(levelVal);
    setPageNumber(1);
  };

  // ── Metric Cards Config ────────────────────────────────────────────────────
  const metricCards = [
    {
      id: 'total',
      label: isMr ? 'एकूण अपीले' : isHi ? 'कुल अपीलें' : 'Total Appeals',
      count: cards.totalAppeals,
      icon: <Scale className="h-5 w-5 text-blue-600" />,
      border: 'border-blue-200',
      bg: 'bg-blue-50/50',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20',
      onClick: () => handleCardFilterClick('All', undefined),
      isActive: statusFilter === 'All' && levelFilter === undefined,
    },
    {
      id: 'pending',
      label: isMr ? 'सुनावणी प्रलंबित' : isHi ? 'सुनवाई लंबित' : 'Pending Adjudication',
      count: cards.pendingAppeals,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/20',
      onClick: () => handleCardFilterClick('Pending', undefined),
      isActive: statusFilter === 'Pending',
    },
    {
      id: 'approved',
      label: isMr ? 'मंजूर अपीले' : isHi ? 'स्वीकृत अपीलें' : 'Allowed / Relief',
      count: cards.approvedAppeals,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20',
      onClick: () => handleCardFilterClick('Approved', undefined),
      isActive: statusFilter === 'Approved',
    },
    {
      id: 'rejected',
      label: isMr ? 'नामंजूर अपीले' : isHi ? 'खारिज अपीलें' : 'Dismissed / Rejected',
      count: cards.rejectedAppeals,
      icon: <XCircle className="h-5 w-5 text-rose-600" />,
      border: 'border-rose-200',
      bg: 'bg-rose-50/50',
      activeBorder: 'border-rose-600 ring-2 ring-rose-500/20',
      onClick: () => handleCardFilterClick('Rejected', undefined),
      isActive: statusFilter === 'Rejected',
    },
    {
      id: 'returned',
      label: isMr ? 'पुनर्तपासणीस परत' : isHi ? 'पुनर्विचार हेतु वापस' : 'Returned for Re-check',
      count: cards.returnedAppeals,
      icon: <RotateCcw className="h-5 w-5 text-indigo-600" />,
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/50',
      activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/20',
      onClick: () => handleCardFilterClick('Returned', undefined),
      isActive: statusFilter === 'Returned',
    },
    {
      id: 'first',
      label: isMr ? '१ ली अपीले' : isHi ? '१ ली अपीलें' : '1st Appeals',
      count: cards.firstAppeals,
      icon: <Layers className="h-5 w-5 text-cyan-600" />,
      border: 'border-cyan-200',
      bg: 'bg-cyan-50/50',
      activeBorder: 'border-cyan-600 ring-2 ring-cyan-500/20',
      onClick: () => handleCardFilterClick('All', 1),
      isActive: levelFilter === 1,
    },
    {
      id: 'second',
      label: isMr ? '२ री अपीले' : isHi ? '२ री अपीलें' : '2nd Appeals',
      count: cards.secondAppeals,
      icon: <Gavel className="h-5 w-5 text-purple-600" />,
      border: 'border-purple-200',
      bg: 'bg-purple-50/50',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20',
      onClick: () => handleCardFilterClick('All', 2),
      isActive: levelFilter === 2,
    },
    {
      id: 'delayed',
      label: isMr ? 'विलंब माफी अर्ज' : isHi ? 'विलंब माफी आवेदन' : 'Delayed / Condonation',
      count: cards.delayedAppeals,
      icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      border: 'border-orange-200',
      bg: 'bg-orange-50/50',
      activeBorder: 'border-orange-600 ring-2 ring-orange-500/20',
      onClick: () => handleCardFilterClick('Delayed', undefined),
      isActive: statusFilter === 'Delayed',
    },
  ];

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="w-full space-y-5 p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-md shadow-blue-900/20">
              <Scale className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                  MRTSA 2015
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{t.title}</h1>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t.refresh}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {metricCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
              card.border
            } ${card.bg} ${card.isActive ? card.activeBorder : ''}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="p-1.5 rounded-xl bg-white shadow-2xs">{card.icon}</span>
              {card.isActive && (
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </div>
            <div className="mt-3">
              <span className="text-xl font-black text-slate-900 block leading-tight">
                {isLoadingCards ? '-' : card.count}
              </span>
              <span className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 line-clamp-1">
                {card.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Filter & Search Toolbar ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="All">{t.allStatuses}</option>
              <option value="Pending">{t.pending}</option>
              <option value="Approved">{t.approved}</option>
              <option value="Rejected">{t.rejected}</option>
              <option value="Returned">{t.returned}</option>
            </select>

            <select
              value={levelFilter === undefined ? '' : levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value ? Number(e.target.value) : undefined);
                setPageNumber(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="">{t.allLevels}</option>
              <option value="1">{t.firstLevel}</option>
              <option value="2">{t.secondLevel}</option>
            </select>

            {(searchTerm || statusFilter !== 'All' || levelFilter !== undefined) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setLevelFilter(undefined);
                  setPageNumber(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                {isMr ? 'पुसा' : 'Reset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Appeals Data Grid ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-black text-slate-600 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">{t.colAppealNo}</th>
                <th className="py-3.5 px-4">{t.colAppNo}</th>
                <th className="py-3.5 px-4">{t.colApplicant}</th>
                <th className="py-3.5 px-4">{t.colService}</th>
                <th className="py-3.5 px-4">{t.colLevel}</th>
                <th className="py-3.5 px-4">{t.colGround}</th>
                <th className="py-3.5 px-4">{t.colDate}</th>
                <th className="py-3.5 px-4">{t.colStatus}</th>
                <th className="py-3.5 px-4 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingGrid ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-semibold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>{isMr ? 'डेटा लोड होत आहे...' : 'Loading appeals...'}</span>
                  </td>
                </tr>
              ) : gridItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-semibold">
                    <Scale className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">{t.noRecords}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isMr ? 'सध्याच्या निकषांनुसार कोणतेही अपील उपलब्ध नाही.' : 'No appeals match your search criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                gridItems.map((item, idx) => (
                  <tr
                    key={item.appealId || item.id || idx}
                    className="hover:bg-blue-50/40 transition duration-150 font-semibold text-slate-700"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                        {item.appealNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-800">{item.applicationNo}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{item.applicantName || '-'}</span>
                      {(item.mobileNumber || (item as any).applicantMobile || (item as any).applicantMobileNo) && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {item.mobileNumber || (item as any).applicantMobile || (item as any).applicantMobileNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate" title={item.serviceName}>
                      <span className="font-medium text-slate-800 block truncate">{item.serviceName}</span>
                      {item.departmentName && (
                        <span className="text-[10px] text-slate-400 font-normal truncate block">{item.departmentName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          item.appealLevel === 2
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                        }`}
                      >
                        {(item as any).appealLevelLabel || item.appealLevelDisplay || (item.appealLevel === 2 ? '2nd Appeal' : '1st Appeal')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{item.appealTypeName}</span>
                        {(item.isDelayed || (item as any).filingCategory === 'Delayed') && (
                          <span
                            className="rounded-full bg-orange-100 text-orange-800 px-1.5 py-0.2 text-[9px] font-black"
                            title={isMr ? 'विलंब माफी अर्ज दाखल' : 'Condonation of delay filed'}
                          >
                            {isMr ? 'विलंबित' : 'Delayed'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {item.filingDate ? new Date(item.filingDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        switch (item.appealStatus?.toLowerCase()) {
                          case 'approved':
                          case 'allowed':
                            return (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                {isMr ? 'मंजूर' : 'Allowed'}
                              </span>
                            );
                          case 'rejected':
                          case 'dismissed':
                            return (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-black text-rose-800">
                                <XCircle className="h-3 w-3 text-rose-600" />
                                {isMr ? 'नामंजूर' : 'Dismissed'}
                              </span>
                            );
                          case 'returned':
                            return (
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-800">
                                <RotateCcw className="h-3 w-3 text-blue-600" />
                                {isMr ? 'परत' : 'Returned'}
                              </span>
                            );
                          default:
                            return (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                                <Clock className="h-3 w-3 text-amber-600" />
                                {isMr ? 'प्रलंबित' : 'Pending'}
                              </span>
                            );
                        }
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAppealDetails(item.appealId || item.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 text-xs font-black shadow-xs transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t.reviewBtn}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-600 gap-3">
            <div>
              {t.showing} <span className="font-black text-slate-900">{(pageNumber - 1) * pageSize + 1}</span> -{' '}
              <span className="font-black text-slate-900">{Math.min(pageNumber * pageSize, totalCount)}</span>{' '}
              {t.of} <span className="font-black text-slate-900">{totalCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 bg-white p-1.5 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-black px-2">
                {pageNumber} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-300 bg-white p-1.5 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Adjudication Drawer ─────────────────────────────────────────────── */}
      <RtsAppealProcessDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        appealDetails={appealDetails}
        isLoading={isLoadingDetails}
        onActionSuccess={handleRefresh}
        locale={locale}
      />
    </div>
  );
}
