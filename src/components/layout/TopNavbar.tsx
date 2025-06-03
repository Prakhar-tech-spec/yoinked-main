'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bell, Settings, ChevronDown, Menu, PlusCircle } from 'lucide-react';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]); // State to hold notifications (mock data or empty)
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [settingsData, setSettingsData] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSettings = async () => {
    setSettingsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id || null;
    let userEmail = userData.user?.email || '';
    let appPassword = '';
    if (user_id) {
      const { data: settings } = await supabase
        .from('settings')
        .select('app_password, email')
        .eq('user_id', user_id)
        .single();
      if (settings) {
        appPassword = settings.app_password || '';
        userEmail = settings.email || userEmail;
      }
    }
    setSettingsData({ userEmail, appPassword, userId: user_id });
    setSettingsLoading(false);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-app-background flex items-center px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-64 z-10">
      {/* Left: Mobile Menu Button and Search */}
      {/* On small screens, show Menu button, then Search. On larger, Search can take more space */}
      <div className="flex items-center flex-grow space-x-2 sm:space-x-4">
        {/* Mobile Menu Button (visible only on small screens) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden active:bg-transparent"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </Button>
        {/* Search Bar - Visible on all screen sizes now */}        
        {/* Use flex-grow on larger screens to take available space */}        
        <div className="relative flex items-center w-full sm:w-auto lg:flex-grow max-w-xs sm:max-w-sm lg:max-w-md">
          <Search className="absolute left-3 inset-y-0 my-auto h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search"
            ref={searchInputRef}
            className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-booger-buster focus:border-booger-buster bg-[#fcfbfc] text-sm"
          />
          {/* Command+K shortcut hint - visible on medium and larger screens */}          
          <span className="absolute right-2 top-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden md:inline-block">⌘K</span>
        </div>
      </div>

      {/* Right: Icons and User Profile */}
      {/* Flex container for right-aligned items */}      
      <div className="flex items-center space-x-2 sm:space-x-4 ml-4 relative">
        {/* Bell Icon - Visible on all screen sizes */}        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-transparent"
          onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {/* Notification dot placeholder */}          
          
        </Button>
        {/* Settings Icon - Visible on all screen sizes */}        
        <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={handleOpenSettings}>
           <Settings className="w-5 h-5 text-gray-600" />
        </Button>
        {/* User Profile - Visible on all screen sizes, details hidden on extra small */}        
        <div 
          className="flex items-center space-x-2 border border-gray-300 rounded-full p-1 pr-3 cursor-pointer"
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        >
          {/* Avatar Placeholder */}          
          <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-light">
            {user?.email && user.email.length > 0 ? user.email[0].toUpperCase() : '?'}
          </div>
          {/* User Name and ID - Hidden on extra small screens */}          
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.email ? user.email.split('@')[0] : 'User'}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          {/* Dropdown Arrow - Visible on all screen sizes */}          
          <motion.div
            animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settingsData={settingsData}
      />

      {/* User Profile Dropdown */}
      <AnimatePresence>
        {isUserDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
          >
            <div className="flex flex-col p-2">
              <Button variant="ghost" className="justify-start w-full hover:bg-black hover:text-white" onClick={() => {
                toast({
                  description: "Feature coming soon — stay tuned!",
                  duration: 3000,
                });
                setIsUserDropdownOpen(false);
              }}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add account
              </Button>
              {/* Add other user-related menu items here if needed */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isNotificationDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-16 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20"
          >
            <div className="flex flex-col p-2">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div key={index} className="p-2 text-sm border-b last:border-b-0 border-gray-100">
                    {notif}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500 text-center">No Notifs</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 