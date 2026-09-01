'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input, Button, ValidationMessage, Card, CardHeader, CardContent } from '@/components/common';
import {
  sendCitizenOtpAction,
  searchCitizenPropertiesAction,
  verifyCitizenOtpAction,
  fetchNodesAction,
  fetchSectorsAction
} from '@/app/[locale]/service/login/actions';
import { type CitizenProperty } from '@/lib/api/citizen-property.service';
import { LoginFormCouncilLogo } from '../../login/LoginFormCouncilLogo';
import { ArrowLeft, Landmark, Building2, CheckCircle2 } from 'lucide-react';

type LoginMethod = 'mobile' | 'upic' | 'property';
type LoginStep = 'phone' | 'properties' | 'otp';

interface CitizenLoginFormProps {
  locale: string;
  ulbData?: any;
}

function buildPropertySearchValue(sectorId: string, propertyNo: string) {
  const sector = sectorId.trim();
  const property = propertyNo.trim();

  if (!sector || property.toUpperCase().startsWith(`${sector.toUpperCase()}-`)) {
    return property;
  }

  return `${sector}-${property}`;
}

export function CitizenLoginForm({ locale, ulbData }: CitizenLoginFormProps) {
  const t = useTranslations('rts.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const externalServiceId = searchParams.get('externalServiceId');
  const [isPending, startTransition] = useTransition();

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

  // Multiple Properties Selection States
  const [propertiesList, setPropertiesList] = useState<CitizenProperty[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [resolvedMobile, setResolvedMobile] = useState<string>('');

  // Dropdown options & loading states for property login
  const [nodes, setNodes] = useState<{ value: string; items: string }[]>([]);
  const [sectors, setSectors] = useState<{ value: string; items: string }[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Property Suggestions Autocomplete States
  const [propertySuggestions, setPropertySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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

  const ulb = ulbData;
  const logoSrc = (ulb?.logoUrl || ulb?.ulbLogo || '').trim();
  const title = (ulbData?.ulbName ?? '').trim();
  const subTitle = (ulbData?.ulbNameLocal ?? '').trim();

  const handleMethodChange = (newMethod: 'upic' | 'property' | 'mobile') => {
    setMethod(newMethod);
    setMobile('');
    setUpicId('');
    setNodeId('');
    setSectorId('');
    setPropertyNo('');
    setOtp('');
    setPropertiesList([]);
    setSelectedOwnerId(null);
    setResolvedMobile('');
    setStep('phone');
    setError(null);
    setInfo(null);
  };

  const handleSearchAndSendOtp = async (e: React.FormEvent) => {
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
      if (!nodeId) { setError('Please select a Node.'); return; }
      if (!sectorId) { setError('Please select a Sector.'); return; }
      if (!propertyNo.trim()) { setError('Please enter a Property Number.'); return; }
    }

    startTransition(async () => {
      try {
        const searchRes = await searchCitizenPropertiesAction(
          method,
          {
            mobile,
            upicId,
            propertyNo:
              method === 'property' ? buildPropertySearchValue(sectorId, propertyNo) : undefined,
          }
        );

        if (!searchRes.success || !searchRes.properties || searchRes.properties.length === 0) {
          setError(searchRes.error || 'नोंदणीकृत मालमत्ता आढळली नाही.');
          return;
        }

        const props = searchRes.properties;
        const targetMobile = searchRes.mobile || mobile;
        setPropertiesList(props);
        setResolvedMobile(targetMobile);

        if (props.length > 1) {
          setSelectedOwnerId(props[0].ownerId);
          setStep('properties');
          return;
        }

        const singleOwnerId = props[0].ownerId;
        setSelectedOwnerId(singleOwnerId);

        const otpRes = await sendCitizenOtpAction(
          method,
          {
            mobile: targetMobile,
            upicId,
            propertyNo:
              method === 'property' ? buildPropertySearchValue(sectorId, propertyNo) : undefined,
          },
          externalServiceId ?? undefined,
          singleOwnerId
        );

        if (otpRes.success) {
          if (otpRes.directLogin) {
            setInfo(t('messages.loginSuccess') || 'लॉगिन यशस्वी झाले.');
            if (otpRes.externalDestination) {
              window.location.href = otpRes.externalDestination;
              return;
            }

            let targetUrl = redirectUrl || `/${locale}/service/dashboard`;
            if (externalServiceId) {
              const errorCode = otpRes.serviceRedirectError || 'service-unavailable';
              targetUrl = `/${locale}/service/dashboard?serviceRedirectError=${encodeURIComponent(errorCode)}`;
            } else {
              const cleanUpic = (otpRes.citizen?.upicId || upicId || '').trim().toUpperCase();
              if (cleanUpic) {
                if (targetUrl.includes('upicNo=')) {
                  targetUrl = targetUrl.replace(/upicNo=[^&]*/, `upicNo=${encodeURIComponent(cleanUpic)}`);
                } else {
                  const sep = targetUrl.includes('?') ? '&' : '?';
                  targetUrl = `${targetUrl}${sep}upicNo=${encodeURIComponent(cleanUpic)}`;
                }
              }
            }
            window.location.href = targetUrl;
            return;
          }

          setMaskedPhone(otpRes.maskedPhone || '');
          setStep('otp');
          setInfo(t('messages.otpSent'));
        } else {
          setError(otpRes.error || t('messages.sendOtpFailed'));
        }
      } catch (err: any) {
        console.error('Error during search/login:', err);
        setError(err?.message || 'Login failed. Please try again.');
      }
    });
  };

  const handleProceedWithSelectedProperty = async () => {
    if (!selectedOwnerId) {
      setError('कृपया एक मालमत्ता निवडा.');
      return;
    }
    setError(null);
    setInfo(null);

    startTransition(async () => {
      try {
        const otpRes = await sendCitizenOtpAction(
          method,
          {
            mobile: resolvedMobile || mobile,
            upicId,
            propertyNo:
              method === 'property' ? buildPropertySearchValue(sectorId, propertyNo) : undefined,
          },
          externalServiceId ?? undefined,
          selectedOwnerId
        );

        if (otpRes.success) {
          if (otpRes.directLogin) {
            setInfo(t('messages.loginSuccess') || 'लॉगिन यशस्वी झाले.');
            if (otpRes.externalDestination) {
              window.location.href = otpRes.externalDestination;
              return;
            }

            let targetUrl = redirectUrl || `/${locale}/service/dashboard`;
            if (externalServiceId) {
              const errorCode = otpRes.serviceRedirectError || 'service-unavailable';
              targetUrl = `/${locale}/service/dashboard?serviceRedirectError=${encodeURIComponent(errorCode)}`;
            } else {
              const cleanUpic = (otpRes.citizen?.upicId || upicId || '').trim().toUpperCase();
              if (cleanUpic) {
                if (targetUrl.includes('upicNo=')) {
                  targetUrl = targetUrl.replace(/upicNo=[^&]*/, `upicNo=${encodeURIComponent(cleanUpic)}`);
                } else {
                  const sep = targetUrl.includes('?') ? '&' : '?';
                  targetUrl = `${targetUrl}${sep}upicNo=${encodeURIComponent(cleanUpic)}`;
                }
              }
            }
            window.location.href = targetUrl;
            return;
          }

          setMaskedPhone(otpRes.maskedPhone || '');
          setStep('otp');
          setInfo(t('messages.otpSent'));
        } else {
          setError(otpRes.error || t('messages.sendOtpFailed'));
        }
      } catch (err: any) {
        console.error('Error sending OTP:', err);
        setError(err?.message || 'Failed to send OTP. Please try again.');
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
      try {
        const res = await verifyCitizenOtpAction(otp, externalServiceId ?? undefined);
        if (res.success) {
          setInfo(t('messages.loginSuccess'));
          if (res.externalDestination) {
            window.location.href = res.externalDestination;
            return;
          }

          let targetUrl = redirectUrl || `/${locale}/service/dashboard`;
          if (externalServiceId) {
            const errorCode = res.serviceRedirectError || 'service-unavailable';
            targetUrl = `/${locale}/service/dashboard?serviceRedirectError=${encodeURIComponent(errorCode)}`;
          } else {
            const cleanUpic = (res.citizen?.upicId || upicId || '').trim().toUpperCase();
            if (cleanUpic) {
              if (targetUrl.includes('upicNo=')) {
                targetUrl = targetUrl.replace(/upicNo=[^&]*/, `upicNo=${encodeURIComponent(cleanUpic)}`);
              } else {
                const sep = targetUrl.includes('?') ? '&' : '?';
                targetUrl = `${targetUrl}${sep}upicNo=${encodeURIComponent(cleanUpic)}`;
              }
            }
          }
          window.location.href = targetUrl;
        } else {
          setError(res.error || t('messages.verifyFailed'));
        }
      } catch (err: any) {
        console.error('Error verifying OTP:', err);
        setError(err?.message || 'Failed to verify OTP.');
      }
    });
  };

  const handleResendOtp = async () => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        const res = await sendCitizenOtpAction(
          method,
          {
            mobile: resolvedMobile || mobile,
            upicId,
            propertyNo:
              method === 'property' ? buildPropertySearchValue(sectorId, propertyNo) : undefined,
          },
          externalServiceId ?? undefined,
          selectedOwnerId || undefined
        );

        if (res.success) {
          setInfo(t('messages.otpResent'));
        } else {
          setError(res.error || t('messages.sendOtpFailed'));
        }
      } catch (err: any) {
        console.error('Error resending OTP:', err);
        setError(err?.message || 'Failed to resend OTP.');
      }
    });
  };

  const handleChangeNumber = () => {
    if (propertiesList.length > 1) {
      setStep('properties');
    } else {
      setStep('phone');
    }
    setOtp('');
    setError(null);
    setInfo(null);
  };

  const selectedProperty = propertiesList.find((p) => p.ownerId === selectedOwnerId);

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-100 to-blue-100 px-4 py-10 overflow-auto">
      <Button
        type="button"
        onClick={() => router.push(`/${locale}/service`)}
        variant="secondary"
        size="sm"
        icon={ArrowLeft}
        className="absolute top-4 left-4 sm:top-5 sm:left-6 z-50 rounded-xl bg-white/90 px-3.5 font-bold text-slate-700 shadow-md backdrop-blur hover:bg-slate-50"
      >
        {locale === 'mr' ? 'मागे' : locale === 'hi' ? 'पीछे' : 'Back'}
      </Button>

      <div className="w-full max-w-md my-auto">
        <Card className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
          <CardHeader className="flex flex-col items-center space-y-1 pb-2 pt-8 text-center">
            <div className="relative mb-6 drop-shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="relative flex h-28 w-24 items-center justify-center">
                {logoSrc ? (
                  <LoginFormCouncilLogo key={logoSrc} logoSrc={logoSrc} title={title} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50/80 text-cyan-600" aria-hidden>
                    <Landmark className="h-14 w-14 opacity-90" strokeWidth={1.25} />
                  </div>
                )}
              </div>
            </div>

            {title ? <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">{title}</h1> : null}
            {subTitle ? <p className="text-lg font-medium text-gray-600">{subTitle}</p> : null}

            <div className="flex w-full items-center justify-center gap-2 py-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>

            <div className="pt-1 text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              {step === 'phone'
                ? t('phone.welcome')
                : step === 'properties'
                ? (locale === 'mr' ? 'मालमत्ता निवडा' : locale === 'hi' ? 'संपत्ति चुनें' : 'Select Property')
                : t('otp.enterOtp')}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8 pb-10 pt-4">
            {error && (
              <div className="w-full">
                <ValidationMessage type="error" message={error} visible className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium [&_svg]:shrink-0" />
              </div>
            )}
            {info && (
              <div className="w-full">
                <ValidationMessage type="info" message={info} visible className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium !border-emerald-200 !bg-emerald-50 !text-emerald-800" />
              </div>
            )}

            {step === 'phone' && (
              <div className="space-y-5">
                <div className="flex items-end justify-center gap-2 border-b border-gray-200 pb-0.5">
                  {(['upic', 'property', 'mobile'] as LoginMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMethodChange(m)}
                      className={`relative px-4 py-2 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${method === m ? 'bg-cyan-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t(`phone.tab${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                      {method === m && <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-600" />}
                    </button>
                  ))}
                </div>

                <div className="bg-cyan-500/10 text-cyan-700 border-l-4 border-cyan-500 text-center font-medium rounded-r-md py-2.5 px-3 text-sm">
                  {t(`phone.helper${method.charAt(0).toUpperCase() + method.slice(1)}`)}
                </div>

                <form onSubmit={handleSearchAndSendOtp} className="space-y-4">
                  {method === 'upic' && (
                    <Input label={t('phone.upicLabel')} placeholder={t('phone.upicPh')} value={upicId} onChange={(e) => setUpicId(e.target.value.toUpperCase())} fullWidth />
                  )}

                  {method === 'property' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="mb-1.5 text-sm font-medium text-gray-700">{t('phone.node') || 'Node'}</label>
                          <select value={nodeId} onChange={(e) => setNodeId(e.target.value)} disabled={loadingNodes} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]">
                            <option value="">{loadingNodes ? 'Loading...' : 'Select Node'}</option>
                            {nodes.map((n) => <option key={n.value} value={n.value}>{n.items}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1.5 text-sm font-medium text-gray-700">{t('phone.sector') || 'Sector'}</label>
                          <select value={sectorId} onChange={(e) => setSectorId(e.target.value)} disabled={!nodeId || loadingSectors} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]">
                            <option value="">{!nodeId ? 'Select Node first' : loadingSectors ? 'Loading...' : 'Select Sector'}</option>
                            {sectors.map((s) => <option key={s.value} value={s.value}>{s.items}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="relative">
                        <Input label={t('phone.property')} placeholder={t('phone.propertyPh')} value={propertyNo} onChange={(e) => handlePropertyNoChange(e.target.value)} onFocus={() => propertyNo.trim() && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} fullWidth />
                        {showSuggestions && propertySuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[150] divide-y divide-gray-100">
                            {propertySuggestions.map((suggestion) => (
                              <button key={suggestion} type="button" onClick={() => { setPropertyNo(suggestion); setShowSuggestions(false); }} className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors font-semibold cursor-pointer">{suggestion}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {method === 'mobile' && (
                    <Input label={t('phone.mobileLabel')} placeholder={t('phone.mobilePh')} type="text" inputMode="numeric" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} fullWidth />
                  )}

                  <Button type="submit" className="w-full h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-base rounded-md transition-colors font-semibold cursor-pointer" isLoading={isPending}>
                    {locale === 'mr' ? 'मालमत्ता शोधा व OTP मिळवा' : locale === 'hi' ? 'संपत्ति खोजें और OTP प्राप्त करें' : 'Find Properties & Send OTP'}
                  </Button>
                </form>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-500 font-medium">{t('phone.orContinue')}</p>
                    <a href={`/${locale}/login`} className="block w-full h-11 leading-[2.75rem] border-2 border-cyan-600 hover:border-cyan-700 hover:bg-cyan-500/5 text-cyan-600 rounded-md text-center font-semibold transition-all cursor-pointer">
                      {t('phone.admin')}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {step === 'properties' && (
              <div className="space-y-4">
                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-md py-2 px-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-bold text-cyan-900">{locale === 'mr' ? 'नोंदणीकृत मालमत्ता' : 'Registered Properties'}</p>
                    <span className="bg-cyan-600 text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full">{propertiesList.length} {locale === 'mr' ? 'आढळल्या' : 'Found'}</span>
                  </div>
                  <p className="text-[11px] text-cyan-800 mt-1 font-medium">{locale === 'mr' ? 'कृपया ज्या मालमत्तेसाठी लॉगिन करायचे आहे ती निवडा:' : 'Please select the property to log in with:'}</p>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 -mr-1">
                  {propertiesList.map((prop) => {
                    const isSelected = selectedOwnerId === prop.ownerId;
                    return (
                      <div key={prop.ownerId} onClick={() => setSelectedOwnerId(prop.ownerId)} className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500 shadow-md' : 'border-gray-200 bg-white hover:border-cyan-300 hover:shadow-sm'}`}>
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{prop.ownerNameMarathi || 'नागरिक'}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600 font-semibold">
                            <span>UPIC: <strong className="text-gray-900">{prop.upicNo}</strong></span>
                            {prop.propertyNo && <span>क्र.: <strong className="text-gray-900">{prop.propertyNo}</strong></span>}
                          </div>
                          {prop.propertyDescription && <p className="text-[11px] text-gray-500 truncate">{prop.propertyDescription}</p>}
                        </div>
                        <div className="pt-0.5 shrink-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2 pt-2">
                  <Button type="button" onClick={handleProceedWithSelectedProperty} className="w-full h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-base rounded-md transition-colors font-semibold cursor-pointer" isLoading={isPending}>
                    {locale === 'mr' ? 'या मालमत्तेसाठी OTP पाठवा' : locale === 'hi' ? 'इस संपत्ति के लिए OTP भेजें' : 'Send OTP for Selected Property'}
                  </Button>
                  <button type="button" onClick={() => setStep('phone')} disabled={isPending} className="w-full text-center text-xs sm:text-sm font-semibold text-gray-600 hover:text-cyan-700 hover:underline pt-1 cursor-pointer">
                    ← {locale === 'mr' ? 'मोबाईल / तपशील बदला' : 'Change Number / Details'}
                  </button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-md py-2.5 px-3 text-center mb-3">
                  <p className="text-cyan-800 text-sm font-medium">
                    {t('otp.enterSent')}{' '}
                    <span className="font-mono font-semibold text-cyan-600">{maskedPhone}</span>
                  </p>
                  {selectedProperty && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-cyan-200 text-xs font-bold text-cyan-900 shadow-xs">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{selectedProperty.upicNo} ({selectedProperty.ownerNameMarathi})</span>
                    </div>
                  )}
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input label={t('otp.enterOtp')} placeholder={t('otp.otpPh')} type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="text-center tracking-[0.35em] font-mono text-lg" fullWidth required />
                  <Button type="submit" className="w-full h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg text-base rounded-md transition-colors font-semibold cursor-pointer" isLoading={isPending}>
                    {t('otp.verify')}
                  </Button>
                </form>
                <div className="flex items-center justify-between gap-3 text-sm pt-2">
                  <button type="button" onClick={handleResendOtp} disabled={isPending} className="text-cyan-600 hover:text-cyan-700 hover:underline disabled:opacity-50 transition-all font-semibold cursor-pointer">{t('otp.resend')}</button>
                  <button type="button" onClick={handleChangeNumber} disabled={isPending} className="text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-50 transition-all font-semibold cursor-pointer">{t('otp.change')}</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
