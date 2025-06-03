'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts?: string[]; // Not used anymore
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = React.useState('');
  const [senderName, setSenderName] = React.useState('');
  const [senderEmail, setSenderEmail] = React.useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || '');
      setSenderEmail(data.user?.email || '');
    };
    if (isOpen) fetchUser();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) {
      console.error('No user ID found.');
      return;
    }
    const { error } = await supabase.from('campaigns').insert([
      {
        user_id,
        campaign_name: campaignName,
        sender_name: senderName,
        sender_email: senderEmail,
        subject_line: subjectLine,
        status: 'Draft',
        created_date: new Date().toISOString(),
        schedule_time: scheduleTime ? new Date(scheduleTime).toISOString() : null,
      },
    ]);
    if (error) {
      console.error('Failed to save campaign:', error.message);
    } else {
      console.log('Campaign saved!');
      toast({ description: 'Campaign Created', duration: 2000 });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] mx-auto sm:max-w-[425px] p-4 md:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Campaign</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new campaign with name, sender name, and sender email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName" className="font-semibold">Campaign Name</Label>
            <Input
              id="campaignName"
              name="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderName" className="font-semibold">Sender Name</Label>
            <Input
              id="senderName"
              name="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter sender name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderEmail" className="font-semibold">Sender Email</Label>
            <Select value={senderEmail} onValueChange={setSenderEmail} required>
              <SelectTrigger id="senderEmail" name="senderEmail">
                <SelectValue placeholder="Select sender email" />
              </SelectTrigger>
              <SelectContent>
                {userEmail && (
                  <SelectItem key={userEmail} value={userEmail}>
                    {userEmail}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectLine" className="font-semibold">Subject Line</Label>
            <Input
              id="subjectLine"
              name="subjectLine"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Enter subject line"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduleTime" className="font-semibold">Schedule Time</Label>
            <Input
              id="scheduleTime"
              name="scheduleTime"
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-black hover:text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-rich-green hover:bg-rich-green/90">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 