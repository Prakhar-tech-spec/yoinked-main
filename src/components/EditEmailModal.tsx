'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Assuming shadcn/ui dialog
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: { id: number; subject: string; body: string } | null;
  onSave: (updatedEmail: { id: number; subject: string; body: string }) => void;
}

export const EditEmailModal: React.FC<EditEmailModalProps> = ({
  isOpen,
  onClose,
  emailData,
  onSave,
}) => {
  const [subject, setSubject] = useState(emailData?.subject || '');
  const [body, setBody] = useState(emailData?.body || '');

  // Update form fields when emailData changes (when a different email is selected for editing)
  useEffect(() => {
    if (emailData) {
      setSubject(emailData.subject);
      setBody(emailData.body);
    } else {
      setSubject('');
      setBody('');
    }
  }, [emailData]);

  const handleSave = () => {
    if (!emailData) return; // Should not happen if modal is open, but for safety
    onSave({ ...emailData, subject, body });
    onClose(); // Close modal after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[700px] p-2 sm:p-4 md:p-6 rounded-lg max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-subject">Subject Line</Label>
            <Input
              id="edit-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-body">Email Body</Label>
            <Textarea
              id="edit-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 