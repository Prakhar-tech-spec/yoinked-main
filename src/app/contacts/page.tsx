'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactsPage() {
  useRequireAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingContacts, setPendingContacts] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedName, setEditedName] = useState('');
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [contactToDeleteId, setContactToDeleteId] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchContacts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (!error && data) setContacts(data);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      setError(null);

      const reader = new FileReader();

      reader.onload = (e) => {
        (async () => {
        const text = e.target?.result as string;
        try {
            // Get current user id
            const { data: userData } = await supabase.auth.getUser();
            const user_id = userData.user?.id;
            if (!user_id) throw new Error('User not authenticated');

          // Basic CSV parsing: split by new line, then by comma
          const rows = text.split('\n').map(row => row.split(','));
            // Assuming the first row is the header
            const headers = rows[0];
            const data = rows.slice(1).map(row => row.map(cell => cell.trim()));
            // Assuming the first column is the email
            const emails = data.map(row => row[0]);
            // Assuming the second column is the name
            const names = data.map(row => row[1]);
            // Assuming the third column is the created_at timestamp
            const created_ats = data.map(row => row[2]);
            // Assuming the rest of the columns are additional data
            const additionalData = data.map(row => row.slice(3));
            // Create contact objects with user_id
            const contacts = emails.map((email, index) => ({
              email,
              name: names[index],
              created_at: created_ats[index],
              user_id,
              ...Object.fromEntries(headers.slice(3).map((header, i) => [header, additionalData[index][i]]))
            }));
            setPendingContacts(contacts);
            toast({ description: 'Ready to confirm contacts!', duration: 2000 });
        } catch (err) {
          setError('Error parsing CSV file.');
            toast({ description: 'Error!', duration: 2000 });
          console.error(err);
        }
        })();
      };

      reader.onerror = () => {
        setError('Error reading file.');
        toast({ description: 'Error!', duration: 2000 });
      };

      reader.readAsText(file);
    } else {
      setFileName(null);
      setContacts([]);
      setError(null);
      toast({ description: 'Removed!', duration: 2000 });
    }
  };

  // Handler to confirm and upload contacts to Supabase
  const handleConfirmContacts = async () => {
    if (pendingContacts.length === 0) return;
    const { error: supabaseError } = await supabase
      .from('contacts')
      .insert(pendingContacts);
    if (!supabaseError) {
      // Refetch contacts after upload
      const user_id = pendingContacts[0].user_id;
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (!error && data) setContacts(data);
      setPendingContacts([]);
      setFileName(null);
      toast({ description: 'Contacts uploaded successfully!', duration: 2000 });
    } else {
      setError('Error saving contacts to Supabase.');
      toast({ description: 'Error!', duration: 2000 });
      console.error(supabaseError);
    }
  };

  // Handle delete contact
  const handleDeleteContact = (contactId: string) => {
    setContactToDeleteId(contactId);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteContact = async () => {
    if (contactToDeleteId) {
      const { error } = await supabase.from('contacts').delete().eq('id', contactToDeleteId);
      if (!error) {
        setContacts(contacts.filter((c) => c.id !== contactToDeleteId));
        toast({ description: 'Deleted!', duration: 2000 });
      } else {
        setError('Failed to delete contact.');
        toast({ description: 'Error!', duration: 2000 });
      }
      setContactToDeleteId(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  // Handle start editing
  const handleEditContact = (contact: any) => {
    setEditingContactId(contact.id);
    setEditedEmail(contact.email);
    setEditedName(contact.name || '');
  };

  // Handle save edit
  const handleSaveEdit = async (contactId: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ email: editedEmail, name: editedName })
      .eq('id', contactId);
    if (!error) {
      setContacts(
        contacts.map((c) =>
          c.id === contactId ? { ...c, email: editedEmail, name: editedName } : c
        )
      );
      setEditingContactId(null);
      toast({ description: 'Updated!', duration: 2000 });
    } else {
      setError('Failed to update contact.');
      toast({ description: 'Error!', duration: 2000 });
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualError(null);
    try {
      if (!manualEmail) {
        setManualError('Email is required.');
        setManualLoading(false);
        return;
      }
      // Get current user id
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      if (!user_id) throw new Error('User not authenticated');
      const { error: supabaseError } = await supabase
        .from('contacts')
        .insert([{ email: manualEmail, name: manualName, user_id }]);
      if (!supabaseError) {
        // Refetch contacts after upload
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
        if (!error && data) setContacts(data);
        setManualEmail('');
        setManualName('');
        toast({ description: 'Contact added!', duration: 2000 });
      } else {
        setManualError('Error saving contact to Supabase.');
        toast({ description: 'Error!', duration: 2000 });
      }
    } catch (err) {
      setManualError('Error saving contact.');
      toast({ description: 'Error!', duration: 2000 });
    }
    setManualLoading(false);
  };

  // Memoize contacts table rendering for performance
  const ContactsTable = React.useMemo(() => (
    loading ? (
      <div className="overflow-auto max-h-[350px] min-w-[400px] sm:min-w-0 border rounded-md animate-pulse">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array(5).fill(0).map((_, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2"><Skeleton className="h-4 w-32 rounded" /></td>
                <td className="px-4 py-2"><Skeleton className="h-4 w-24 rounded" /></td>
                <td className="px-4 py-2 flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : contacts.length === 0 ? (
      <div className="text-gray-500">No contacts found.</div>
    ) : (
      <div className="overflow-auto max-h-[350px] min-w-[400px] sm:min-w-0 border rounded-md">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-4 py-2">
                  {editingContactId === contact.id ? (
                    <Input
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full text-sm"
                    />
                  ) : (
                    contact.email
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingContactId === contact.id ? (
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-sm"
                    />
                  ) : (
                    contact.name || '-'
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {editingContactId === contact.id ? (
                    <>
                      <button className="p-1" onClick={() => handleSaveEdit(contact.id)}>
                        <Save className="w-4 h-4" />
                      </button>
                      <button className="p-1" onClick={() => setEditingContactId(null)}>
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="p-1" onClick={() => handleEditContact(contact)}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  ), [loading, contacts, editingContactId, editedEmail, editedName]);

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 p-2 sm:p-6 flex-1">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Contacts</h1>

      {/* Manual Entry Section */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>Add Contact Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-2 items-start sm:items-end" onSubmit={handleManualAdd} autoComplete="off">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <Label htmlFor="manualEmail">Email</Label>
              <Input id="manualEmail" name="manualEmail" type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} required placeholder="email@example.com" autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <Label htmlFor="manualName">Name (optional)</Label>
              <Input id="manualName" name="manualName" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Name" autoComplete="off" />
            </div>
            <Button type="submit" className="bg-rich-green hover:bg-rich-green/90 text-white mt-4 sm:mt-0" disabled={manualLoading}>{manualLoading ? 'Saving...' : 'Add Contact'}</Button>
          </form>
          {manualError && <div className="text-red-500 text-xs mt-2">{manualError}</div>}
        </CardContent>
      </Card>

      {/* Upload CSV Section */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>Upload Leads CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csvFile">Choose CSV File</Label>
            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
          {fileName && <p className="text-sm text-gray-600">Selected file: {fileName}</p>}
          {error && <p className="text-sm text-red-500">Error: {error}</p>}
          {pendingContacts.length > 0 && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-full mt-2"
              onClick={handleConfirmContacts}
            >
              Confirm Contacts
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Contacts Table Section */}
      <Card className="w-full max-w-full">
          <CardHeader>
          <CardTitle>Saved Contacts</CardTitle>
          </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {ContactsTable}
          </CardContent>
        </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={open => { if (!open) setIsDeleteConfirmModalOpen(false); }}>
        <DialogContent className="w-[calc(100%-2rem)] mx-auto sm:max-w-[350px] p-4 md:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this contact?</div>
          <DialogFooter>
            <Button type="button" variant="outline" className="hover:bg-black hover:text-white" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteContact}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 