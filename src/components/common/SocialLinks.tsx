'use client';

import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

interface SocialLinksProps {
  className?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
}

export function SocialLinks({
  className = '',
  facebookUrl = '#',
  twitterUrl = '#',
  youtubeUrl = '#',
  instagramUrl = '#'
}: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={facebookUrl}
        className="p-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors text-slate-550 shadow-sm"
        aria-label="Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>
      <a
        href={twitterUrl}
        className="p-2 bg-slate-100 hover:bg-sky-100 hover:text-sky-500 rounded-lg transition-colors text-slate-550 shadow-sm"
        aria-label="Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>
      <a
        href={youtubeUrl}
        className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors text-slate-550 shadow-sm"
        aria-label="Youtube"
      >
        <Youtube className="w-3.5 h-3.5" />
      </a>
      <a
        href={instagramUrl}
        className="p-2 bg-slate-100 hover:bg-pink-100 hover:text-pink-600 rounded-lg transition-colors text-slate-550 shadow-sm"
        aria-label="Instagram"
      >
        <Instagram className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
