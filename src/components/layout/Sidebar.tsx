"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PlusCircle, 
  Zap, 
  Mail, 
  Bot, 
  Puzzle, 
  ChevronDown,
  Menu, 
  X,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (sidebarRef.current && isMobileOpen) {
        sidebarRef.current.style.height = `${window.innerHeight}px`;
      } else if (sidebarRef.current && !isMobileOpen && window.innerWidth >= 1024) {
         // On larger screens where the sidebar is always visible, reset height or let CSS handle it
         sidebarRef.current.style.height = ''; // Or set to '100%' if needed, but Tailwind h-screen/h-full should work here.
      }
       // For desktop (lg) where sidebar is always open, ensure h-screen is applied via CSS classes
      if (sidebarRef.current && window.innerWidth >= 1024) {
          sidebarRef.current.style.height = ''; // Let CSS handle this
      }
    };

    // Initial height update
    updateHeight();

    // Update height on window resize
    window.addEventListener('resize', updateHeight);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMobileOpen]); // Rerun effect if mobile open state changes

  const isActive = (path: string) => {
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside ref={sidebarRef} className={cn(
        "flex-shrink-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-gray-200 fixed h-screen transition-transform duration-300 ease-in-out z-50",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:h-full"
      )}>
      {/* Logo */}
        <div className="text-3xl pb-4 font-coiny text-rich-green">Yoinked!</div>

        {/* Close Button for Mobile */}
        <div className="absolute top-4 right-4 lg:hidden">
           <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="active:bg-transparent"
          >
            <X className="h-6 w-6 text-gray-600" />
          </Button>
        </div>

        {/* Static Upgrade Plan Button */}
        <div className="pt-2 pb-4 border-b border-sidebar-border mt-8 lg:mt-0 flex justify-center">
          <Link href="/pricing" passHref>
            <Button
              className="w-full bg-[#214d4a] text-white rounded-xl hover:bg-opacity-90 font-semibold shadow"
              style={{ backgroundColor: '#214d4a' }}
              onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
            >
              Upgrade Plan
            </Button>
          </Link>
        </div>

        {/* Navigation - Reverting to original links and styling */}        
        <nav className="flex-1 space-y-2 pt-4 overflow-y-auto">
          {/* Overview */}
          <Link 
            href="/" 
            prefetch={false}
            onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
            className={cn(
              "flex items-center px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group",
              "text-gray-600",
              isActive('/') && "text-rich-green bg-booger-buster hover:bg-booger-buster"
            )}
          >
            <Home className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isActive('/') ? "text-rich-green" : "text-gray-600 group-hover:text-rich-green"
            )} /> 
            <span className="font-light">Overview</span>
          </Link>

          {/* Campaign */}
          <Link 
            href="/campaign" 
            prefetch={false}
             onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
            className={cn(
              "flex items-center px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group",
              "text-gray-600",
              isActive('/campaign') && "text-rich-green bg-booger-buster hover:bg-booger-buster"
            )}
          >
            <PlusCircle className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isActive('/campaign') ? "text-rich-green" : "text-gray-600 group-hover:text-rich-green"
            )} /> 
            <span className="font-light">Campaign</span>
          </Link>

         {/* Contacts */}
          <Link 
            href="/contacts" 
            prefetch={false}
             onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
            className={cn(
              "flex items-center px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group",
              "text-gray-600",
              isActive('/contacts') && "text-rich-green bg-booger-buster hover:bg-booger-buster"
            )}
          >
            <Users className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isActive('/contacts') ? "text-rich-green" : "text-gray-600 group-hover:text-rich-green"
            )} /> 
            <span className="font-light">Contacts</span>
          </Link>

         {/* Subscriptions */}
          <Link 
            href="/emails" 
            prefetch={false}
             onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
            className={cn(
              "flex items-center px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group",
              "text-gray-600",
              isActive('/emails') && "text-rich-green bg-booger-buster hover:bg-booger-buster"
            )}
          >
            <Mail className={cn(
              "w-5 h-5 mr-3 transition-colors duration-200",
              isActive('/emails') ? "text-rich-green" : "text-gray-600 group-hover:text-rich-green"
            )} /> 
            <span className="font-light">Emails</span>
          </Link>
      </nav>

      {/* User Profile */}
      <div className="pt-4 border-t border-sidebar-border mt-6">
        {user && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center text-gray-600 text-sm font-light">
              {user.email && user.email.length > 0 ? user.email[0].toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm font-light">{user.email ? user.email.split('@')[0] : 'User'}</p>
              <p className="text-xs text-muted-foreground font-extralight">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
 