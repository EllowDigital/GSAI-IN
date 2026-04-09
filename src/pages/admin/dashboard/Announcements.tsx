import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Plus,
  Megaphone,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/spinner';
import PushNotificationHistoryPanel from '@/components/admin/PushNotificationHistoryPanel';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export default function AnnouncementsManager() {
  const queryClient = useQueryClient();
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pushScope, setPushScope] = useState<'admin' | 'student'>('student');
  const [pushUrl, setPushUrl] = useState('/student/dashboard');
  const [sendLockById, setSendLockById] = useState<Record<string, boolean>>({});

  const {
    data: announcements = [],
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  const upsertMutation = useMutation({
    mutationFn: async (ann: Partial<Announcement>) => {
      if (ann.id) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: ann.title,
            content: ann.content,
            priority: ann.priority,
            is_active: ann.is_active,
            expires_at: ann.expires_at || null,
          })
          .eq('id', ann.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert({
          title: ann.title!,
          content: ann.content!,
          priority: ann.priority || 'normal',
          is_active: ann.is_active ?? true,
          expires_at: ann.expires_at || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setModalOpen(false);
      setEditingAnn(null);
      toast.success(
        editingAnn?.id ? 'Announcement updated' : 'Announcement created'
      );
    },
    onError: (e) =>
      toast.error(
        e instanceof Error ? e.message : 'Failed to save announcement.'
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement deleted');
    },
    onError: (e) =>
      toast.error(
        e instanceof Error ? e.message : 'Failed to delete announcement.'
      ),
  });

  const sendPushMutation = useMutation({
    mutationFn: async (announcement: Announcement) => {
      const message = announcement.content.trim();
      const title = announcement.title.trim();

      const { data, error } = await supabase.functions.invoke(
        'send-push-notification',
        {
          body: {
            title,
            message,
            portal_scope: pushScope,
            url: pushUrl.trim() || undefined,
          },
        }
      );

      if (error) throw error;
      return data as {
        total?: number;
        sent?: number;
        failed?: number;
        deactivated?: number;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['push-notification-delivery-logs'],
      });

      const sent = data?.sent ?? 0;
      const failed = data?.failed ?? 0;
      const total = data?.total ?? 0;
      const deactivated = data?.deactivated ?? 0;

      toast.success(
        'Push notification sent',
        `Sent ${sent}/${total}, failed ${failed}${deactivated ? `, deactivated ${deactivated}` : ''}`
      );
    },
    onError: (e) =>
      toast.error(
        e instanceof Error ? e.message : 'Failed to send push notification.'
      ),
  });

  const handleSendPush = async (announcement: Announcement) => {
    if (sendLockById[announcement.id]) return;

    setSendLockById((prev) => ({ ...prev, [announcement.id]: true }));
    try {
      await sendPushMutation.mutateAsync(announcement);
    } finally {
      setSendLockById((prev) => ({ ...prev, [announcement.id]: false }));
    }
  };

  const cleanupSubscriptionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase.rpc(
        'clean_stale_push_subscriptions' as any,
        {
          p_inactive_days: 60,
          p_max_fail_count: 3,
        } as any
      ) as any);

      if (error) throw error;
      return Number(data || 0);
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({
        queryKey: ['push-notification-delivery-logs'],
      });
      toast.success(
        'Stale subscription cleanup complete',
        `${count} subscriptions marked inactive.`
      );
    },
    onError: (e) =>
      toast.error(
        e instanceof Error
          ? e.message
          : 'Failed to cleanup stale push subscriptions.'
      ),
  });

  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (p === 'important')
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  const activeAnnouncements = announcements.filter((item) => item.is_active);
  const urgentAnnouncements = announcements.filter(
    (item) => item.priority === 'urgent'
  );
  const now = dataUpdatedAt;
  const expiringSoon = announcements.filter((item) => {
    if (!item.expires_at) return false;
    const expiry = new Date(item.expires_at).getTime();
    const inThreeDays = now + 1000 * 60 * 60 * 24 * 3;
    return expiry >= now && expiry <= inThreeDays;
  });

  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Broadcast Center
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Announcements Hub
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Publish timely updates with clear priority levels and
                  expiration control for students.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : announcements.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Active
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : activeAnnouncements.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Urgent
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : urgentAnnouncements.length}
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
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Announcement Operations
              </h2>
              <p className="text-sm text-muted-foreground">
                Create, edit, prioritize, and retire notices shown to students.
              </p>
            </div>

            <Dialog
              open={modalOpen}
              onOpenChange={(o) => {
                setModalOpen(o);
                if (!o) setEditingAnn(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setEditingAnn(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnn?.id ? 'Edit' : 'Create'} Announcement
                  </DialogTitle>
                </DialogHeader>
                <AnnouncementForm
                  key={editingAnn?.id ?? 'new'}
                  initial={editingAnn}
                  onSubmit={(data) => upsertMutation.mutate(data)}
                  isPending={upsertMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          <Card className="border-border/70 bg-card/80">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Push Broadcast Settings
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Per-announcement push action uses these settings.
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  Free-tier optimized delivery
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Target Portal Scope</Label>
                  <Select
                    value={pushScope}
                    onValueChange={(value) =>
                      setPushScope(value as 'admin' | 'student')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Target URL</Label>
                  <Input
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    placeholder="/student/dashboard"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Published Now</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {isLoading ? '...' : activeAnnouncements.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Urgent Alerts</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {isLoading ? '...' : urgentAnnouncements.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {isLoading ? '...' : expiringSoon.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Guideline</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Keep messages short and action-oriented.
                </p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size={20} />
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Megaphone className="mx-auto mb-2 h-5 w-5" />
                No announcements yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Card
                  key={ann.id}
                  className={`border border-border/70 transition-colors hover:bg-muted/20 ${!ann.is_active ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">
                          {ann.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${priorityColor(ann.priority)}`}
                        >
                          {ann.priority}
                        </Badge>
                        {!ann.is_active && (
                          <Badge variant="secondary" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                        {ann.priority === 'urgent' && (
                          <Badge className="text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/10">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            High Alert
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                        <span className="inline-flex items-center gap-1">
                          <BellRing className="h-3 w-3" />
                          {format(new Date(ann.created_at), 'MMM d, yyyy')}
                        </span>
                        {ann.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expires{' '}
                            {format(new Date(ann.expires_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={Boolean(sendLockById[ann.id])}
                        onClick={() => {
                          void handleSendPush(ann);
                        }}
                      >
                        {sendLockById[ann.id] ? (
                          <Spinner size={14} />
                        ) : (
                          <BellRing className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Send Push</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setEditingAnn(ann);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Announcement?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this announcement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => deleteMutation.mutate(ann.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <PushNotificationHistoryPanel
            title="Push Notification Delivery Logs"
            cleanupLoading={cleanupSubscriptionsMutation.isPending}
            onCleanup={() => cleanupSubscriptionsMutation.mutate()}
          />
        </div>
      </section>
    </div>
  );
}

function AnnouncementForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial: Announcement | null;
  onSubmit: (data: Partial<Announcement>) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [priority, setPriority] = useState(initial?.priority || 'normal');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [expiresAt, setExpiresAt] = useState(
    initial?.expires_at?.split('T')[0] || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
      title: title.trim(),
      content: content.trim(),
      priority,
      is_active: isActive,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          required
        />
      </div>
      <div>
        <Label>Content *</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Announcement content..."
          rows={3}
          maxLength={1200}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {content.length}/1200
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Expires On</Label>
          <Input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label className="mb-0">Active</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : initial?.id ? 'Update' : 'Create'}
      </Button>
    </form>
  );
}
