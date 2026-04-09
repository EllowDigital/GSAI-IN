import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/hooks/useToast';
import Spinner from '@/components/ui/spinner';
import { Copy, CheckCircle, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    program: string;
    aadhar_number?: string;
    join_date?: string;
  } | null;
};

function generateLoginId(aadharNumber?: string): string {
  if (aadharNumber && aadharNumber.length >= 4) {
    return `GSAI-${aadharNumber.slice(-4)}`;
  }
  return '';
}

function generateDefaultPassword(joinDate?: string): string {
  const year = joinDate
    ? new Date(joinDate).getFullYear()
    : new Date().getFullYear();
  return `GSAI-STUDENT-${year}`;
}

export default function CreatePortalAccountDialog({
  open,
  onOpenChange,
  student,
}: Props) {
  const queryClient = useQueryClient();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{
    loginId: string;
    password: string;
  } | null>(null);

  // Auto-generate login ID and password when student changes
  useEffect(() => {
    if (student && open) {
      const autoLoginId = generateLoginId(student.aadhar_number);
      const autoPassword = generateDefaultPassword(student.join_date);
      setLoginId(autoLoginId);
      setPassword(autoPassword);
    }
  }, [student, open]);

  const handleCreate = async () => {
    if (!student || !loginId.trim() || !password.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsPending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-student-account',
        {
          body: {
            student_id: student.id,
            login_id: loginId.trim(),
            password: password.trim(),
          },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCreatedCreds({ loginId: loginId.trim(), password: password.trim() });
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      queryClient.invalidateQueries({ queryKey: ['students-portal-status'] });
      toast.success('Portal account created!');
    } catch (err: any) {
      const friendlyError = mapSupabaseErrorToFriendly(err);
      toast.error(friendlyError?.message || err.message || 'Failed to create account');
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setLoginId('');
      setPassword('');
      setCreatedCreds(null);
    }
    onOpenChange(val);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Portal Account</DialogTitle>
          <DialogDescription>
            Create login credentials for <strong>{student.name}</strong> (
            {student.program})
          </DialogDescription>
        </DialogHeader>

        {createdCreds ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Account Created!</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Login ID:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-foreground">
                      {createdCreds.loginId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdCreds.loginId)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-foreground">
                      {createdCreds.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdCreds.password)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Share these credentials with the student securely.
              </p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="w-full"
              variant="outline"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 border border-border p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Login ID: <strong>GSAI-[last 4 Aadhar digits]</strong>
                <br />
                Password: <strong>GSAI-STUDENT-[year of joining]</strong>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Login ID *</label>
              <Input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                placeholder="e.g. GSAI-5549"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. GSAI-STUDENT-2026"
                className="mt-1 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Student can change this after first login.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? <Spinner size={16} /> : 'Create Account'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
