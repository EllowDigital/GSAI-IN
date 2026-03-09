import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  UserPlus,
  Search,
  Eye,
  Check,
  X,
  Clock,
  Trash2,
  Phone,
  User,
  Copy,
  CheckCircle,
  KeyRound,
  Mail,
  RefreshCw,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface EnrollmentRequest {
  id: string;
  student_name: string;
  age: number;
  gender: string;
  parent_name: string;
  parent_phone: string;
  program: string;
  aadhar_number: string | null;
  student_email: string | null;
  student_phone: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
};

export default function EnrollmentRequestsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewReq, setViewReq] = useState<EnrollmentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Approve flow state
  const [approveReq, setApproveReq] = useState<EnrollmentRequest | null>(null);
  const [approveStep, setApproveStep] = useState<
    'confirm' | 'credentials' | 'done'
  >('confirm');
  const [aadharNumber, setAadharNumber] = useState('');
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    loginId: string;
    password: string;
  } | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['enrollment-requests'],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('enrollment_requests' as any)
        .select('*')
        .order('created_at', { ascending: false })) as any;
      if (error) throw error;
      return (data || []) as EnrollmentRequest[];
    },
  });

  // Send rejection notification via WhatsApp + email
  const sendRejectionNotification = async (
    req: EnrollmentRequest,
    notes: string
  ) => {
    const message = `Dear ${req.parent_name},\n\nWe regret to inform you that the enrollment request for ${req.student_name} in the ${req.program} program has not been approved at this time.\n\n${notes ? `Reason: ${notes}\n\n` : ''}If you have questions, please contact us.\n\nGhatak Sports Academy India`;

    // Open WhatsApp
    window.open(
      `https://wa.me/91${req.parent_phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );

    // Also send email if student email exists
    if (req.student_email) {
      try {
        const { sendFormSubmitEmail } =
          await import('@/utils/emailNotifications');
        await sendFormSubmitEmail({
          subject: `Enrollment Update - ${req.student_name}`,
          message,
          name: req.student_name,
          replyTo: req.student_email,
        });
        toast.success('Rejection notification sent via WhatsApp & email');
      } catch {
        toast.success('WhatsApp opened (email notification failed)');
      }
    } else {
      toast.success('WhatsApp opened with rejection message');
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => {
      const { error } = (await supabase
        .from('enrollment_requests' as any)
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', id)) as any;
      if (error) throw error;
      return { id, status, notes };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      toast.success('Request updated');

      // If rejected, auto-open WhatsApp with rejection message
      if (data.status === 'rejected') {
        const req = requests.find((r) => r.id === data.id);
        if (req) {
          sendRejectionNotification(req, data.notes || '');
        }
      }
      setViewReq(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = (await supabase
        .from('enrollment_requests' as any)
        .delete()
        .eq('id', id)) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      toast.success('Request deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [approving, setApproving] = useState(false);

  const handleStartApprove = (req: EnrollmentRequest) => {
    setApproveReq(req);
    setApproveStep('confirm');
    setAadharNumber(req.aadhar_number || '');
    setJoinDate(new Date().toISOString().slice(0, 10));
    const last4 = req.aadhar_number ? req.aadhar_number.slice(-4) : '0000';
    setLoginId(`GSAI-${last4}`);
    const year = new Date().getFullYear();
    setPassword(`GSAI-STUDENT-${year}`);
    setCreatedStudentId(null);
    setCreatedCreds(null);
  };

  const handleCreateStudent = async () => {
    if (!approveReq) return;
    if (!/^\d{12}$/.test(aadharNumber)) {
      toast.error('Aadhar number must be exactly 12 digits');
      return;
    }
    setApproving(true);
    try {
      // Check Aadhar uniqueness before creating
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, name')
        .eq('aadhar_number', aadharNumber)
        .maybeSingle();

      if (existingStudent) {
        toast.error(
          `A student with this Aadhar is already registered: ${existingStudent.name}`
        );
        setApproving(false);
        return;
      }

      // Check login ID uniqueness
      const { data: existingLogin } = await supabase
        .from('student_portal_accounts')
        .select('id')
        .eq('login_id', loginId)
        .maybeSingle();

      if (existingLogin) {
        // Append random suffix to make unique
        const suffix = Math.floor(Math.random() * 90 + 10);
        setLoginId(`${loginId}-${suffix}`);
        toast.error(
          `Login ID "${loginId}" already taken. Updated to "${loginId}-${suffix}". Please try again.`
        );
        setApproving(false);
        return;
      }

      const { data: student, error } = await supabase
        .from('students')
        .insert({
          name: approveReq.student_name,
          aadhar_number: aadharNumber,
          program: approveReq.program,
          join_date: joinDate,
          parent_name: approveReq.parent_name,
          parent_contact: approveReq.parent_phone,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: updateError } = (await supabase
        .from('enrollment_requests' as any)
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', approveReq.id)) as any;
      if (updateError) {
        console.error('Failed to update enrollment status:', updateError);
        toast.error(
          'Student created but enrollment status update failed: ' +
            updateError.message
        );
      }

      setCreatedStudentId(student.id);
      setApproveStep('credentials');
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Student "${student.name}" created!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create student');
    } finally {
      setApproving(false);
    }
  };

  const handleCreatePortal = async () => {
    if (!createdStudentId || !loginId.trim() || !password.trim()) {
      toast.error('Login ID and password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-student-account',
        {
          body: {
            student_id: createdStudentId,
            login_id: loginId.trim(),
            password: password.trim(),
          },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCreatedCreds({ loginId: loginId.trim(), password: password.trim() });
      setApproveStep('done');
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      toast.success('Portal account created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create portal account');
    } finally {
      setApproving(false);
    }
  };

  const handleCloseApprove = () => {
    setApproveReq(null);
    setCreatedStudentId(null);
    setCreatedCreds(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleRejectWithNotes = (req: EnrollmentRequest) => {
    if (!adminNotes.trim()) {
      toast.error('Please add a reason/note before rejecting');
      return;
    }
    updateMutation.mutate({
      id: req.id,
      status: 'rejected',
      notes: adminNotes,
    });
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.parent_name.toLowerCase().includes(search.toLowerCase()) ||
      r.program.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Enrollment Requests
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review enrollment requests → approve → create student → set login
            credentials
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] })
          }
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'contacted', 'approved', 'rejected'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="text-xs h-8 capitalize"
            >
              {s === 'all' ? 'All' : s}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={20} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {requests.length === 0
              ? 'No enrollment requests yet. Share the enrollment form on your website!'
              : 'No requests match your filters.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            return (
              <Card
                key={req.id}
                className="border border-border hover:border-border/80 transition-colors"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">
                        {req.student_name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {req.program}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {req.parent_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {req.parent_phone}
                      </span>
                      <span>
                        Age: {req.age} • {req.gender}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{' '}
                        {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {/* Show admin notes if present */}
                    {req.admin_notes && (
                      <p className="text-xs text-muted-foreground italic mt-1 bg-muted/50 rounded px-2 py-1">
                        📝 {req.admin_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1"
                      onClick={() => {
                        setViewReq(req);
                        setAdminNotes(req.admin_notes || '');
                      }}
                    >
                      <Eye className="w-3 h-3" /> View
                    </Button>
                    {req.status !== 'approved' && req.status !== 'rejected' && (
                      <Button
                        size="sm"
                        className="text-xs h-8 gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStartApprove(req)}
                      >
                        <Check className="w-3 h-3" /> Approve & Add
                      </Button>
                    )}
                    {req.status === 'approved' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-7 px-2 border-green-500/30 text-green-600 bg-green-500/5"
                      >
                        ✓ Approved
                      </Badge>
                    )}
                    {req.status === 'rejected' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-7 px-2 border-red-500/30 text-red-600 bg-red-500/5"
                      >
                        ✗ Rejected
                      </Badge>
                    )}
                    {req.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="text-xs h-8 gap-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() =>
                            updateMutation.mutate({
                              id: req.id,
                              status: 'contacted',
                            })
                          }
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs h-8 gap-1"
                          onClick={() => {
                            setViewReq(req);
                            setAdminNotes(req.admin_notes || '');
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {req.status === 'contacted' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-8 gap-1"
                        onClick={() => {
                          setViewReq(req);
                          setAdminNotes(req.admin_notes || '');
                        }}
                      >
                        <X className="w-3 h-3" /> Reject
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Permanently remove this enrollment request.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => deleteMutation.mutate(req.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!viewReq}
        onOpenChange={(o) => {
          if (!o) setViewReq(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enrollment Request</DialogTitle>
          </DialogHeader>
          {viewReq && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium">{viewReq.student_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age / Gender</p>
                  <p className="font-medium">
                    {viewReq.age} yrs • {viewReq.gender}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parent</p>
                  <p className="font-medium">{viewReq.parent_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${viewReq.parent_phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {viewReq.parent_phone}
                  </a>
                </div>
                {viewReq.student_email && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Student Email
                    </p>
                    <a
                      href={`mailto:${viewReq.student_email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {viewReq.student_email}
                    </a>
                  </div>
                )}
                {viewReq.student_phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Student Phone
                    </p>
                    <a
                      href={`tel:${viewReq.student_phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {viewReq.student_phone}
                    </a>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Program</p>
                  <p className="font-medium">{viewReq.program}</p>
                </div>
                {viewReq.aadhar_number && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Aadhar Number
                    </p>
                    <p className="font-medium font-mono">
                      {viewReq.aadhar_number.replace(
                        /(\d{4})(\d{4})(\d{4})/,
                        '$1-$2-$3'
                      )}
                    </p>
                  </div>
                )}
                {viewReq.message && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Message</p>
                    <p className="font-medium">{viewReq.message}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(viewReq.created_at), 'PPp')}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes (required for rejection)..."
                  rows={2}
                  className="mt-1"
                  disabled={
                    viewReq.status === 'approved' ||
                    viewReq.status === 'rejected'
                  }
                />
                {viewReq.status === 'rejected' && viewReq.admin_notes && (
                  <p className="text-xs text-red-500 mt-1 italic">
                    Rejection reason: {viewReq.admin_notes}
                  </p>
                )}
              </div>

              {/* Save notes button for any status */}
              {viewReq.status !== 'approved' &&
                viewReq.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      updateMutation.mutate({
                        id: viewReq.id,
                        status: viewReq.status,
                        notes: adminNotes,
                      });
                    }}
                  >
                    💾 Save Notes
                  </Button>
                )}

              {viewReq.status !== 'approved' &&
                viewReq.status !== 'rejected' && (
                  <div className="flex flex-wrap gap-2">
                    {viewReq.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() =>
                          updateMutation.mutate({
                            id: viewReq.id,
                            status: 'contacted',
                            notes: adminNotes,
                          })
                        }
                      >
                        <Phone className="w-3 h-3" /> Mark Contacted
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="gap-1 text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setViewReq(null);
                        handleStartApprove(viewReq);
                      }}
                    >
                      <Check className="w-3 h-3" /> Approve & Add Student
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1 text-xs"
                      onClick={() => handleRejectWithNotes(viewReq)}
                    >
                      <X className="w-3 h-3" /> Reject & Notify
                    </Button>
                  </div>
                )}
              {viewReq.status === 'approved' && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-400 font-medium">
                  ✅ This enrollment has been approved. Student has been added.
                </div>
              )}
              {viewReq.status === 'rejected' && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium space-y-2">
                  <p>❌ This enrollment has been rejected.</p>
                  {viewReq.admin_notes && (
                    <p className="text-xs opacity-80">
                      Reason: {viewReq.admin_notes}
                    </p>
                  )}
                </div>
              )}
              <a
                href={`https://wa.me/91${viewReq.parent_phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                📱 WhatsApp Parent
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve & Add Student Flow */}
      <Dialog
        open={!!approveReq}
        onOpenChange={(o) => {
          if (!o) handleCloseApprove();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approveStep === 'confirm' && (
                <>
                  <UserPlus className="w-5 h-5 text-green-600" /> Step 1: Create
                  Student
                </>
              )}
              {approveStep === 'credentials' && (
                <>
                  <KeyRound className="w-5 h-5 text-primary" /> Step 2: Set
                  Login
                </>
              )}
              {approveStep === 'done' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" /> All Done!
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {approveStep === 'confirm' &&
                `Add "${approveReq?.student_name}" to your student roster.`}
              {approveStep === 'credentials' &&
                'Create portal login so the student can access their dashboard.'}
              {approveStep === 'done' &&
                'Student is enrolled and can now log in.'}
            </DialogDescription>
          </DialogHeader>

          {approveStep === 'confirm' && approveReq && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{approveReq.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium">{approveReq.program}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parent</span>
                  <span className="font-medium">{approveReq.parent_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{approveReq.parent_phone}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Aadhar Number *</label>
                <Input
                  value={aadharNumber}
                  onChange={(e) =>
                    setAadharNumber(
                      e.target.value.replace(/\D/g, '').slice(0, 12)
                    )
                  }
                  placeholder="12 digit Aadhar number"
                  maxLength={12}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for student records
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Join Date *</label>
                <Input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleCreateStudent}
                disabled={approving}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {approving ? <Spinner size={16} /> : 'Create Student Record'}
              </Button>
            </div>
          )}

          {approveStep === 'credentials' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
                ✅ Student record created. Now set up their portal login.
              </div>
              <div>
                <label className="text-sm font-medium">Login ID *</label>
                <Input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. STU001"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this password with the student. They can change it
                  later.
                </p>
              </div>
              <Button
                onClick={handleCreatePortal}
                disabled={approving}
                className="w-full"
              >
                {approving ? <Spinner size={16} /> : 'Create Portal Account'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={handleCloseApprove}
              >
                Skip — I'll set up login later
              </Button>
            </div>
          )}

          {approveStep === 'done' && createdCreds && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Enrollment Complete!
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
                  Share these credentials with the student. They can change
                  their password from the student portal.
                </p>
              </div>
              {approveReq && (
                <a
                  href={`https://wa.me/91${approveReq.parent_phone}?text=${encodeURIComponent(`🥋 Welcome to GSAI!\n\nDear ${approveReq.parent_name},\n\n${approveReq.student_name} has been enrolled in ${approveReq.program}.\n\n🔐 Student Portal Login:\nURL: ${window.location.origin}/student/login\nLogin ID: ${createdCreds.loginId}\nPassword: ${createdCreds.password}\n\nThe student can change their password after first login.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📱 Send Credentials via WhatsApp
                </a>
              )}
              <Button
                onClick={handleCloseApprove}
                className="w-full"
                variant="outline"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
