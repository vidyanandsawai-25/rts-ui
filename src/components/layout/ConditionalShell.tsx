'use client';

import { usePathname } from 'next/navigation';

interface ConditionalShellProps {
  children: React.ReactNode;
  shell: React.ReactNode;
  initialIsAuthOrHome?: boolean;
}

export function ConditionalShell({ children, shell, initialIsAuthOrHome = false }: ConditionalShellProps) {
  const pathname = usePathname();
  
  // Use pathname if available (client side), fallback to initialIsAuthOrHome (server side)
  let isAuthOrHome = initialIsAuthOrHome;
  
  if (pathname) {
    isAuthOrHome = 
      pathname.endsWith('/login') || 
      pathname.includes('/login/') || 
      pathname.endsWith('/home') || 
      pathname.includes('/home/') ||
      pathname.endsWith('/en') ||
      pathname.endsWith('/hi') ||
      pathname.endsWith('/mr') ||
      pathname === '/';
  }

  if (isAuthOrHome) {
    return <>{children}</>;
  }

  return <>{shell}</>;
}
