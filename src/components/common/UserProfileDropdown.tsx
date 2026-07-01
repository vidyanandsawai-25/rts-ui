'use client';

import { useState, useRef, useEffect } from 'react';
import { User, ClipboardList, LogOut, ChevronDown, Landmark, Hash, Phone } from 'lucide-react';
import { type CitizenProfile } from '@/lib/mock/rts-citizen.mock';

interface UserProfileDropdownProps {
  profile: CitizenProfile;
  activeLocale: string;
  onLogout: () => void;
  onOpenApplications: () => void;
  hasMultipleProperties?: boolean;
  onOpenProperties?: () => void;
}

export function UserProfileDropdown({
  profile,
  activeLocale,
  onLogout,
  onOpenApplications,
  hasMultipleProperties = false,
  onOpenProperties,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const labels = {
    en: {
      profile: 'Citizen Profile',
      myApplications: 'My Applications',
      logout: 'Logout',
      upicId: 'UPIC ID',
      propertyNo: 'Property No',
      mobileNo: 'Mobile No',
      switchProperty: 'Switch Property',
    },
    mr: {
      profile: 'नागरिक तपशील',
      myApplications: 'माझे अर्ज',
      logout: 'लॉगआउट',
      upicId: 'UPIC आयडी',
      propertyNo: 'मालमत्ता क्रमांक',
      mobileNo: 'मोबाईल क्रमांक',
      switchProperty: 'मालमत्ता बदला',
    },
    hi: {
      profile: 'नागरिक विवरण',
      myApplications: 'मेरे आवेदन',
      logout: 'लॉगआउट',
      upicId: 'UPIC आईडी',
      propertyNo: 'संपत्ति संख्या',
      mobileNo: 'मोबाइल नंबर',
      switchProperty: 'संपत्ति बदलें',
    },
  }[activeLocale as 'en' | 'mr' | 'hi'] || {
    profile: 'Citizen Profile',
    myApplications: 'My Applications',
    logout: 'Logout',
    upicId: 'UPIC ID',
    propertyNo: 'Property No',
    mobileNo: 'Mobile No',
    switchProperty: 'Switch Property',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white shadow-sm cursor-pointer"
        type="button"
      >
        {/* Circle Avatar with Initials (using first letter of Name or 'C') */}
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-extrabold shadow-inner ring-1 ring-white/35">
          <span className="text-[10px] sm:text-xs">
            {profile.name ? profile.name.trim().charAt(0) : 'C'}
          </span>
        </div>
        
        {/* User Info displayed on header */}
        <div className="hidden sm:flex flex-col items-start leading-tight text-left">
          <span className="text-[11px] font-extrabold text-yellow-300 tracking-wide truncate max-w-[120px]">
            {profile.name}
          </span>
          <span className="text-[9px] text-gray-200 font-medium">
            UPIC: {profile.upicId}
          </span>
        </div>

        <ChevronDown size={14} className={`text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-150 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Custom profile details card inside header */}
          <div className="px-4 py-3.5 bg-gradient-to-br from-slate-50 to-blue-50 border-b border-gray-100 rounded-t-2xl">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
              {labels.profile}
            </p>
            <div className="flex items-center gap-2 pb-2.5 border-b border-gray-200/60">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <User size={13} />
              </div>
              <span className="text-sm font-extrabold text-gray-800 truncate">{profile.name}</span>
            </div>
            
            {/* Citizen Details list */}
            <div className="pt-2.5 space-y-2 text-[11px] text-gray-600 font-semibold">
              <div className="flex items-center gap-2">
                <Hash size={12.5} className="text-gray-400 shrink-0" />
                <span>
                  {labels.upicId}: <strong className="text-gray-800">{profile.upicId}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark size={12.5} className="text-gray-400 shrink-0" />
                <span>
                  {labels.propertyNo}: <strong className="text-gray-800">{profile.propertyNo}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12.5} className="text-gray-400 shrink-0" />
                <span>
                  {labels.mobileNo}: <strong className="text-gray-800">+91 {profile.mobile}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenApplications();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors text-left font-bold cursor-pointer"
              type="button"
            >
              <ClipboardList size={16} className="text-gray-400 hover:text-blue-500 shrink-0" />
              <span>{labels.myApplications}</span>
            </button>

            {hasMultipleProperties && onOpenProperties && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProperties();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors text-left font-bold cursor-pointer"
                type="button"
              >
                <Landmark size={16} className="text-gray-400 hover:text-blue-500 shrink-0" />
                <span>{labels.switchProperty}</span>
              </button>
            )}

            <div className="h-px bg-gray-100 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-bold cursor-pointer"
              type="button"
            >
              <LogOut size={16} className="text-red-500 shrink-0" />
              <span>{labels.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
