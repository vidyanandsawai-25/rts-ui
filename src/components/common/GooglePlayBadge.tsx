'use client';



interface GooglePlayBadgeProps {
  className?: string;
  href?: string;
}

export function GooglePlayBadge({ className = '', href = '#' }: GooglePlayBadgeProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-800 shadow transition-colors cursor-pointer w-fit ${className}`}
    >
      <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a1.986 1.986 0 0 1-.503-1.39V3.204c0-.528.18-1.002.503-1.39zm11.29 9.08l2.973-2.973L3.61 1.814l11.29 9.08zm4.07 1.106l3.522-2.012a2.008 2.008 0 0 0 0-3.376L18.97 7.62l-2.973 2.973 2.973 2.973zm-4.07 1.106L3.61 22.186l14.263-8.106-2.973-2.973z" />
      </svg>
      <div className="text-left leading-tight shrink-0">
        <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">Get it on</span>
        <span className="text-[10px] font-extrabold text-white block -mt-0.5">Google Play</span>
      </div>
    </a>
  );
}
