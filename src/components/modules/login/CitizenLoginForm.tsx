'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input, Button, ValidationMessage, Card, CardHeader, CardContent } from '@/components/common';
import { sendCitizenOtpAction, verifyCitizenOtpAction, fetchNodesAction, fetchSectorsAction } from '@/app/[locale]/service/login/actions';
import { LoginFormCouncilLogo } from './LoginFormCouncilLogo';
import { Landmark } from 'lucide-react';

type LoginMethod = 'mobile' | 'upic' | 'property';
type LoginStep = 'phone' | 'otp';

interface CitizenLoginFormProps {
  locale: string;
  ulbData?: any;
}

export function CitizenLoginForm({ locale, ulbData }: CitizenLoginFormProps) {
  const t = useTranslations('rts.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    const isLoggedIn = typeof document !== 'undefined' && document.cookie.split('; ').some(row => row.startsWith('rts_logged_in='));
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    }
  }, [locale, router]);

  // Component States
  const [step, setStep] = useState<LoginStep>('phone');
  const [method, setMethod] = useState<LoginMethod>('mobile');

  // Input States
  const [mobile, setMobile] = useState('');
  const [upicId, setUpicId] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [propertyNo, setPropertyNo] = useState('');
  const [otp, setOtp] = useState('');

  // Dropdown options & loading states for property login
  const [nodes, setNodes] = useState<{ value: string; items: string }[]>([]);
  const [sectors, setSectors] = useState<{ value: string; items: string }[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Property Suggestions Autocomplete States
  const [propertySuggestions, setPropertySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch nodes on mount
  useEffect(() => {
    async function loadNodes() {
      setLoadingNodes(true);
      try {
        const res = await fetchNodesAction();
        if (res.success && Array.isArray(res.data)) {
          setNodes(res.data);
        }
      } catch (err) {
        console.error('Failed to load nodes:', err);
      } finally {
        setLoadingNodes(false);
      }
    }
    loadNodes();
  }, []);

  // Fetch sectors when selected node changes
  useEffect(() => {
    if (!nodeId) {
      setSectors([]);
      setSectorId('');
      return;
    }
    async function loadSectors() {
      setLoadingSectors(true);
      try {
        const res = await fetchSectorsAction(nodeId);
        if (res.success && Array.isArray(res.data)) {
          setSectors(res.data);
        }
      } catch (err) {
        console.error('Failed to load sectors:', err);
      } finally {
        setLoadingSectors(false);
      }
    }
    loadSectors();
  }, [nodeId]);

  const handlePropertyNoChange = (val: string) => {
    setPropertyNo(val);
    if (!val.trim()) {
      setPropertySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const inputVal = val.trim();
    // Dynamically generate property suggestions (e.g. typing 5 will suggest 5, 5-1, 5-2, 56, etc.)
    const generated = [
      inputVal,
      inputVal + '-1',
      inputVal + '-2',
      inputVal + '6',
      inputVal + '0',
      inputVal + '2',
      inputVal + '5',
      inputVal + '01',
      inputVal + '12',
      inputVal + '8',
      inputVal + '4',
      inputVal + '7',
    ].filter((item, index, self) => self.indexOf(item) === index);
    setPropertySuggestions(generated);
    setShowSuggestions(true);
  };

  // Messages States
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState('');

  // Resolve branding information dynamically
  const ulb = ulbData;
  const logoSrc = (ulb?.logoUrl || ulb?.ulbLogo || '').trim();
  const title = (ulbData?.ulbName ?? '').trim();
  const subTitle = (ulbData?.ulbNameLocal ?? '').trim();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (method === 'mobile' && !/^\d{10}$/.test(mobile)) {
      setError(t('messages.invalidPhone'));
      return;
    }

    if (method === 'upic' && !upicId.trim()) {
      setError('Please enter a UPIC ID.');
      return;
    }

    if (method === 'property') {
      if (!nodeId) {
        setError('Please select a Node.');
        return;
      }
      if (!sectorId) {
        setError('Please select a Sector.');
        return;
      }
      if (!propertyNo.trim()) {
        setError('Please enter a Property Number.');
        return;
      }
    }

    startTransition(async () => {
      const res = await sendCitizenOtpAction(method, {
        mobile,
        upicId,
        propertyNo: method === 'property' ? `${sectorId}-${propertyNo}` : undefined
      });
      if (res.success && res.txnId) {
        setMaskedPhone(res.maskedPhone || '');
        setStep('otp');
        setInfo(t('messages.otpSent'));
      } else {
        setError(res.error || t('messages.sendOtpFailed'));
      }
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!/^\d{6}$/.test(otp)) {
      setError(t('messages.invalidOtp'));
      return;
    }

    startTransition(async () => {
      const res = await verifyCitizenOtpAction(otp);
      if (res.success) {
        setInfo(t('messages.loginSuccess'));
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/${locale}/service/dashboard`);
        }
        router.refresh();
      } else {
        setError(res.error || t('messages.verifyFailed'));
      }
    });
  };

  const handleResendOtp = async () => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await sendCitizenOtpAction(method, {
        mobile,
        upicId,
        propertyNo: method === 'property' ? `${sectorId}-${propertyNo}` : undefined
      });
      if (res.success) {
        setInfo(t('messages.otpResent'));
      } else {
        setError(res.error || t('messages.resendFailed'));
      }
    });
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setError(null);
    setInfo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-100 to-blue-100 px-4 py-10 overflow-auto">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
          {/* Header/Branding */}
          <CardHeader className="flex flex-col items-center space-y-1 pb-2 pt-8 text-center">
            <div className="relative mb-6 drop-shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="relative flex h-28 w-24 items-center justify-center">
                {logoSrc ? (
                  <LoginFormCouncilLogo key={logoSrc} logoSrc={logoSrc} title={title} />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50/80 text-cyan-600"
                    aria-hidden
                  >
                    <Landmark className="h-14 w-14 opacity-90" strokeWidth={1.25} />
                  </div>
                )}
              </div>
            </div>
            
            {title ? (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                {title}
              </h1>
            ) : null}
            {subTitle ? (
              <p className="text-lg font-medium text-gray-600">
                {subTitle}
              </p>
            ) : null}

            <div className="flex w-full items-center justify-center gap-2 py-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>

            <div className="pt-1 text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              {step === 'phone' ? t('phone.welcome') : t('otp.enterOtp')}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-10 pt-4">
            {/* Error/Info Banner */}
            {error && (
              <div className="w-full">
                <ValidationMessage
                  type="error"
                  message={error}
                  visible
                  className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium [&_svg]:shrink-0"
                />
              </div>
            )}
            {info && (
              <div className="w-full">
                <ValidationMessage
                  type="info"
                  message={info}
                  visible
                  className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium !border-emerald-200 !bg-emerald-50 !text-emerald-800"
                />
              </div>
            )}

            {step === 'phone' ? (
              <div className="space-y-5">
                {/* Tabs */}
                <div className="flex items-end justify-center gap-2 border-b border-gray-200 pb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('upic');
                      setError(null);
                    }}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${
                      method === 'upic'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('phone.tabUpic')}
                    {method === 'upic' && (
                      <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('property');
                      setError(null);
                    }}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${
                      method === 'property'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('phone.tabProperty')}
                    {method === 'property' && (
                      <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('mobile');
                      setError(null);
                    }}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${
                      method === 'mobile'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('phone.tabMobile')}
                    {method === 'mobile' && (
                      <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-600" />
                    )}
                  </button>
                </div>

                {/* Helper Text Banner */}
                <div className="bg-cyan-500/10 text-cyan-700 border-l-4 border-cyan-500 text-center font-medium rounded-r-md py-2.5 px-3 text-sm">
                  {method === 'upic' && t('phone.helperUpic')}
                  {method === 'property' && t('phone.helperProperty')}
                  {method === 'mobile' && t('phone.helperMobile')}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {method === 'upic' && (
                    <Input
                      label={t('phone.upicLabel')}
                      placeholder={t('phone.upicPh')}
                      value={upicId}
                      onChange={(e) => setUpicId(e.target.value)}
                      fullWidth
                    />
                  )}

                  {method === 'property' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Node Select */}
                        <div className="flex flex-col">
                          <label className="mb-1.5 text-sm font-medium text-gray-700">
                            {t('phone.node') || 'Node'}
                          </label>
                          <select
                            value={nodeId}
                            onChange={(e) => setNodeId(e.target.value)}
                            disabled={loadingNodes}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 h-[38px]"
                          >
                            <option value="">{loadingNodes ? 'Loading...' : 'Select Node'}</option>
                            {nodes.map((n) => (
                              <option key={n.value} value={n.value}>
                                {n.items}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sector Select */}
                        <div className="flex flex-col">
                          <label className="mb-1.5 text-sm font-medium text-gray-700">
                            {t('phone.sector') || 'Sector'}
                          </label>
                          <select
                            value={sectorId}
                            onChange={(e) => setSectorId(e.target.value)}
                            disabled={!nodeId || loadingSectors}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 h-[38px]"
                          >
                            <option value="">
                              {!nodeId
                                ? 'Select Node first'
                                : loadingSectors
                                  ? 'Loading...'
                                  : 'Select Sector'}
                            </option>
                            {sectors.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.items}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Property Suggestions Autocomplete */}
                      <div className="relative">
                        <Input
                          label={t('phone.property')}
                          placeholder={t('phone.propertyPh')}
                          value={propertyNo}
                          onChange={(e) => handlePropertyNoChange(e.target.value)}
                          onFocus={() => {
                            if (propertyNo.trim()) {
                              setShowSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          fullWidth
                        />
                        {showSuggestions && propertySuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[150] divide-y divide-gray-100">
                            {propertySuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  setPropertyNo(suggestion);
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors font-semibold cursor-pointer"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {method === 'mobile' && (
                    <Input
                      label={t('phone.mobileLabel')}
                      placeholder={t('phone.mobilePh')}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      fullWidth
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-base rounded-md transition-colors font-semibold cursor-pointer"
                    isLoading={isPending}
                  >
                    {t('phone.sendOtp')}
                  </Button>
                </form>

                {/* Admin login redirection link */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-500 font-medium">{t('phone.orContinue')}</p>
                    <a
                      href={`/${locale}/login`}
                      className="block w-full h-11 leading-[2.75rem] border-2 border-cyan-600 hover:border-cyan-700 hover:bg-cyan-500/5 text-cyan-600 rounded-md text-center font-semibold transition-all cursor-pointer"
                    >
                      {t('phone.admin')}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-md py-2.5 px-3 text-center mb-3">
                  <p className="text-cyan-800 text-sm font-medium">
                    {t('otp.enterSent')}{' '}
                    <span className="font-mono font-semibold text-cyan-600">{maskedPhone}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input
                    label={t('otp.enterOtp')}
                    placeholder={t('otp.otpPh')}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="text-center tracking-[0.35em] font-mono text-lg"
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-base rounded-md transition-colors font-semibold cursor-pointer"
                    isLoading={isPending}
                  >
                    {t('otp.verify')}
                  </Button>
                </form>

                <div className="flex items-center justify-between gap-3 text-sm pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isPending}
                    className="text-cyan-600 hover:text-cyan-700 hover:underline disabled:opacity-50 transition-all font-semibold cursor-pointer"
                  >
                    {t('otp.resend')}
                  </button>

                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    disabled={isPending}
                    className="text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-50 transition-all font-semibold cursor-pointer"
                  >
                    {t('otp.change')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
