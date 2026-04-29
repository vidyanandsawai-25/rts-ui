'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/common';

export interface SidebarFrameProps {
  closeMenuLabel: string;
  openMenuLabel?: string;
  children: ReactNode;
}

/**
 * Client-only frame: mobile drawer toggle, overlay, and synced --sidebar-width for main/footer.
 * Menu markup is rendered on the server and passed as children.
 */
export function SidebarFrame({ closeMenuLabel, openMenuLabel = 'Open menu', children }: SidebarFrameProps) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!collapsed) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
    return () => document.body.classList.remove('sidebar-expanded');
  }, [collapsed]);

  const toggleMobileNav = () => {
    setOpen(!open);
  };


  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={toggleMobileNav}
        aria-label={open ? closeMenuLabel : openMenuLabel}
        aria-expanded={open}
        aria-controls="mobile-sidebar"
        className="lg:hidden fixed top-4 left-4 z-[9999] bg-[#4b70a6] hover:bg-[#3d5a8a] backdrop-blur-xl p-3 rounded-xl border border-white/30 shadow-lg"
      >
        {open ? <X className="h-7 w-7 text-white" /> : <Menu className="h-7 w-7 text-white" />}
      </Button>

      {open && (
        <Button
          type="button"
          variant="ghost"
          aria-label={closeMenuLabel}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden border-0 p-0 cursor-pointer rounded-none h-full w-full"
          onClick={() => {
            setOpen(false);
            setCollapsed(true);
          }}
        />
      )}

      <aside
        id="mobile-sidebar"
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) setCollapsed(false);
        }}
        onMouseLeave={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) setCollapsed(true);
        }}
        className={`
          fixed top-20 left-0 bottom-0 z-50 bg-white shadow-xl flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out border-r border-gray-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64 sidebar-expanded-aside'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </aside>
    </>
  );
}

