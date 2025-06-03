'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Send, Save, XCircle, Pencil } from 'lucide-react';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Mock Data
// const performanceData = [
//   { metric: 'Emails Sent', value: '10,000' },
//   { metric: 'Open Rate', value: '25%' },
//   { metric: 'Click Rate', value: '5%' },
//   { metric: 'Conversions', value: '500' },
// ];

// const recipientActivity = [
//   { email: 'john.doe@example.com', status: 'Opened', timestamp: '2023-10-27 10:00 AM' },
//   { email: 'jane.smith@example.com', status: 'Clicked', timestamp: '2023-10-27 10:15 AM' },
//   { email: 'peter.jones@example.com', status: 'Sent', timestamp: '2023-10-27 09:30 AM' },
//   // Add more mock data as needed
// ];

// const emailContent = `
// Subject: Your Latest Update
// 
// Hi [Recipient Name],
// 
// Here's your update...
// 
// Best,
// Yoinked Team
// `;

const CampaignPage = () => {
  useRequireAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = React.useState(false);
  const [campaignToDeleteId, setCampaignToDeleteId] = React.useState<string | null>(null);
  const [editingCampaignId, setEditingCampaignId] = React.useState<string | null>(null);
  const [editedCampaignName, setEditedCampaignName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = React.useState(false);
  const [editingEmailCampaign, setEditingEmailCampaign] = React.useState<any | null>(null);
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailBody, setEmailBody] = React.useState('');
  const [savingEmail, setSavingEmail] = React.useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = React.useState(false);
  const [sendCampaignId, setSendCampaignId] = React.useState<string | null>(null);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [emails, setEmails] = React.useState<any[]>([]);
  const [selectedContactIds, setSelectedContactIds] = React.useState<string[]>([]);
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(null);
  const [sendLoading, setSendLoading] = React.useState(false);
  const [openRates, setOpenRates] = React.useState<{ [campaignId: string]: number }>({});

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user_id)
        .order('created_date', { ascending: false });
      if (!error && data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  // Fetch open rates for all campaigns
  React.useEffect(() => {
    const fetchOpenRates = async () => {
      if (campaigns.length === 0) return;
      const { data: opensData } = await supabase
        .from('email_opens')
        .select('campaign_id, recipient')
        .in('campaign_id', campaigns.map(c => c.id));
      // Count unique opens per campaign
      const openMap: { [campaignId: string]: Set<string> } = {};
      (opensData || []).forEach(row => {
        if (!openMap[row.campaign_id]) openMap[row.campaign_id] = new Set();
        openMap[row.campaign_id].add(row.recipient);
      });
      // Calculate open rate: unique opens / total emails sent
      const rates: { [campaignId: string]: number } = {};
      campaigns.forEach(campaign => {
        const totalSent = campaign.total_sent || campaign.total_emails_sent || campaign.sent_count || campaign.sent || campaign.recipients?.length || campaign.contacts_count || 0;
        const uniqueOpens = openMap[campaign.id]?.size || 0;
        rates[campaign.id] = totalSent > 0 ? (uniqueOpens / totalSent) * 100 : 0;
      });
      setOpenRates(rates);
    };
    fetchOpenRates();
  }, [campaigns]);

  // Update summaryData based on fetched campaigns
  const numberOfCampaigns = campaigns.length;
  // Calculate overall open rate (across all campaigns)
  let totalSent = 0;
  let totalOpens = 0;
  campaigns.forEach(campaign => {
    const sent = campaign.total_sent || campaign.total_emails_sent || campaign.sent_count || campaign.sent || campaign.recipients?.length || campaign.contacts_count || 0;
    totalSent += sent;
    totalOpens += openRates[campaign.id] ? Math.round((openRates[campaign.id] / 100) * sent) : 0;
  });
  const overallOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) + '%' : '0%';
  const summaryData = [
    { title: 'Number of Campaigns', value: numberOfCampaigns.toString() },
    { title: 'Open Rate', value: overallOpenRate },
    { title: 'Bounce Rate', value: '0%' },
    { title: 'Reply Rate', value: '0%' },
  ];

  // Function to handle campaign deletion
  const handleDeleteCampaign = (campaignId: string) => {
    setCampaignToDeleteId(campaignId); // Store the ID of the campaign to delete
    setIsDeleteConfirmModalOpen(true); // Open the confirmation modal
  };

  // Function to confirm and perform deletion
  const confirmDelete = async () => {
    if (campaignToDeleteId !== null) {
      // Delete from Supabase
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignToDeleteId);
      if (!error) {
        setCampaigns(campaigns.filter(campaign => campaign.id !== campaignToDeleteId));
        toast({ description: 'Deleted!', duration: 2000 });
      } else {
        // Optionally, show an error message to the user
        alert('Failed to delete campaign.');
      }
      setCampaignToDeleteId(null); // Clear the ID after deletion
    }
    setIsDeleteConfirmModalOpen(false); // Close the modal
  };

  // Handle inline edit click for Campaign Name
  const handleEditClick = (campaign: typeof campaigns[0]) => {
    setEditingCampaignId(campaign.id);
    setEditedCampaignName(campaign.campaign_name);
  };

  // Handle save inline edit for Campaign Name
  const handleSaveClick = async (campaignId: string) => {
    // Update in Supabase
    const { error } = await supabase
      .from('campaigns')
      .update({ campaign_name: editedCampaignName })
      .eq('id', campaignId);
    if (!error) {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId ? { ...campaign, campaign_name: editedCampaignName } : campaign
    ));
    setEditingCampaignId(null);
    setEditedCampaignName('');
      toast({ description: 'Updated!', duration: 2000 });
    } else {
      alert('Failed to update campaign name.');
    }
  };

  // Handle cancel inline edit for Campaign Name
  const handleCancelClick = () => {
    setEditingCampaignId(null);
    setEditedCampaignName('');
  };

  // Helper to determine badge color based on status (basic example)
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'default'; // Or a specific green variant if available
      case 'Scheduled':
        return 'secondary'; // Or a specific blue/yellow variant
      case 'Sending':
        return 'secondary'; // Or an orange/blue variant
      case 'Paused':
        return 'destructive'; // Or a specific gray variant
      case 'Draft':
        return 'outline'; // Or a specific gray variant
      default:
        return 'default';
    }
  };

  // Handler to open modal with campaign data
  const handleEditEmailClick = (campaign: any) => {
    setEditingEmailCampaign(campaign);
    setEmailSubject(campaign.subject_line || '');
    setEmailBody(campaign.emails || '');
    setIsEditEmailModalOpen(true);
  };

  // Handler to save email subject/body to Supabase
  const handleSaveEmail = async () => {
    if (!editingEmailCampaign) return;
    setSavingEmail(true);
    const { error } = await supabase
      .from('campaigns')
      .update({ subject_line: emailSubject, emails: emailBody })
      .eq('id', editingEmailCampaign.id);
    if (!error) {
      setCampaigns(campaigns.map(c => c.id === editingEmailCampaign.id ? { ...c, subject_line: emailSubject, emails: emailBody } : c));
      setIsEditEmailModalOpen(false);
      setEditingEmailCampaign(null);
      toast({ description: 'Saved!', duration: 2000 });
    } else {
      alert('Failed to save email.');
    }
    setSavingEmail(false);
  };

  // Fetch contacts and emails when send modal opens
  React.useEffect(() => {
    if (isSendModalOpen) {
      (async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData.user?.id;
        if (!user_id) return;
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('id, email, name')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
        setContacts(contactsData || []);
        const { data: emailsData } = await supabase
          .from('emails')
          .select('id, subject, body')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
        setEmails(emailsData || []);
      })();
    }
  }, [isSendModalOpen]);

  const handleSendClick = (campaignId: string) => {
    setSendCampaignId(campaignId);
    setIsSendModalOpen(true);
    setSelectedContactIds([]);
    setSelectedEmailId(null);
  };

  const handleYoinkEmails = async () => {
    setSendLoading(true);
    try {
      // 1. Get user info
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) throw new Error('User not authenticated');

      // 2. Fetch sender email and app password from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('app_password, email')
        .eq('user_id', user_id)
        .single();
      const senderEmail = settings?.email || userData.user?.email;
      const appPassword = settings?.app_password;
      if (!senderEmail || !appPassword) {
        toast({ title: 'Missing Credentials', description: 'Please set your Gmail and App Password in Settings.', variant: 'destructive' });
        setSendLoading(false);
        return;
      }

      // 3. Get selected contacts' emails
      const selectedContacts = contacts.filter(c => selectedContactIds.includes(c.id));
      const selectedEmails = selectedContacts.map(c => c.email).filter(Boolean);
      if (selectedEmails.length === 0) {
        toast({ title: 'No Recipients', description: 'Please select at least one contact.', variant: 'destructive' });
        setSendLoading(false);
        return;
      }

      // 4. Get selected email's subject/body
      const emailObj = emails.find(e => e.id === selectedEmailId);
      if (!emailObj) {
        toast({ title: 'No Email Selected', description: 'Please select an email to send.', variant: 'destructive' });
        setSendLoading(false);
        return;
      }
      const subject = emailObj.subject;
      const text = emailObj.body;

      // 5. Send email via API, one by one with unique tracking pixel
      let allSuccess = true;
      for (const contact of selectedContacts) {
        const trackingUrl = `${window.location.origin}/api/track/open?campaignId=${sendCampaignId}&emailId=${selectedEmailId}&recipient=${encodeURIComponent(contact.email)}`;
        const htmlWithPixel = `<p>${text.replace(/\n/g, '<br>')}</p><img src=\"${trackingUrl}\" width=\"1\" height=\"1\" style=\"display:none;\" />`;
        const response = await fetch('/api/sendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: [contact.email],
            subject,
            text,
            senderEmail,
            appPassword,
            html: htmlWithPixel,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          allSuccess = false;
        }
      }
      if (allSuccess) {
        toast({ description: 'Emails sent!', duration: 2000 });
        setIsSendModalOpen(false);
      } else {
        toast({ title: 'Some emails failed', description: 'Some emails could not be sent.', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send emails.', variant: 'destructive' });
    }
    setSendLoading(false);
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 p-2 sm:p-6 flex-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Campaigns</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {loading
          ? Array(4).fill(0).map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-12 sm:w-16" />
                </CardContent>
              </Card>
            ))
          : summaryData.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{item.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Campaign List */}
      <div className="bg-[#fcfbfc] p-2 sm:p-4 md:p-6 rounded-xl shadow-sm">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-4">All Campaigns</h2>
        {loading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="flex space-x-2 sm:space-x-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-1/6" />
                <div className="h-6 bg-gray-200 rounded w-1/6" />
                <div className="h-6 bg-gray-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto sm:overflow-x-auto w-full">
            <div className="sm:block max-h-none w-full" style={{ maxHeight: 'none' }}>
              <div className="block sm:hidden" style={{ maxHeight: 'calc(8 * 48px)' /* 8 rows * approx row height */ , overflowY: 'auto' }}>
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell">Subject Line</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created Date</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Scheduled/Sent Time</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-400 py-8">
                          No campaigns to display.
                        </td>
                      </tr>
                    ) : campaigns.map((campaign, idx) => (
                      <tr key={campaign.id}>
                        {/* Campaign Name Cell with inline editing */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {editingCampaignId === campaign.id ? (
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Input 
                                value={editedCampaignName}
                                onChange={(e) => setEditedCampaignName(e.target.value)}
                                className="h-7 text-xs sm:text-sm"
                              />
                              <Button variant="ghost" size="sm" onClick={() => handleSaveClick(campaign.id)} className="hover:bg-transparent active:bg-transparent p-1">
                                <Save className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelClick} className="hover:bg-transparent active:bg-transparent p-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <span>{campaign.campaign_name}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(campaign)} className="hover:bg-transparent active:bg-transparent p-1">
                                <Edit className="w-4 h-4 text-gray-500" />
                              </Button>
                            </div>
                          )}
                        </td>
                        {/* Subject Line Cell */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden xs:table-cell">{campaign.subject_line}</td>
                        {/* Status Badge Cell */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                        </td>
                        {/* Created Date Cell */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{campaign.created_date ? new Date(campaign.created_date).toLocaleString() : ''}</td>
                        {/* Scheduled/Sent Time Cell */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{campaign.schedule_time ? new Date(campaign.schedule_time).toLocaleString() : '-'}</td>
                        {/* Actions Cell */}
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 flex space-x-1 sm:space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmailClick(campaign)}
                            className="hover:bg-transparent active:bg-transparent p-1"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="hover:bg-transparent active:bg-transparent p-1"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendClick(campaign.id)}
                            className="hover:bg-transparent active:bg-transparent p-1"
                          >
                            <Send className="w-4 h-4 text-blue-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm hidden sm:table">
                <thead>
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell">Subject Line</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created Date</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Scheduled/Sent Time</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-8">
                        No campaigns to display.
                      </td>
                    </tr>
                  ) : campaigns.map(campaign => (
                    <tr key={campaign.id}>
                      {/* Campaign Name Cell with inline editing */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {editingCampaignId === campaign.id ? (
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Input 
                              value={editedCampaignName}
                              onChange={(e) => setEditedCampaignName(e.target.value)}
                              className="h-7 text-xs sm:text-sm"
                            />
                            <Button variant="ghost" size="sm" onClick={() => handleSaveClick(campaign.id)} className="hover:bg-transparent active:bg-transparent p-1">
                              <Save className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelClick} className="hover:bg-transparent active:bg-transparent p-1">
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span>{campaign.campaign_name}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(campaign)} className="hover:bg-transparent active:bg-transparent p-1">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                      {/* Subject Line Cell */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden xs:table-cell">{campaign.subject_line}</td>
                      {/* Status Badge Cell */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                      </td>
                      {/* Created Date Cell */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{campaign.created_date ? new Date(campaign.created_date).toLocaleString() : ''}</td>
                      {/* Scheduled/Sent Time Cell */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{campaign.schedule_time ? new Date(campaign.schedule_time).toLocaleString() : '-'}</td>
                      {/* Actions Cell */}
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 flex space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmailClick(campaign)}
                          className="hover:bg-transparent active:bg-transparent p-1"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="hover:bg-transparent active:bg-transparent p-1"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendClick(campaign.id)}
                          className="hover:bg-transparent active:bg-transparent p-1"
                        >
                          <Send className="w-4 h-4 text-blue-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setCampaignToDeleteId(null); // Clear ID on modal close
        }}
        onConfirm={confirmDelete}
        itemName="this campaign" // Text to display in the modal
      />

      {/* Edit Email Modal */}
      <Dialog open={isEditEmailModalOpen} onOpenChange={open => { if (!open) setIsEditEmailModalOpen(false); }}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[700px] p-2 sm:p-4 md:p-6 rounded-lg max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Campaign Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailSubject" className="font-semibold">Subject</Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Enter subject line"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailBody" className="font-semibold">Emails</Label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="Write your email here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-rich-green hover:bg-rich-green/90" onClick={handleSaveEmail} disabled={savingEmail}>
              {savingEmail ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Emails Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={open => { if (!open) setIsSendModalOpen(false); }}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[700px] p-2 sm:p-4 md:p-6 rounded-lg max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Send Campaign Emails</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Select Contacts</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 mt-1">
                {contacts.length === 0 ? (
                  <div className="text-gray-500 text-sm">No contacts found.</div>
                ) : (
                  contacts.map(contact => (
                    <label key={contact.id} className="flex items-center space-x-2 text-sm py-1">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedContactIds([...selectedContactIds, contact.id]);
                          } else {
                            setSelectedContactIds(selectedContactIds.filter(id => id !== contact.id));
                          }
                        }}
                      />
                      <span>{contact.name || contact.email}</span>
                      <span className="text-gray-400 ml-2">{contact.email}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <Label className="font-semibold">Select Email to Send</Label>
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedEmailId || ''}
                onChange={e => setSelectedEmailId(e.target.value)}
              >
                <option value="" disabled>Select an email</option>
                {emails.map(email => (
                  <option key={email.id} value={email.id}>{email.subject}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-rich-green hover:bg-rich-green/90 text-white"
              onClick={handleYoinkEmails}
              disabled={sendLoading || selectedContactIds.length === 0 || !selectedEmailId}
            >
              {sendLoading ? 'Sending...' : 'Yoink Emails'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignPage; 