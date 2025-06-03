'use client';

import React from 'react';
import type {Metadata} from 'next';
import { Coiny, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });
const coiny = Coiny({ weight: '400', subsets: ['latin'], variable: '--font-coiny' });

// Removed metadata export as it's not allowed in Client Components
// export const metadata: Metadata = {
//   title: 'Yoinked!',
//   description: 'Your all-in-one email marketing platform',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSpecialLayoutPage = pathname.startsWith('/auth') || pathname === '/pricing';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <html lang="en" className={cn(coiny.variable, plusJakartaSans.className)}>
      <body className={cn("font-plus-jakarta antialiased min-h-screen flex bg-app-background")}>
        {isSpecialLayoutPage ? (
          children
        ) : (
          <div className="flex w-full">
            <Sidebar 
              isMobileOpen={isMobileOpen}
              onMobileClose={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col lg:ml-64">
              <TopNavbar onMenuClick={() => setIsMobileOpen(true)} />
              <main className="flex-grow overflow-y-auto pt-16">
                {children}
              </main>
            </div>
          </div>
        )}
        <Toaster />
      </body>
    </html>
  );
}