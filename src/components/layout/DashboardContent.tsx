'use client';

import React from 'react';
import { Search, Bell, Settings, ChevronDown, Calendar as CalendarIcon, Filter, MoreVertical, ChevronLeft, ChevronRight, PlusCircle, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { CreateCampaignModal } from '@/components/CreateCampaignModal';
import { addMonths, subMonths } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const DashboardContent = () => {
  const { toast } = useToast();
  // All values set to 0 to match the card's real-time data
  const campaignData = [
    { name: 'Jan', value: 0, percentage: 0 },
    { name: 'Feb', value: 0, percentage: 0 },
    { name: 'Mar', value: 0, percentage: 0 },
    { name: 'Apr', value: 0, percentage: 0 },
    { name: 'May', value: 0, percentage: 0 },
    { name: 'Jun', value: 0, percentage: 0 },
  ];

  // State for the create campaign modal
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Mock connected accounts - replace with actual data from your backend
  const connectedAccounts = [
    'james@example.com',
    'james.passaquindici@example.com',
  ];

  // Ref for the search input
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // State for the calendar month
  const [month, setMonth] = React.useState(new Date());

  // Handlers for calendar navigation
  const handlePreviousMonth = () => {
    setMonth(subMonths(month, 1));
  };

  const handleNextMonth = () => {
    setMonth(addMonths(month, 1));
  };

  // Keyboard shortcut to focus search
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command + K (Mac) or Control + K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault(); // Prevent default browser shortcut behavior
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add a helper to format the current date as 'D MMM, YYYY'
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };
  const today = new Date();

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar */}
      {/* REMOVED: Moved to TopNavbar component */}

      {/* Main Dashboard Area */}
      <div className="flex-1 p-6 bg-app-background">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-gray-600 mt-1">Welcome, Let's dive into your personalized setup guide.</p>
            </div>
            <button 
              onClick={() => {
                setIsCreateModalOpen(true);
                toast({ description: 'Ready to create a campaign!', duration: 2000 });
              }}
              className="px-4 py-2 text-white rounded-xl hover:bg-opacity-90 flex items-center justify-center shadow" 
              style={{ backgroundColor: '#214d4a' }}
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Create campaigns
            </button>
          </div>
        </div>

        {/* Create Campaign Modal */}
        <CreateCampaignModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          connectedAccounts={connectedAccounts}
        />

        {/* Performance Over Time Section */}
        <div className="mb-6 bg-[#fcfbfc] p-4 rounded-xl shadow-sm">
          <div className="mb-4 pb-4 border-b border-gray-200">
            {/* Heading */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Over Time</h3>
            {/* Date and Filters */}
            <div className="flex items-center space-x-4 flex-wrap">
              <p className="text-sm text-gray-500 font-medium">29 Sept, 2024</p>
              
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Delivered Card */}
            <div className="flex flex-col items-center border-r border-gray-200 px-4">
              <p className="text-sm text-gray-600">Delivered</p>
              <div className="flex items-baseline mt-1">
                <p className="text-3xl font-bold text-gray-800">0</p>
                <p className="text-sm text-green-600 ml-2">+0.00% ▲</p>
              </div>
            </div>
            {/* Opened Card */}
            <div className="flex flex-col items-center border-r border-gray-200 px-4">
              <p className="text-sm text-gray-600">Opened</p>
              <div className="flex items-baseline mt-1">
                <p className="text-3xl font-bold text-gray-800">0</p>
                <p className="text-sm text-red-500 ml-2">0.00% ▼</p>
              </div>
            </div>
            {/* Clicked Card */}
            <div className="flex flex-col items-center border-r border-gray-200 px-4">
              <p className="text-sm text-gray-600">Clicked</p>
              <div className="flex items-baseline mt-1">
                <p className="text-3xl font-bold text-gray-800">0</p>
                <p className="text-sm text-green-600 ml-2">+0.00% ▲</p>
              </div>
            </div>
            {/* Subscribe Card */}
            <div className="flex flex-col items-center pl-4">
              <p className="text-sm text-gray-600">Subscribe</p>
              <div className="flex items-baseline mt-1">
                <p className="text-3xl font-bold text-gray-800">0</p>
                <p className="text-sm text-green-600 ml-2">+0.00% ▲</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard sections go here */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Campaign Performance Section (2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-[#fcfbfc] p-4 rounded-xl shadow-sm flex flex-col h-[600px]">
            <div className="mb-4 pb-4 border-b border-gray-200">
              {/* Heading */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Campaign Performance</h3>
              {/* Date and Icon */}
              <div className="flex items-center space-x-2 flex-wrap">
                <p className="text-sm text-gray-500">{formatDate(today)}</p>
                <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
              </div>
            </div>
            {/* Chart and Metrics */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center mb-4">
                <h4 className="text-4xl font-bold text-gray-800">₹0.00</h4>
                <div className="flex items-center ml-4 text-base text-green-600 font-semibold">
                  <ChevronUp className="w-5 h-5 mr-1" />
                  <div className="flex flex-col md:flex-row items-baseline md:items-center space-y-0 md:space-y-0 space-x-0 md:space-x-1">
                    <span>0%</span>
                    <span className="text-sm text-gray-500 font-normal">vs last month</span>
                  </div>
                </div>
              </div>
              {/* Placeholder for average line/indicator - Refined styling */}
              {/* Bar Chart */}
              <div className="flex-1 w-full h-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData}>
                    <CartesianGrid vertical={false} stroke="none" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} hide={true} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={80} radius={[12, 12, 12, 12]}>
                      {/* Apply colors based on month */}
                      {
                        campaignData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Mar' ? '#F28C6A' : '#d1d5db'} />
                        ))
                      }
                      {/* Add labels for percentages */}
                      <LabelList dataKey="percentage" position="top" dy={-10} formatter={(value: number) => `${value}%`} style={{ fontSize: '14px', fill: '#1f4d4c', fontWeight: 'bold' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Schedule Campaign Section (1/3 width on large screens) */}
          <div className="lg:col-span-1 bg-[#fcfbfc] p-4 rounded-xl shadow-sm h-[600px] flex flex-col">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Schedule Campaign</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <ChevronLeft className="w-4 h-4 text-gray-500 cursor-pointer" onClick={handlePreviousMonth} />
                  <ChevronRight className="w-4 h-4 text-gray-500 cursor-pointer" onClick={handleNextMonth} />
                </div>
                <MoreVertical className="w-5 h-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
              </div>
            </div>
            {/* Calendar and Events */}
            <div className="flex flex-col flex-1">
              {/* Calendar */}
              <div className="mb-6 w-full flex justify-center">
                <DayPicker mode="single" month={month} onMonthChange={setMonth} className="react-day-picker-custom w-full" />
              </div>

              {/* Events List */}
              <div className="flex-1 space-y-2 flex items-center justify-center text-gray-400 text-base">
                No scheduled campaigns.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 