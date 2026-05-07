'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { User, Shield, Building, Globe, Hash, Clock, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/common/Badge';
import { Label } from '@/components/common/label';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Session data structure for user profile display
 * Populated from localStorage and cookies on mount
 */
interface SessionData {
    userId: string | null;
    email: string | null;
    role: string | null;
    sessionId: string | null;
    loginTime: string | null;
    ipAddress: string | null;
}

/**
 * Reads session data from localStorage (client-side only)
 * Returns null for server-side rendering
 */
function getSessionData(): SessionData {
    if (typeof window === 'undefined') {
        return {
            userId: null,
            email: null,
            role: null,
            sessionId: null,
            loginTime: null,
            ipAddress: null,
        };
    }

    return {
        userId: localStorage.getItem('ntis_user_id'),
        email: localStorage.getItem('ntis_user_email'),
        role: localStorage.getItem('ntis_user_role'),
        sessionId: localStorage.getItem('ntis_session_id'),
        loginTime: localStorage.getItem('ntis_session_start'),
        ipAddress: localStorage.getItem('ntis_user_ip'),
    };
}

/**
 * Formats login time for display
 */
function formatLoginTime(timestamp: string | null, locale: string): string {
    if (!timestamp) return '-';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return timestamp;
        return date.toLocaleString(locale === 'en' ? 'en-IN' : locale, {
            dateStyle: 'short',
            timeStyle: 'medium',
        });
    } catch {
        return timestamp;
    }
}

interface UserProfilePopupProps {
    isOpen: boolean;
    onClose: () => void;
    username?: string;
    ulbName?: string;
}

export const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ isOpen, onClose, username, ulbName }) => {
    const t = useTranslations('common');
    const locale = useLocale();
    const [sessionData, setSessionData] = useState<SessionData>({
        userId: null,
        email: null,
        role: null,
        sessionId: null,
        loginTime: null,
        ipAddress: null,
    });

    // Load session data on mount (client-side only)
    useEffect(() => {
        setSessionData(getSessionData());
    }, []);

    // Format values with fallbacks
    const displayValues = useMemo(() => ({
        userId: sessionData.userId || t('userMenu.notAvailable', { default: 'N/A' }),
        email: sessionData.email || t('userMenu.notAvailable', { default: 'N/A' }),
        role: sessionData.role || t('userMenu.defaultRole', { default: 'User' }),
        sessionId: sessionData.sessionId 
            ? `${sessionData.sessionId.slice(0, 8)}...` 
            : t('userMenu.notAvailable', { default: 'N/A' }),
        loginTime: formatLoginTime(sessionData.loginTime, locale),
        ipAddress: sessionData.ipAddress || t('userMenu.notAvailable', { default: 'N/A' }),
    }), [sessionData, locale, t]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={cn(
            "absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50",
            "profile-dropdown-container animate-in fade-in zoom-in-95 duration-200"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{username || t('userMenu.defaultUser', { default: 'User' })}</h3>
                        <p className="text-xs text-gray-500">{displayValues.email}</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    title={t('buttons.close')}
                    aria-label={t('buttons.close')}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{t('userMenu.userId')}</Label>
                        <p className="text-sm font-medium text-gray-900">{displayValues.userId}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('userMenu.role')}</Label>
                        <Badge variant="default" size="sm" className="bg-blue-50 text-blue-700 border-blue-100">
                            {displayValues.role}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                        <Label className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{t('userMenu.department')}</Label>
                        <p className="text-sm font-medium text-gray-900">{ulbName || t('userMenu.notAvailable', { default: 'N/A' })}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.publicIp')}</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{displayValues.ipAddress}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.sessionId')}</p>
                        <p className="text-sm font-medium text-gray-900 font-mono truncate w-48">{displayValues.sessionId}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{t('userMenu.loginTime')}</p>
                        <p className="text-sm font-medium text-gray-900">{displayValues.loginTime}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-blue-50/50 rounded-b-lg border-t border-blue-100">
                <div className="flex gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>{t('app.securityPurpose')}</p>
                </div>
            </div>
        </div>
    );
};

