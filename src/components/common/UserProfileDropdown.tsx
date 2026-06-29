'use client';

import { useState, useRef, useEffect } from 'react';
import { User, ClipboardList, LogOut, ChevronDown } from 'lucide-react';

interface UserProfileDropdownProps {
  mobile: string;
  activeLocale: string;
  onLogout: () => void;
  onOpenApplications: () => void;
}

export function UserProfileDropdown({
  mobile,
  activeLocale,
  onLogout,
  onOpenApplications,
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
      citizen: 'Citizen',
    },
    mr: {
      profile: 'नागरिक प्रोफाइल',
      myApplications: 'माझे अर्ज',
      logout: 'लॉगआउट',
      citizen: 'नागरिक',
    },
    hi: {
      profile: 'नागरिक प्रोफाइल',
      myApplications: 'मेरे आवेदन',
      logout: 'लॉगआउट',
      citizen: 'नागरिक',
    },
  }[activeLocale as 'en' | 'mr' | 'hi'] || {
    profile: 'Citizen Profile',
    myApplications: 'My Applications',
    logout: 'Logout',
    citizen: 'Citizen',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white shadow-sm cursor-pointer"
        type="button"
      >
        {/* Circle Avatar */}
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold shadow-inner">
          <span className="text-[10px] sm:text-xs">C</span>
        </div>
        
        {/* User Info */}
        <div className="hidden sm:flex flex-col items-start leading-none text-left">
          <span className="text-[11px] font-bold text-yellow-300">{labels.citizen}</span>
          <span className="text-[10px] text-gray-200 mt-0.5">+91 {mobile}</span>
        </div>

        <ChevronDown size={14} className={`text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-150 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
            <p className="text-xs text-gray-400 font-medium">{labels.profile}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={12} />
              </div>
              <span className="text-sm font-semibold text-gray-800">+91 {mobile}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenApplications();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left font-medium cursor-pointer"
              type="button"
            >
              <ClipboardList size={16} className="text-gray-400 hover:text-blue-500 shrink-0" />
              <span>{labels.myApplications}</span>
            </button>

            <div className="h-px bg-gray-100 my-1.5" />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium cursor-pointer"
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
