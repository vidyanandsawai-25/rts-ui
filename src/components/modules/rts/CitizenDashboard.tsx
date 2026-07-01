'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { getMockDepartments } from '@/lib/mock/rts-citizen.mock';
import ServiceGrid from './ServiceGrid';
import { Layers } from 'lucide-react';

export function CitizenDashboard() {
  const locale = useLocale();
  const departments = getMockDepartments();
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');

  const activeDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* Main content area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Departments list */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-4 h-fit border border-gray-150">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {locale === 'mr' ? 'विभाग' : locale === 'hi' ? 'विभाग' : 'Departments'}
          </h3>
          <div className="space-y-1.5">
            {departments.map((dept) => {
              const deptName = dept.name?.[locale as 'en'|'hi'|'mr'] || dept.name?.en || '';
              const isActive = dept.id === selectedDeptId;

              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#5B9AB7] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-slate-100 hover:text-gray-900'
                  }`}
                >
                  <span className="truncate pr-2">{deptName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-gray-500'
                    }`}
                  >
                    {dept.services.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Services list */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 border border-gray-150 flex flex-col">
          {activeDept ? (
            <>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {activeDept.name?.[locale as 'en'|'hi'|'mr'] || activeDept.name?.en}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {locale === 'mr'
                    ? 'कृपया अर्ज करण्यासाठी खालील सेवांपैकी एक निवडा'
                    : locale === 'hi'
                    ? 'कृपया आवेदन करने के लिए निम्नलिखित सेवाओं में से एक चुनें'
                    : 'Please select one of the following services to apply'}
                </p>
              </div>

              <div className="flex-1">
                <ServiceGrid departments={departments} deptId={selectedDeptId} lang={locale as any} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-gray-400 text-center">
              {locale === 'mr'
                ? 'कृपया डाव्या बाजूने एक विभाग निवडा'
                : locale === 'hi'
                ? 'कृपया बाईं ओर से एक विभाग चुनें'
                : 'Please select a department from the left side'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
