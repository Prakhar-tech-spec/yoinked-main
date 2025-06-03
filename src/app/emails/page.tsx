'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import table components
import { Edit, Trash2, Sparkles } from 'lucide-react'; // Import icons
import { EditEmailModal } from '@/components/EditEmailModal'; // Import the new modal component
import GenerateEmailModal from '@/components/GenerateEmailModal'; // Import the new generate email modal component
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function EmailsPage() {
  useRequireAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [savedEmails, setSavedEmails] = useState<Array<{ id: string; subject: string; body: string }>>([]); // State for saved emails
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control edit modal visibility
  const [emailToEdit, setEmailToEdit] = useState<{ id: string; subject: string; body: string } | null>(null); // State to hold the email being edited
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false); // State for the generate email modal
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    content: string;
    metadata: any;
  } | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [emailToDeleteId, setEmailToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (!error && data) setSavedEmails(data);
      setLoading(false);
    };
    fetchEmails();
  }, []);

  const handleSaveEmail = async () => {
    if (!subject || !body) return;
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    if (!user_id) return;
    const { data, error } = await supabase
      .from('emails')
      .insert([{ user_id, subject, body }])
      .select();
    if (!error && data && data.length > 0) {
      setSavedEmails([data[0], ...savedEmails]);
      setSubject('');
    setBody('');
      toast({ description: 'Saved!', duration: 2000 });
    } else {
      toast({ description: 'Error saving email!', duration: 2000 });
    }
  };

  const handleDeleteEmail = (emailId: string) => {
    setEmailToDeleteId(emailId);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteEmail = async () => {
    if (emailToDeleteId) {
      const { error } = await supabase.from('emails').delete().eq('id', emailToDeleteId);
      if (!error) {
        setSavedEmails(savedEmails.filter(email => email.id !== emailToDeleteId));
        toast({ description: 'Deleted!', duration: 2000 });
      } else {
        toast({ description: 'Error deleting email!', duration: 2000 });
      }
      setEmailToDeleteId(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  const handleEditEmail = (emailId: string) => {
    const email = savedEmails.find(email => email.id === emailId);
    if (email) {
      setEmailToEdit(email);
      setIsEditModalOpen(true); // Open the edit modal
    }
  };

  const handleUpdateEmail = async (updatedEmail: { id: string; subject: string; body: string }) => {
    const { error } = await supabase
      .from('emails')
      .update({ subject: updatedEmail.subject, body: updatedEmail.body })
      .eq('id', updatedEmail.id);
    if (!error) {
    setSavedEmails(savedEmails.map(email => 
      email.id === updatedEmail.id ? updatedEmail : email
    ));
      setEmailToEdit(null);
      setIsEditModalOpen(false);
      toast({ description: 'Updated!', duration: 2000 });
    } else {
      toast({ description: 'Error updating email!', duration: 2000 });
    }
  };

  const handleEmailGenerated = (email: { subject: string; content: string; metadata: any }) => {
    setGeneratedEmail(email);
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 p-2 sm:p-6 flex-1">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Emails</h1>{/* Changed title to Emails */}

      {/* Email Composition Section */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>New Email</span>
            <Sparkles 
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => {
                toast({ description: 'Beta Version Coming Soon!', duration: 2000 });
              }}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-semibold">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line"
            />
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <Label htmlFor="body" className="font-semibold">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              className="min-h-[200px]"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveEmail} className="bg-rich-green hover:bg-rich-green/90">
              Save Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Emails Section */}
      <div className="bg-[#fcfbfc] p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saved Emails</h2>
        {savedEmails.length === 0 ? (
          <p className="text-gray-500">No emails saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Subject</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Body</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Actions</TableHead>
                </tr>
              </thead>
              <TableBody className="bg-white divide-y divide-gray-200">
                {savedEmails.map(email => (
                  <TableRow key={email.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/4">{email.subject}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/2 truncate">{email.body.substring(0, 150)}...</TableCell>{/* Truncate body */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex space-x-2 w-1/4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmail(email.id)}
                        className="hover:bg-transparent active:bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmail(email.id)}
                        className="hover:bg-transparent active:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Email Modal */}
      <EditEmailModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEmailToEdit(null); // Also clear emailToEdit on close
        }}
        emailData={emailToEdit as any}
        onSave={handleUpdateEmail as any}
      />

      {/* Generate Email Modal */}
      <GenerateEmailModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onEmailGenerated={handleEmailGenerated}
      />

      {/* Generated Email Display */}
      {generatedEmail && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Generated Email</h3>
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Subject</h4>
            <p className="text-sm">{generatedEmail.subject}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Content</h4>
            <p className="text-sm whitespace-pre-wrap">{generatedEmail.content}</p>
          </div>
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setGeneratedEmail(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={open => { if (!open) setIsDeleteConfirmModalOpen(false); }}>
        <DialogContent className="w-[calc(100%-2rem)] mx-auto sm:max-w-[350px] p-4 md:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Email</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this email?</div>
          <DialogFooter>
            <Button type="button" variant="outline" className="hover:bg-black hover:text-white" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteEmail}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}