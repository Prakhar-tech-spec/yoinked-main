
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { emailErrorAutoClean } from '@/ai/flows/email-error-auto-clean';
import { Loader2, AlertCircle, Trash2, Send, ListChecks, HelpCircle, Lightbulb } from 'lucide-react';

const LOCAL_STORAGE_KEY_SUBJECT = 'yoinkedCampaignData_subject';
const LOCAL_STORAGE_KEY_MESSAGE = 'yoinkedCampaignData_message';
const LOCAL_STORAGE_KEY_RECIPIENTS = 'yoinkedCampaignData_recipients';


export default function EmailForm() {
  const [subject, setSubject] = useLocalStorage<string>(LOCAL_STORAGE_KEY_SUBJECT, '');
  const [message, setMessage] = useLocalStorage<string>(LOCAL_STORAGE_KEY_MESSAGE, '');
  const [recipients, setRecipients] = useLocalStorage<string>(LOCAL_STORAGE_KEY_RECIPIENTS, '');
  
  const [senderEmail, setSenderEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailTrimmed = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorLog([]);

    if (!senderEmail || !appPassword) {
      toast({ title: 'Credentials Missing 🔑', description: 'Please enter Your Gmail Address and App Password.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if (!validateEmail(senderEmail)) {
      toast({ title: 'Invalid Sender Email 📧', description: 'Please enter a valid Gmail address for sending.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }


    const recipientArray = recipients.split(',').map(email => email.trim()).filter(email => email.length > 0);
    
    if (recipientArray.length === 0) {
      toast({ title: 'No Recipients 🤔', description: 'Please enter at least one email address.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const validEmailsForSending: string[] = [];
    const clientSideInvalidEmails: string[] = [];

    recipientArray.forEach(email => {
      if (validateEmail(email)) {
        validEmailsForSending.push(email);
      } else {
        clientSideInvalidEmails.push(`Invalid format or excluded: ${email}`);
      }
    });

    if (clientSideInvalidEmails.length > 0) {
      setErrorLog(prev => [...prev, ...clientSideInvalidEmails]);
    }

    if (validEmailsForSending.length === 0) {
      toast({ title: 'No Valid Emails 🤦‍♀️', description: 'None of the provided emails seem valid. Check the error log.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    
    let apiReportedAccepted: string[] = [];
    let apiReportedRejected: string[] = [];

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: validEmailsForSending, 
          subject, 
          text: message,
          senderEmail, // Add this
          appPassword  // Add this
        }),
      });

      const result = await response.json();
      apiReportedAccepted = result.accepted || [];
      apiReportedRejected = result.rejected || [];


      if (!response.ok || !result.success) {
        toast({ title: 'API Error 🚨', description: result.message || 'Failed to send emails.', variant: 'destructive' });
        setErrorLog(prev => [...prev, `API Error: ${result.message || 'Unknown API error'}`]);
        if (apiReportedRejected.length > 0) {
             setErrorLog(prev => [...prev, ...apiReportedRejected.map((r: string) => `Server rejected: ${r}`)]);
        } else if (validEmailsForSending.length > 0 && apiReportedAccepted.length === 0) {
            apiReportedRejected = [...validEmailsForSending];
        }
      } else {
        toast({ title: 'Emails Sent! 🚀', description: result.message || 'Your campaign is on its way.', variant: 'default' });
        if (apiReportedRejected.length > 0) {
          setErrorLog(prev => [...prev, ...apiReportedRejected.map(email => `Server rejected: ${email}`)]);
        }
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast({ title: 'Network Error 😵', description: 'Could not connect to the server. Please try again.', variant: 'destructive' });
      setErrorLog(prev => [...prev, 'Network error or unexpected issue during sending. All emails assumed failed.']);
      apiReportedRejected = [...validEmailsForSending];
    } finally {
      const deliveryStatuses = validEmailsForSending.map(email => {
        if (apiReportedAccepted.includes(email)) return true;
        return false; 
      });

      if(validEmailsForSending.length > 0) {
          try {
            const { cleanedEmailList } = await emailErrorAutoClean({ emailList: validEmailsForSending, deliveryStatuses });
            const initialRecipientsSet = new Set(validEmailsForSending);
            
            const finalRecipientList = Array.from(new Set([...cleanedEmailList, ...recipientArray.filter(r => !initialRecipientsSet.has(r) && !validateEmail(r))]));
            
            setRecipients(finalRecipientList.join(', '));

            const numRemoved = validEmailsForSending.length - cleanedEmailList.length;
            if (numRemoved > 0) {
                 toast({ title: 'List Auto-Cleaned! 🧼', description: `${numRemoved} email(s) removed based on delivery status.`, variant: 'default' });
            }
          } catch (aiError) {
            console.error("AI Cleaning error:", aiError);
            toast({ title: 'AI Clean Error 🤖', description: 'Could not auto-clean the email list.', variant: 'destructive' });
          }
      }
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setRecipients('');
    setSenderEmail('');
    setAppPassword('');
    setErrorLog([]);
    toast({ title: 'Form Reset! ✨', description: 'Campaign data and credentials cleared from form.' });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          Yoinked Mailer 📨
        </CardTitle>
        <CardDescription>
          Enter your Gmail, craft your message, list your peeps, and yoink it to their inboxes!
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSend}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="senderEmail" className="text-lg">Your Gmail Address 📧</Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="you@gmail.com"
              value={senderEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSenderEmail(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="appPassword" className="text-lg">Your Gmail App Password 🔒</Label>
              <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" type="button" className="p-0 h-auto">
                    <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">How to Get a Gmail App Password</DialogTitle>
                    <DialogDescription>
                      An App Password is a 16-digit passcode that gives a less secure app or device permission to access your Google Account.
                      It can only be used with accounts that have 2-Step Verification turned on.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2 text-sm">
                    <p>1. Go to your Google Account: <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">myaccount.google.com/security</a></p>
                    <p>2. On the left navigation panel, click <strong>Security</strong>.</p>
                    <p>3. Scroll down to the "How you sign in to Google" section.</p>
                    <p>4. If <strong>2-Step Verification</strong> is "Off", click on it and follow the steps to enable it. You need this to use App Passwords.</p>
                    <p>5. Once 2-Step Verification is on, go back to the Security page and click on <strong>App passwords</strong>. You may need to sign in again.</p>
                    <p>6. At the bottom, click <strong>Select app</strong> and choose <strong>Mail</strong>.</p>
                    <p>7. Click <strong>Select device</strong> and choose <strong>Other (Custom name)</strong>.</p>
                    <p>8. Enter a name (e.g., "Yoinked Mailer") and click <strong>Generate</strong>.</p>
                    <p>9. Google will display a 16-character password. <strong>Copy this password</strong> (without spaces) and paste it into the form field. Store it securely if you plan to reuse it, as Google won't show it again.</p>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={() => setIsHelpModalOpen(false)}>Got it</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Input
              id="appPassword"
              type="password"
              placeholder="Enter your 16-character app password"
              value={appPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAppPassword(e.target.value)}
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-lg">Subject Line 🎯</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Your awesome subject..."
              value={subject}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-lg">Message Body ✍️</Label>
            <Textarea
              id="message"
              placeholder="Pour your heart out (or just the deets)..."
              value={message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              required
              rows={8}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipients" className="text-lg">Recipients (comma-separated) 💌</Label>
            <Textarea
              id="recipients"
              placeholder="email1@example.com, email2@example.com..."
              value={recipients}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRecipients(e.target.value)}
              required
              rows={4}
              className="text-base"
            />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-start">
                <ListChecks className="mr-1.5 mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Tip: We'll try to auto-clean this list if some emails bounce! Invalid formats are logged below.
              </p>
              <p className="text-xs text-muted-foreground flex items-start">
                <Lightbulb className="mr-1.5 mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Pro-tip: To avoid spam, use clear subjects, quality content, and send to people who expect your emails.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Reset Form
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Yoink Emails!
          </Button>
        </CardFooter>
      </form>
      {errorLog.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold mb-2 flex items-center"><ListChecks className="mr-2 text-primary" /> Status Log:</h3>
          <ScrollArea className="h-32 w-full rounded-md border p-2 bg-muted/50">
            <ul className="space-y-1 text-sm">
              {errorLog.map((err, index) => (
                <li key={index} className="flex items-start">
                   <AlertCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-destructive" /> 
                   <span className="text-muted-foreground">{err}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
    
