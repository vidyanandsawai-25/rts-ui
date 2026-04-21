import { Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/common';

import type { LoginFormProps } from '@/types/login.types';
import type { UlbMaster } from '@/types/master.types';

import { LoginFormCouncilLogo } from './LoginFormCouncilLogo';
import { LoginFormClient } from './LoginFormClient';

/**
 * Server Component shell: branding and copy are rendered on the server.
 * Interactive login (form, action state, motion) lives in `LoginFormClient`.
 */
export function LoginForm({ copy, ulbData, ...clientProps }: LoginFormProps) {
  const ulb = ulbData as (UlbMaster & { logoUrl?: string }) | undefined;
  const logoSrc = (ulb?.logoUrl || ulb?.ulbLogo || '').trim();
  const title = (ulbData?.ulbName ?? '').trim();
  const subTitle = (ulbData?.ulbNameLocal ?? '').trim();

  return (
    <div className="w-full max-w-md">
      <Card className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          ) : null}
          {subTitle ? (
            <h2 className="text-lg font-medium text-gray-600">{subTitle}</h2>
          ) : null}

          <div className="flex w-full items-center justify-center gap-2 py-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          <div className="pt-1 text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
            {copy.loginTitle}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10 pt-4">
          <LoginFormClient copy={copy} {...clientProps} />
        </CardContent>
      </Card>
    </div>
  );
}
