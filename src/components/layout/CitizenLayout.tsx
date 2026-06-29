import React from 'react';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

import { CitizenHeader } from './CitizenHeader';
import { CitizenFooter } from './CitizenFooter';
import { getMockCitizenProfile } from '@/lib/mock/rts-citizen.mock';

interface CitizenLayoutProps {
  children: React.ReactNode;
}

export async function CitizenLayout({ children }: CitizenLayoutProps) {
  const cookieStore = await cookies();
  const locale = await getLocale();
  const sessionCookie = cookieStore.get('rts_session')?.value || '';
  
  // Extract mobile number from the cookie: local_mobile_timestamp
  const mobile = sessionCookie.split('_')[1] || '';
  const profile = getMockCitizenProfile(mobile);

  const { ulbData } = await fetchLoginBrandingAction();
  const isLoggedIn = !!sessionCookie;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 font-sans">
      <CitizenHeader profile={profile} locale={locale} ulbData={ulbData} />
      {/* pt accounts for fixed header: h-16 mobile, h-20 sm+ */}
      <main className="flex-1 overflow-x-hidden w-full pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 pb-4">
        {children}
        <CitizenFooter ulbData={ulbData} isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );

}
