import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
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
import { toast } from '@/hooks/useToast';
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
  RefreshCw,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { createWhatsAppUrl, openWhatsAppConversation } from '@/utils/whatsapp';
import {
  buildEnrollmentPortalMessage,
  buildEnrollmentRejectedMessage,
  buildEnrollmentStageMessage,
  getEnrollmentStageActionLabel,
  type EnrollmentMessageStage,
} from '@/utils/enrollmentMessages';

interface EnrollmentRequest {
  id: string;
  student_name: string;
  age: number;
  gender: string;
  parent_name: string;
  parent_email: string | null;
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
  linked_student_id?: string | null;
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

const resolveEnrollmentMessageStage = (
  status: string
): EnrollmentMessageStage => {
  switch (status) {
    case 'contacted':
      return 'contacted';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'pending':
    default:
      return 'pending';
  }
};

function normalizeEmail(value?: string | null): string {
  const trimmed = (value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : '';
}

function resolveEnrollmentRecipientEmail(req: EnrollmentRequest): string {
  return normalizeEmail(req.student_email) || normalizeEmail(req.parent_email);
}

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
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    loginId: string;
    defaultPassword: string;
    portalUrl: string;
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
    staleTime: 10_000,
    gcTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const buildMessagePayload = (req: EnrollmentRequest, notes?: string) => ({
    parentName: req.parent_name,
    parentPhone: req.parent_phone,
    studentName: req.student_name,
    age: req.age,
    gender: req.gender,
    program: req.program,
    studentEmail: req.student_email,
    studentPhone: req.student_phone,
    notes,
  });

  // Send rejection notification via WhatsApp + email
  const sendRejectionNotification = async (
    req: EnrollmentRequest,
    notes: string
  ) => {
    const message = buildEnrollmentRejectedMessage(
      buildMessagePayload(req, notes)
    );

    const didOpenWhatsApp = openWhatsAppConversation(req.parent_phone, message);

    const recipientEmail = resolveEnrollmentRecipientEmail(req);

    // Send email if a valid student/parent email exists.
    if (recipientEmail) {
      try {
        const { sendEmail, buildEnrollmentRejectedEmail } =
          await import('@/utils/resendEmail');
        const emailPayload = buildEnrollmentRejectedEmail({
          parentName: req.parent_name,
          studentName: req.student_name,
          program: req.program,
          gender: req.gender,
          notes,
        });
        const emailSent = await sendEmail({
          ...emailPayload,
          to: recipientEmail,
        });

        if (didOpenWhatsApp && emailSent) {
          toast.success('Rejection sent via WhatsApp and email');
          return;
        }

        if (didOpenWhatsApp || emailSent) {
          toast.warning(
            didOpenWhatsApp
              ? 'WhatsApp sent, but email failed.'
              : 'Email sent, but WhatsApp could not open.'
          );
          return;
        }

        toast.error('Both WhatsApp and email failed. Please retry.');
      } catch (error) {
        console.error('Failed to send rejection notifications:', error);
        toast.error(
          didOpenWhatsApp
            ? 'WhatsApp sent, but email failed unexpectedly.'
            : 'Both WhatsApp and email failed.'
        );
      }
    } else {
      (didOpenWhatsApp ? toast.success : toast.error)(
        didOpenWhatsApp
          ? 'No valid email found. Sent via WhatsApp only.'
          : 'WhatsApp could not open for this number'
      );
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      toast.success('Request updated');

      const req = requests.find((r) => r.id === data.id);
      if (req) {
        const stage = resolveEnrollmentMessageStage(data.status);

        if (stage === 'rejected') {
          await sendRejectionNotification(req, data.notes || '');
          setViewReq(null);
          return;
        }

        const recipientEmail = resolveEnrollmentRecipientEmail(req);

        // Send email if student email exists, otherwise fallback to parent email-like value.
        if (recipientEmail) {
          try {
            const { sendEmail, buildEnrollmentStageEmail } =
              await import('@/utils/resendEmail');
            const emailPayload = buildEnrollmentStageEmail(stage, {
              parentName: req.parent_name,
              studentName: req.student_name,
              program: req.program,
              portalUrl: `${window.location.origin}/student/login`,
              gender: req.gender,
              notes: data.notes,
            });
            const sent = await sendEmail({
              ...emailPayload,
              to: recipientEmail,
            });
            if (!sent) {
              console.error('Email send failed for enrollment update', {
                requestId: req.id,
                stage,
              });
            }
          } catch (error) {
            console.error('Email send failed for enrollment update', error);
          }
        } else {
          toast.info(
            'No valid email found for this enrollment. Use WhatsApp only.'
          );
        }
      }
      setViewReq(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (req: EnrollmentRequest) => {
      if (req.status !== 'approved') {
        const { error } = (await supabase
          .from('enrollment_requests' as any)
          .delete()
          .eq('id', req.id)) as any;
        if (error) throw error;
        return;
      }

      let linkedStudentId = req.linked_student_id || null;

      if (!linkedStudentId && req.aadhar_number) {
        const { data: matchedStudent, error: studentLookupError } =
          await supabase
            .from('students')
            .select('id')
            .eq('aadhar_number', req.aadhar_number)
            .maybeSingle();

        if (studentLookupError) throw studentLookupError;
        linkedStudentId = matchedStudent?.id ?? null;
      }

      if (!linkedStudentId) {
        throw new Error(
          'Approved request is not linked to a student record. Delete student from Student Management first.'
        );
      }

      const { data, error } = await supabase.functions.invoke(
        'delete-student-account',
        {
          body: {
            student_id: linkedStudentId,
            enrollment_request_id: req.id,
          },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({
        queryKey: ['discipline-progress-admin'],
      });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
      queryClient.invalidateQueries({ queryKey: ['students-portal-status'] });
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['belt-exam-notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['competition-registrations'],
      });
      queryClient.invalidateQueries({ queryKey: ['competition-certificates'] });
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
          parent_email: approveReq.parent_email,
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
          linked_student_id: student.id,
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
    if (!createdStudentId || !loginId.trim()) {
      toast.error('Login ID is required');
      return;
    }
    setApproving(true);
    try {
      const portalUrl = `${window.location.origin}/student/login`;
      const { data, error } = await supabase.functions.invoke(
        'create-student-account',
        {
          body: {
            student_id: createdStudentId,
            login_id: loginId.trim(),
          },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.default_password) {
        throw new Error(
          'Account created but default password was not returned.'
        );
      }

      setCreatedCreds({
        loginId: loginId.trim(),
        defaultPassword: data.default_password,
        portalUrl,
      });
      setApproveStep('done');
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['students-without-portal'] });
      toast.success('Portal account created!');

      const recipientEmail = approveReq
        ? resolveEnrollmentRecipientEmail(approveReq)
        : '';

      // Send portal credentials via email if student/parent email exists.
      if (recipientEmail) {
        try {
          const { sendEmail, buildPortalCredentialsEmail } =
            await import('@/utils/resendEmail');
          const emailPayload = buildPortalCredentialsEmail({
            parentName: approveReq.parent_name,
            studentName: approveReq.student_name,
            program: approveReq.program,
            loginId: loginId.trim(),
            portalUrl,
            defaultPassword: data.default_password,
            gender: approveReq.gender,
          });
          const sent = await sendEmail({
            ...emailPayload,
            to: recipientEmail,
          });
          if (!sent) {
            toast.warning(
              'Portal account created, but the email could not be sent.'
            );
          }
        } catch (error) {
          console.error('Failed to send portal credentials email:', error);
          toast.warning(
            'Portal account created, but credentials email failed.'
          );
        }
      } else {
        toast.info(
          'Portal account created. No valid email found, share credentials via WhatsApp only.'
        );
      }
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed. Please copy manually.');
    }
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
  const contactedCount = requests.filter(
    (r) => r.status === 'contacted'
  ).length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const currentWhatsAppStage = viewReq
    ? resolveEnrollmentMessageStage(viewReq.status)
    : 'pending';

  const currentWhatsAppMessage = viewReq
    ? buildEnrollmentStageMessage(
        currentWhatsAppStage,
        buildMessagePayload(
          viewReq,
          adminNotes.trim() || viewReq.admin_notes || undefined
        )
      )
    : '';

  const currentWhatsAppLabel = viewReq
    ? getEnrollmentStageActionLabel(currentWhatsAppStage)
    : 'WhatsApp Parent';

  const parentWhatsAppUrl = viewReq
    ? createWhatsAppUrl(viewReq.parent_phone, currentWhatsAppMessage)
    : null;

  const credentialsMessage =
    approveReq && createdCreds
      ? buildEnrollmentPortalMessage({
          ...buildMessagePayload(approveReq),
          loginId: createdCreds.loginId,
          defaultPassword: createdCreds.defaultPassword,
          portalUrl: createdCreds.portalUrl,
        })
      : '';

  const credentialsWhatsAppUrl = approveReq
    ? createWhatsAppUrl(approveReq.parent_phone, credentialsMessage)
    : null;

  return (
    <div className="admin-page">
      <section className="admin-panel overflow-hidden">
        <div className="admin-panel-body bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
                <UserPlus className="h-5 w-5 text-primary" /> Enrollment
                Requests
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review requests, approve admissions, and create student login
                credentials in one workflow.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['enrollment-requests'],
                  })
                }
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-foreground">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Contacted</p>
              <p className="text-lg font-semibold text-foreground">
                {contactedCount}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Approved</p>
              <p className="text-lg font-semibold text-foreground">
                {approvedCount}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Rejected</p>
              <p className="text-lg font-semibold text-foreground">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, parent, or program"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'pending', 'contacted', 'approved', 'rejected'].map(
                (s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className="h-8 text-xs capitalize"
                  >
                    {s === 'all' ? 'All' : s}
                    {s === 'pending' && pendingCount > 0 && (
                      <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                        {pendingCount}
                      </span>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size={20} />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-border/70">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {requests.length === 0
                  ? 'No enrollment requests yet. Share the enrollment form on your website.'
                  : 'No requests match your current search and filters.'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => {
                const config =
                  STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                return (
                  <Card
                    key={req.id}
                    className="border-border/70 transition-all hover:border-primary/25 hover:shadow-sm"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground sm:text-base">
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

                          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" /> {req.parent_name}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {req.parent_phone}
                            </span>
                            <span>
                              Age {req.age} • {req.gender}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />{' '}
                              {format(new Date(req.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>

                          {req.admin_notes && (
                            <div className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                              Note: {req.admin_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => {
                              setViewReq(req);
                              setAdminNotes(req.admin_notes || '');
                            }}
                          >
                            <Eye className="w-3 h-3" /> View
                          </Button>

                          {req.status !== 'approved' &&
                            req.status !== 'rejected' && (
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 text-xs hover:bg-green-700"
                                onClick={() => handleStartApprove(req)}
                              >
                                <Check className="w-3 h-3" /> Approve & Add
                              </Button>
                            )}

                          {req.status === 'approved' && (
                            <Badge
                              variant="outline"
                              className="h-7 border-green-500/30 bg-green-500/5 px-2 text-[10px] text-green-600"
                            >
                              ✓ Approved
                            </Badge>
                          )}

                          {req.status === 'rejected' && (
                            <Badge
                              variant="outline"
                              className="h-7 border-red-500/30 bg-red-500/5 px-2 text-[10px] text-red-600"
                            >
                              ✗ Rejected
                            </Badge>
                          )}

                          {req.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-xs"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: req.id,
                                    status: 'contacted',
                                  })
                                }
                              >
                                <Phone className="w-3 h-3" /> Contact
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 gap-1 text-xs"
                                onClick={() => {
                                  setViewReq(req);
                                  setAdminNotes(req.admin_notes || '');
                                }}
                              >
                                <X className="w-3 h-3" /> Reject
                              </Button>
                            </>
                          )}

                          {req.status === 'contacted' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 gap-1 text-xs"
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
                                <AlertDialogTitle>
                                  Delete Request?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Permanently remove this enrollment request. If
                                  it is approved, the linked student profile,
                                  login credentials, progression, fees, and all
                                  related records will also be deleted forever.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => deleteMutation.mutate(req)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog
        open={!!viewReq}
        onOpenChange={(o) => {
          if (!o) setViewReq(null);
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden p-0">
          <div className="max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
              <DialogTitle>Enrollment Request</DialogTitle>
              <DialogDescription>
                Review the request, notes, and parent communication from one
                simple screen.
              </DialogDescription>
            </DialogHeader>
            {viewReq && (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid gap-3 text-sm [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                  <div>
                    <p className="text-xs text-muted-foreground">Student</p>
                    <p className="font-medium">{viewReq.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Age / Gender
                    </p>
                    <p className="font-medium">
                      {viewReq.age} yrs • {viewReq.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Parent</p>
                    <p className="font-medium">{viewReq.parent_name}</p>
                  </div>
                  {viewReq.parent_email && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Parent Email
                      </p>
                      <a
                        href={`mailto:${viewReq.parent_email}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {viewReq.parent_email}
                      </a>
                    </div>
                  )}
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
                <div className="rounded-xl border border-border bg-card p-4">
                  <label className="text-xs font-medium text-muted-foreground">
                    Admin Notes
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes (required for rejection)..."
                    rows={3}
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
                        className="gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
                    ✅ This enrollment has been approved. Student has been
                    added.
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
                {parentWhatsAppUrl ? (
                  <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                    <a
                      href={parentWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      📱 {currentWhatsAppLabel}
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => copyToClipboard(currentWhatsAppMessage)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy Text
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => copyToClipboard(viewReq.parent_phone)}
                    >
                      <Phone className="w-4 h-4 mr-2" /> Copy Parent Number
                    </Button>
                  </div>
                ) : (
                  <div className="block w-full text-center py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                    Parent phone number is invalid for WhatsApp
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve & Add Student Flow */}
      <Dialog
        open={!!approveReq}
        onOpenChange={(o) => {
          if (!o) handleCloseApprove();
        }}
      >
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
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
                className="w-full"
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
              <p className="text-xs text-muted-foreground">
                Student will sign in using default password{' '}
                <span className="font-medium">GSAI-STUDENT-2026</span> and then
                update password from student portal.
              </p>
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
                    <span className="text-muted-foreground">
                      Default Password:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-foreground">
                        {createdCreds.defaultPassword}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(createdCreds.defaultPassword)
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share these credentials privately. Student must change the
                  default password after first sign-in.
                </p>
              </div>
              {approveReq && credentialsWhatsAppUrl && (
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                  <a
                    href={credentialsWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    📱 Send Portal Details
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(credentialsMessage)}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(approveReq.parent_phone)}
                  >
                    <Phone className="w-4 h-4 mr-2" /> Copy Parent Number
                  </Button>
                </div>
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
