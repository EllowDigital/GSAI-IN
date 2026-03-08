import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNew(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Verify current password by re-authenticating
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error('No active session');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error('Current password is incorrect');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new Error(error.message);

      toast.success('Password updated successfully!');
      reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <KeyRound className="w-4 h-4" /> Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">New Password</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm New Password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
