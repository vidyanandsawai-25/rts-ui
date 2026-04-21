'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Landmark } from 'lucide-react';

/** Same idea as `HeaderCouncilLogo`: `next/image`, error → Landmark fallback (login card has no letter fallback). */
export function LoginFormCouncilLogo({ logoSrc, title }: { logoSrc: string; title: string }) {
  const [logoHasError, setLogoHasError] = useState(false);
  if (logoHasError) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50/80 text-cyan-600"
        aria-hidden
      >
        <Landmark className="h-14 w-14 opacity-90" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <Image
      src={logoSrc}
      alt={title ? `${title} Logo` : 'Logo'}
      width={96}
      height={112}
      className="h-full w-full object-contain drop-shadow-md"
      onError={() => setLogoHasError(true)}
      unoptimized
    />
  );
}
