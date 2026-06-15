'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useHeaderState } from '@/hooks/useHeaderState';

import { Settings, User, AlertCircle } from "lucide-react";

import { UserProfilePopup } from "./UserProfilePopup";
import { Button } from "@/components/common/ActionButton";
import type { UserProfileDisplayValues } from "@/types/home/user-profile.types";

interface NavbarProps {
    username?: string;
    ulbName?: string;
    userProfile?: UserProfileDisplayValues | null;
    profileError?: string;
    sessionId?: string;
    clientIp?: string;
}

export const Navbar = ({
    username,
    ulbName,
    userProfile,
    profileError,
    sessionId,
    clientIp,
}: NavbarProps) => {
    const t = useTranslations('common');
    const displayUlbName = ulbName || t('app.defaultUlbName');
    const locale = useLocale();
    const {
        handleLogout,
        showProfileDropdown,
        setShowProfileDropdown,
        isLoggingOut
    } = useHeaderState();

    const [warningActive, setWarningActive] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const isCritical = secondsLeft <= 20;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleTick = (e: Event) => {
            const customEvent = e as CustomEvent<{ secondsLeft: number; active: boolean }>;
            setWarningActive(customEvent.detail.active);
            setSecondsLeft(customEvent.detail.secondsLeft);
        };

        window.addEventListener('ntis:session-warning-tick', handleTick);
        return () => {
            window.removeEventListener('ntis:session-warning-tick', handleTick);
        };
    }, []);

    return (
        <div className="w-full">
            {/* Navigation Bar */}
            <nav className="bg-[#004c8c] text-white flex justify-end items-center px-6 py-1 shadow-md overflow-x-auto">
                <div className="flex items-center gap-6">
                    {/* Session Expiration Warning (Pulsing Highlight Pill) */}
                    {warningActive && secondsLeft > 0 && (
                        <div
                            className={`flex items-center gap-3 rounded-xl border px-4 py-1.5 text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md self-center shrink-0 transition-all duration-300 ${
                                isCritical
                                    ? 'border-red-500 bg-red-950/80 text-white shadow-red-500/30 critical-flash-active'
                                    : 'border-amber-500/70 bg-amber-950/60 text-amber-100 shadow-amber-500/20 warning-flash-active'
                            } session-warn-active`}
                            role="status"
                            aria-live="polite"
                        >
                            <style>{`
                                @keyframes session-pill-blink {
                                    0%, 100% {
                                        opacity: 1;
                                        transform: scale(1);
                                    }
                                    50% {
                                        opacity: 0.85;
                                        transform: scale(0.98);
                                    }
                                }
                                @keyframes critical-border-flash {
                                    0%, 100% {
                                        border-color: rgba(239, 68, 68, 1);
                                        box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
                                    }
                                    50% {
                                        border-color: rgba(239, 68, 68, 0.3);
                                        box-shadow: 0 0 5px rgba(239, 68, 68, 0.1);
                                    }
                                }
                                @keyframes warning-border-flash {
                                    0%, 100% {
                                        border-color: rgba(245, 158, 11, 0.9);
                                        box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
                                    }
                                    50% {
                                        border-color: rgba(245, 158, 11, 0.3);
                                        box-shadow: 0 0 4px rgba(245, 158, 11, 0.1);
                                    }
                                }
                                @keyframes timer-blink-smooth {
                                    0%, 100% { opacity: 1; }
                                    50% { opacity: 0.35; }
                                }
                                @keyframes timer-blink-sharp {
                                    0%, 100% { opacity: 1; }
                                    50% { opacity: 0.05; }
                                }
                                .session-warn-active {
                                    animation: session-pill-blink 1.2s ease-in-out infinite;
                                }
                                .critical-flash-active {
                                    animation: critical-border-flash 0.8s ease-in-out infinite;
                                }
                                .warning-flash-active {
                                    animation: warning-border-flash 1.5s ease-in-out infinite;
                                }
                                .timer-blink-smooth {
                                    animation: timer-blink-smooth 1.5s ease-in-out infinite;
                                }
                                .timer-blink-sharp {
                                    animation: timer-blink-sharp 0.8s steps(1) infinite;
                                }
                            `}</style>

                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                                <span
                                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                        isCritical ? 'animate-ping bg-red-400' : 'bg-amber-400 animate-pulse'
                                    }`}
                                />
                                <span
                                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                        isCritical ? 'bg-red-500' : 'bg-amber-500'
                                    }`}
                                />
                            </span>
                            <AlertCircle
                                className={`h-4 w-4 shrink-0 transition-transform ${
                                    isCritical ? 'text-red-400 animate-bounce timer-blink-sharp' : 'text-amber-400 timer-blink-smooth'
                                }`}
                                aria-hidden
                            />
                            <span
                                className={`font-mono text-xs sm:text-sm font-extrabold tracking-wide ${
                                    isCritical ? 'text-red-200 timer-blink-sharp' : 'text-amber-300 timer-blink-smooth'
                                }`}
                            >
                                {t('login.sessionTimeout.countdown', { seconds: secondsLeft })}
                            </span>
                            <span
                                className={`hidden lg:inline font-semibold ${
                                    isCritical ? 'text-red-100' : 'text-amber-200/90'
                                }`}
                            >
                                {t('login.sessionTimeout.saveWorkHint')}
                            </span>
                        </div>
                    )}

                    <Link
                        href={`/${locale}/configuration-settings/office-master`}
                        className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('navigation.settings')}</span>
                    </Link>

                    {/* User info */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 text-left focus:outline-none group border-l border-blue-400 pl-6"
                        >
                            <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-500/30 transition-colors">
                                <User className="w-5 h-5 text-blue-100" />
                            </div>
                            <div className="hidden sm:flex items-baseline gap-1">
                                <span className="text-xs text-blue-200">{t('app.welcome')}</span>
                                <span className="text-sm font-semibold text-white">{username || t('app.defaultUser')}</span>
                            </div>
                        </button>

                        <UserProfilePopup
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            username={username}
                            ulbName={ulbName}
                            userProfile={userProfile}
                            profileError={profileError}
                            sessionId={sessionId}
                            clientIp={clientIp}
                        />
                    </div>

                    {/* Logout button */}
                    <Button
                        onClick={handleLogout}
                        variant="danger"
                        size="xs"
                        disabled={isLoggingOut}
                        className="rounded-full px-4 shadow-md hover:shadow-lg hover:scale-105"
                    >
                        {isLoggingOut ? '...' : t('actions.logout')}
                    </Button>
                </div>
            </nav>

            {/* Animated Welcome Message with prefers-reduced-motion check */}
            <div className="bg-[#d1ecf1] text-[#004c8c] font-bold py-1 text-sm sm:text-base text-center overflow-hidden">
                <div className="inline-block animate-marquee whitespace-nowrap px-4">
                    {t('app.welcomeTo', { name: displayUlbName })} – {t('app.smartGovernance')}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    min-width: 100%;
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-marquee {
                        animation: none !important;
                        transform: none !important;
                    }
                }
            `}</style>
        </div>
    );
};
