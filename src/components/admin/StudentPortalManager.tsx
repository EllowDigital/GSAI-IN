import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/useToast';
import Spinner from '@/components/ui/spinner';
import {
  UserPlus,
  Trash2,
  Search,
  Key,
  Copy,
  RefreshCw,
  CheckCircle,
  Info,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';

const REQUEST_TIMEOUT_MS = 15000;

const getErrorMessage = (error: unknown): string => {
  if (isTimeoutError(error)) return 'Connection is slow. Please try again.';
  if (error instanceof Error) return error.message;
  return 'Unexpected error occurred.';
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

export default function StudentPortalManager() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [createdCreds, setCreatedCreds] = useState<{
    loginId: string;
    password: string;
  } | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetAccount, setResetAccount] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['portal-accounts'],
    queryFn: async () => {
      const { data, error } = (await withTimeout(
        supabase
          .from('student_portal_accounts')
          .select('*, students(name, program)')
          .order('created_at', { ascending: false }),
        REQUEST_TIMEOUT_MS,
        'Loading portal accounts timed out.'
      )) as any;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const { data: availableStudents = [] } = useQuery({
    queryKey: ['students-without-portal'],
    queryFn: async () => {
      const { data: allStudents, error: studentsError } = await withTimeout(
        supabase
          .from('students')
          .select('id, name, program, aadhar_number, join_date'),
        REQUEST_TIMEOUT_MS,
        'Loading students timed out.'
      );
      if (studentsError) throw studentsError;
      const { data: existingAccounts, error: accountsError } =
        (await withTimeout(
          supabase.from('student_portal_accounts').select('student_id'),
          REQUEST_TIMEOUT_MS,
          'Loading existing portal accounts timed out.'
        )) as any;
      if (accountsError) throw accountsError;
      const usedIds = new Set(
        (existingAccounts || []).map(
          (a: { student_id: string }) => a.student_id
        )
      );
      return (allStudents || []).filter((s) => !usedIds.has(s.id));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = availableStudents.find((s: any) => s.id === studentId);
    if (student) {
      setLoginId(generateLoginId(student.aadhar_number));
      setPassword(generateDefaultPassword(student.join_date));
    } else {
      setLoginId('');
      setPassword('');
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !loginId.trim() || !password.trim()) {
        throw new Error('All fields required');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      const { data, error } = await withTimeout(
        supabase.functions.invoke('create-student-account', {
          body: {
            student_id: selectedStudent,
            login_id: loginId.trim(),
            password: password.trim(),
          },
        }),
        REQUEST_TIMEOUT_MS,
        'Creating student account timed out.'
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return { loginId: loginId.trim(), password: password.trim() };
    },
    onSuccess: (creds) => {
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      setCreatedCreds(creds);
      toast.success('Student portal account created!');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = (await withTimeout(
        supabase.from('student_portal_accounts').delete().eq('id', accountId),
        REQUEST_TIMEOUT_MS,
        'Deleting portal account timed out.'
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
      if (!resetAccount || !newPassword.trim()) {
        throw new Error('Password is required');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      const { data, error } = await withTimeout(
        supabase.functions.invoke('reset-student-password', {
          body: {
            auth_user_id: resetAccount.auth_user_id,
            new_password: newPassword.trim(),
          },
        }),
        REQUEST_TIMEOUT_MS,
        'Resetting password timed out.'
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast.success('Password reset successfully!');
    },
    onError: (error: Error) => toast.error(getErrorMessage(error)),
  });

  const handleCreateOpen = () => {
    setSelectedStudent('');
    setLoginId('');
    setPassword('');
    setCreatedCreds(null);
    setCreateOpen(true);
  };

  const handleCreateClose = (val: boolean) => {
    if (!val) {
      setSelectedStudent('');
      setLoginId('');
      setPassword('');
      setCreatedCreds(null);
    }
    setCreateOpen(val);
  };

  const handleResetOpen = (account: any) => {
    setResetAccount(account);
    setNewPassword('');
    setResetSuccess(false);
    setResetOpen(true);
  };

  const handleResetClose = (val: boolean) => {
    if (!val) {
      setResetAccount(null);
      setNewPassword('');
      setResetSuccess(false);
    }
    setResetOpen(val);
  };

  const filtered = useMemo(
    () =>
      (accounts as any[]).filter(
        (a: any) =>
          a.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.login_id?.toLowerCase().includes(search.toLowerCase())
      ),
    [accounts, search]
  );

  return (
    <div className="space-y-5">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Portal Identity Workspace
              </Badge>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Student Portal Accounts
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Create and manage student logins with safer reset and
                  credential sharing workflows.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Active Accounts
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : accounts.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Available Students
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {availableStudents.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Filtered
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {filtered.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div>
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                Account Operations
              </h3>
              <p className="text-sm text-muted-foreground">
                Search portal users, reset credentials, and revoke access
                quickly.
              </p>
            </div>
            <Button
              onClick={handleCreateOpen}
              size="sm"
              className="gap-1.5"
              disabled={availableStudents.length === 0}
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </Button>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or login ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size={20} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No portal accounts found for current filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((account: any) => (
                <Card
                  key={account.id}
                  className="border border-border/70 transition-colors hover:bg-muted/20"
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {account.students?.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          <span className="font-mono">{account.login_id}</span>
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(account.login_id);
                            toast.success('Copied!');
                          }}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <Badge variant="outline" className="text-[10px]">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {account.students?.program || 'Program'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => handleResetOpen(account)}
                      >
                        <RefreshCw className="w-3 h-3" /> Reset
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if (confirm('Remove this portal account?')) {
                            deleteMutation.mutate(account.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={createOpen} onOpenChange={handleCreateClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Student Account</DialogTitle>
            <DialogDescription>
              Create login credentials for a student.
            </DialogDescription>
          </DialogHeader>

          {createdCreds ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Account Created!
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Login ID:</span>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-foreground">
                        {createdCreds.loginId}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdCreds.loginId);
                          toast.success('Copied!');
                        }}
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
                        onClick={() => {
                          navigator.clipboard.writeText(createdCreds.password);
                          toast.success('Copied!');
                        }}
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
                onClick={() => handleCreateClose(false)}
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
                  ID and password auto-generated:
                  <br />
                  <strong>GSAI-[last 4 Aadhar]</strong> /{' '}
                  <strong>GSAI-STUDENT-[year]</strong>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Select Student *</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
                >
                  <option value="">Choose a student...</option>
                  {availableStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.program}
                    </option>
                  ))}
                </select>
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
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !selectedStudent}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <Spinner size={16} />
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={handleResetClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{' '}
              <strong>{resetAccount?.students?.name}</strong> (
              {resetAccount?.login_id})
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Password Updated!
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Password:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-foreground">
                      {newPassword}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newPassword);
                        toast.success('Copied!');
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share the new password with the student securely.
                </p>
              </div>
              <Button
                onClick={() => handleResetClose(false)}
                className="w-full"
                variant="outline"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password *</label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The student will use this new password to log in.
                </p>
              </div>
              <Button
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="w-full"
              >
                {resetMutation.isPending ? (
                  <Spinner size={16} />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
