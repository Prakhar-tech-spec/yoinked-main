'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Assuming shadcn/ui dialog
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Star, Edit } from 'lucide-react'; // Icons for password visibility, stars, and edit
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsData?: { userEmail: string; appPassword: string; userId: string | null } | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settingsData,
}) => {
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [appPassword, setAppPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEmailEditing, setIsEmailEditing] = useState(false); // State for email edit mode
  const [editedEmail, setEditedEmail] = useState(''); // State for the edited email value
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Initialize state from settingsData
  useEffect(() => {
    if (settingsData) {
      setUserEmail(settingsData.userEmail);
      setAppPassword(settingsData.appPassword);
      setUserId(settingsData.userId);
    }
  }, [settingsData]);

  // If settingsData is not loaded, render nothing (modal will not open until data is ready)
  if (!settingsData) return null;

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    // Re-authenticate user with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userEmail,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordLoading(false);
      setPasswordError('Current password is incorrect.');
      toast({ description: 'Current password is incorrect.', duration: 2000 });
      return;
    }
    // If re-auth succeeds, update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (!error) {
      toast({ description: 'Password updated!', duration: 2000 });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    } else {
      setPasswordError(error.message || 'Failed to update password.');
      toast({ description: 'Failed to update password.', duration: 2000 });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose(); // Close modal on sign out
    router.replace('/auth'); // Redirect to auth page
  };

  const handleRateUs = () => {
    // TODO: Implement rate us logic (e.g., redirect to app store)
    console.log('Rate Us clicked');
    onClose(); // Close modal
  };

  const handleSaveEmailChanges = async () => {
    if (!userId) return;
    // Upsert settings row for this user
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        app_password: appPassword,
        email: editedEmail || userEmail,
      });
    if (!error) {
      setUserEmail(editedEmail || userEmail);
      setIsEmailEditing(false);
      toast({ description: 'Saved!', duration: 2000 });
    } else {
      // Optionally show error
      console.error('Failed to save settings:', error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[700px] p-2 sm:p-4 md:p-6 rounded-xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="email" 
                value={isEmailEditing ? editedEmail : userEmail} 
                readOnly={!isEmailEditing} // Make input read-only unless editing
                onChange={(e) => setEditedEmail(e.target.value)}
                className={`
                  ${isEmailEditing ? '' : 'border-none shadow-none'}
                  focus-visible:ring-0 focus-visible:ring-offset-0
                `} // Remove border/shadow when not editing and remove focus ring
              />
              {isEmailEditing ? (
                <Button variant="ghost" size="sm" onClick={handleSaveEmailChanges}>{/* Placeholder Save button */}
                  Save
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsEmailEditing(true);
                    setEditedEmail(userEmail); // Initialize editedEmail with the current user.email
                  }}
                  className="hover:bg-transparent active:bg-transparent"
                >{/* Edit icon button */}
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
              )}
            </div>
          </div>

          {/* App Password */}
          <div className="space-y-2">
            <Label htmlFor="app-password">App Password</Label>
            <div className="relative">
              <Input
                id="app-password"
                type={showAppPassword ? 'text' : 'password'}
                value={appPassword}
                onChange={e => setAppPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowAppPassword(!showAppPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              >
                {showAppPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            <Button
              className="mt-2 bg-rich-green hover:bg-rich-green/90"
              onClick={async () => {
                if (!userId) return;
                const { error } = await supabase
                  .from('settings')
                  .upsert({
                    user_id: userId,
                    app_password: appPassword,
                    email: userEmail,
                  });
                if (error) {
                  // Optionally show error
                  console.error('Failed to save app password:', error.message);
                } else {
                  toast({ description: 'Saved!', duration: 2000 });
                }
              }}
            >
              Save App Password
            </Button>
          </div>

          {/* Change Password */}
          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="relative">
            <Input
                type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            <div className="relative">
            <Input
                type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            <div className="relative">
            <Input
                type={showConfirmNewPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
            <Button onClick={handleChangePassword} className="bg-rich-green hover:bg-rich-green/90" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>

          {/* Sign Out */}
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>

          {/* Rate Us */}
          {/* Could be a button or a link */} {/* Placeholder for now */}
          <Button variant="ghost" onClick={handleRateUs} className="bg-black text-white flex items-center justify-center space-x-2">
            <span>Rate Us</span>
            <div className="flex space-x-0.5">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </Button>

        </div>
        <DialogFooter>
          {/* Footer actions if any, e.g., a close button */} {/* Already handled by onOpenChange */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 