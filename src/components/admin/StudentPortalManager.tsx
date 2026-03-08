import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { UserPlus, Trash2, Search, Key, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';

const REQUEST_TIMEOUT_MS = 15000;

const getErrorMessage = (error: unknown): string => {
  if (isTimeoutError(error)) return 'Connection is slow. Please try again.';
  if (error instanceof Error) return error.message;
  return 'Unexpected error occurred.';
};

export default function StudentPortalManager() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  const [resetOpen, setResetOpen] = useState(false);
  const [resetAccount, setResetAccount] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['portal-accounts'],
    queryFn: async () => {
      const { data, error } = (await withTimeout(
        supabase.from('student_portal_accounts').select('*, students(name, program)').order('created_at', { ascending: false }),
        REQUEST_TIMEOUT_MS, 'Loading portal accounts timed out.'
      )) as any;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: availableStudents = [] } = useQuery({
    queryKey: ['students-without-portal'],
    queryFn: async () => {
      const { data: allStudents, error: studentsError } = await withTimeout(
        supabase.from('students').select('id, name, program'), REQUEST_TIMEOUT_MS, 'Loading students timed out.'
      );
      if (studentsError) throw studentsError;
      const { data: existingAccounts, error: accountsError } = (await withTimeout(
        supabase.from('student_portal_accounts').select('student_id'), REQUEST_TIMEOUT_MS, 'Loading existing portal accounts timed out.'
      )) as any;
      if (accountsError) throw accountsError;
      const usedIds = new Set((existingAccounts || []).map((a: { student_id: string }) => a.student_id));
      return (allStudents || []).filter((s) => !usedIds.has(s.id));
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !loginId.trim() || !password.trim()) throw new Error('All fields required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      const { data, error } = await withTimeout(
        supabase.functions.invoke('create-student-account', {
          body: { student_id: selectedStudent, login_id: loginId.trim(), password: password.trim() },
        }), REQUEST_TIMEOUT_MS, 'Creating student account timed out.'
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      toast.success('Student portal account created!');
      setCreateOpen(false); setSelectedStudent(''); setLoginId(''); setPassword('');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = (await withTimeout(
        supabase.from('student_portal_accounts').delete().eq('id', accountId),
        REQUEST_TIMEOUT_MS, 'Deleting portal account timed out.'
      )) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      toast.success('Account removed.');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error)),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!resetAccount || !newPassword.trim()) throw new Error('Password is required');
      if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
      const { data, error } = await withTimeout(
        supabase.functions.invoke('reset-student-password', {
          body: { auth_user_id: resetAccount.auth_user_id, new_password: newPassword.trim() },
        }), REQUEST_TIMEOUT_MS, 'Resetting password timed out.'
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => { setResetSuccess(true); toast.success('Password reset successfully!'); },
    onError: (error: Error) => toast.error(getErrorMessage(error)),
  });

  const handleResetOpen = (account: any) => {
    setResetAccount(account); setNewPassword(''); setResetSuccess(false); setResetOpen(true);
  };

  const handleResetClose = (val: boolean) => {
    if (!val) { setResetAccount(null); setNewPassword(''); setResetSuccess(false); }
    setResetOpen(val);
  };

  const filtered = (accounts as any[]).filter(
    (a: any) => a.students?.name?.toLowerCase().includes(search.toLowerCase()) || a.login_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Student Portal Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage student login credentials</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5" disabled={availableStudents.length === 0}>
          <UserPlus className="w-4 h-4" /> Create Account
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size={20} /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">No portal accounts created yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((account: any) => (
            <Card key={account.id} className="border border-border">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{account.students?.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Key className="w-3 h-3" />
                    <span className="font-mono">{account.login_id}</span>
                    <button onClick={() => { navigator.clipboard.writeText(account.login_id); toast.success('Copied!'); }} className="hover:text-foreground">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleResetOpen(account)}>
                    <RefreshCw className="w-3 h-3" /> Reset
                  </Button>
                  <Button variant="destructive" size="sm" className="text-xs" onClick={() => { if (confirm('Remove this portal account?')) deleteMutation.mutate(account.id); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Student Account</DialogTitle>
            <DialogDescription>Create login credentials for a student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Student *</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1">
                <option value="">Choose a student...</option>
                {availableStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {s.program}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Login ID *</label>
              <Input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="e.g. STU001" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Share this password with the student.</p>
            </div>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? <Spinner size={16} /> : 'Create Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={handleResetClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resetAccount?.students?.name}</strong> ({resetAccount?.login_id})
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Password Updated!</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Password:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-foreground">{newPassword}</code>
                    <button onClick={() => { navigator.clipboard.writeText(newPassword); toast.success('Copied!'); }} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Share the new password with the student securely.</p>
              </div>
              <Button onClick={() => handleResetClose(false)} className="w-full" variant="outline">Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password *</label>
                <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">The student will use this new password to log in.</p>
              </div>
              <Button onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending} className="w-full">
                {resetMutation.isPending ? <Spinner size={16} /> : 'Reset Password'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
