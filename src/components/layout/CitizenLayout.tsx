import React from 'react';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

import { CitizenHeader } from './CitizenHeader';
import { CitizenFooter } from './CitizenFooter';
import { validateRtsCitizenSession } from '@/lib/api/rts/rtscitizensession.service';

interface CitizenLayoutProps {
  children: React.ReactNode;
}

export async function CitizenLayout({ children }: CitizenLayoutProps) {
  const cookieStore = await cookies();
  const locale = await getLocale();
  const sessionCookie = cookieStore.get('rts_session')?.value || '';
  const isLoggedIn = !!sessionCookie;

  if (isLoggedIn) {
    const validation = await validateRtsCitizenSession(sessionCookie);
    if (!validation.success) {
      redirect(`/${locale}/service/login?error=session_expired`);
    }
  }
  
  // Extract mobile number from the cookie: local_mobile_timestamp
  const mobile = isLoggedIn ? (sessionCookie.split('_')[1] || '') : '';
  
  const profileCookie = cookieStore.get('rts_citizen_profile')?.value;
  let profile = undefined;
  if (profileCookie) {
    try {
      profile = JSON.parse(profileCookie);
    } catch {
      profile = isLoggedIn ? {
        name: 'धारक . .',
        upicId: 'AKLMC089194',
        propertyNo: 'B3-434',
        mobile: mobile,
        ownerId: 1,
      } : undefined;
    }
  } else if (isLoggedIn) {
    profile = {
      name: 'धारक . .',
      upicId: 'AKLMC089194',
      propertyNo: 'B3-434',
      mobile: mobile,
      ownerId: 1,
    };
  }

  const propertiesCookie = cookieStore.get('rts_citizen_properties')?.value;
  let properties = [];
  if (propertiesCookie) {
    try {
      properties = JSON.parse(propertiesCookie);
    } catch {
      properties = [];
    }
  }

  const { ulbData } = await fetchLoginBrandingAction();

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 font-sans">
      <CitizenHeader profile={profile} properties={properties} locale={locale} ulbData={ulbData} />
      {/* pt accounts for fixed header: h-16 mobile, h-20 sm+ */}
      <main className="flex-1 overflow-x-hidden w-full pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 pb-4">
        {children}
        <CitizenFooter ulbData={ulbData} isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );

}
