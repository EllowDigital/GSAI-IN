import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/useToast';
import Spinner from '@/components/ui/spinner';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Award,
  Search,
  ImageIcon,
  X,
  ExternalLink,
  Grid3X3,
  Table2,
  Trophy,
  CheckCircle2,
  Sparkles,
  Clock3,
} from 'lucide-react';
import { format } from 'date-fns';
import CompetitionCertificates from '@/components/admin/CompetitionCertificates';
import CompetitionRegistrations from '@/components/admin/CompetitionRegistrations';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';
import {
  openManualWhatsAppBroadcast,
  sendQueuedAnnouncement,
} from '@/utils/studentCommunication';
import { Checkbox } from '@/components/ui/checkbox';
import AnnouncementDeliveryLogs from '@/components/admin/AnnouncementDeliveryLogs';
import { usePersistentState } from '@/hooks/usePersistentState';

interface Competition {
  id: string;
  name: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  max_participants: number | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
] as const;
const REQUEST_TIMEOUT_MS = 15000;

const statusColors: Record<string, string> = {
  upcoming: 'bg-primary/10 text-primary',
  ongoing: 'bg-accent text-accent-foreground',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const buildMapEmbedUrl = (locationText: string): string | null => {
  const query = locationText.trim();
  if (!query) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
};

const buildMapsOpenUrl = (locationText: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText.trim())}`;

const formatError = (error: unknown): string => {
  if (isTimeoutError(error)) return 'Connection is slow. Please try again.';
  if (error instanceof Error) return error.message;
  return 'Unexpected error occurred.';
};

const buildCompetitionWhatsAppMessage = (c: Competition): string => {
  const endDate = c.end_date ? ` to ${c.end_date}` : '';
  const location = c.location_text ? `\nLocation: ${c.location_text}` : '';
  const description = c.description ? `\n${c.description}` : '';

  return [
    `*${c.name}*`,
    `Date: ${c.date}${endDate}`,
    location,
    description,
    '',
    'Shared by Ghatak Sports Academy India',
  ]
    .filter(Boolean)
    .join('\n');
};

export default function Competitions() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [certOpen, setCertOpen] = useState<Competition | null>(null);
  const [regsOpen, setRegsOpen] = useState<Competition | null>(null);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    end_date: '',
    location_text: '',
    max_participants: '',
    status: 'upcoming',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [prepareWhatsAppMessage, setPrepareWhatsAppMessage] = useState(true);

  const mapEmbedUrl = buildMapEmbedUrl(form.location_text);
  const mapOpenUrl = form.location_text.trim()
    ? buildMapsOpenUrl(form.location_text)
    : null;

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('competitions')
          .select('*')
          .order('date', { ascending: false }),
        REQUEST_TIMEOUT_MS,
        'Loading competitions timed out.'
      );
      if (error) throw error;
      return data as Competition[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      let image_url = values.image_url;
      if (imageFile) {
        const safeFileName = imageFile.name.replace(/\s+/g, '-').toLowerCase();
        const filename = `competitions/${Date.now()}-${safeFileName}`;
        const { error: upErr } = await withTimeout(
          supabase.storage
            .from('gallery')
            .upload(filename, imageFile, { upsert: true }),
          REQUEST_TIMEOUT_MS,
          'Image upload timed out.'
        );
        if (upErr) throw new Error('Image upload failed: ' + upErr.message);
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filename);
        image_url = urlData.publicUrl;
      }
      const payload = {
        name: values.name,
        description: values.description || null,
        date: values.date,
        end_date: values.end_date || null,
        location_text: values.location_text || null,
        max_participants: values.max_participants
          ? parseInt(values.max_participants)
          : null,
        status: values.status,
        image_url: image_url || null,
      } as const;
      if (values.id) {
        const { error } = await withTimeout(
          supabase.from('competitions').update(payload).eq('id', values.id),
          REQUEST_TIMEOUT_MS,
          'Updating competition timed out.'
        );
        if (error) throw error;
      } else {
        const { error } = await withTimeout(
          supabase.from('competitions').insert(payload),
          REQUEST_TIMEOUT_MS,
          'Creating competition timed out.'
        );
        if (error) throw error;
      }

      let emailStats = { total: 0, sent: 0, failed: 0 };
      if (sendEmailNotification) {
        emailStats = await sendQueuedAnnouncement({
          type: 'competition',
          title: payload.name,
          date: payload.date,
          endDate: payload.end_date,
          location: payload.location_text,
          description: payload.description,
          pageUrl: `${window.location.origin}/student/dashboard`,
        });
      }

      return emailStats;
    },
    onSuccess: (emailStats) => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success(editing ? 'Competition updated.' : 'Competition created.');
      if (emailStats.total > 0) {
        toast.success(
          `Competition email sent to ${emailStats.sent}/${emailStats.total} students${emailStats.failed ? ` (${emailStats.failed} failed)` : ''}.`
        );
      }

      if (prepareWhatsAppMessage) {
        const msg = buildCompetitionWhatsAppMessage({
          id: editing?.id || 'new',
          name: form.name,
          description: form.description || null,
          date: form.date,
          end_date: form.end_date || null,
          location_text: form.location_text || null,
          location_lat: null,
          location_lng: null,
          max_participants: form.max_participants
            ? parseInt(form.max_participants)
            : null,
          image_url: form.image_url || null,
          status: form.status,
          created_at: '',
        });
        navigator.clipboard.writeText(msg).catch(() => undefined);
        openManualWhatsAppBroadcast(msg);
      }

      closeForm();
    },
    onError: (e: Error) => toast.error('Failed: ' + formatError(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase.from('competitions').delete().eq('id', id),
        REQUEST_TIMEOUT_MS,
        'Deleting competition timed out.'
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Competition deleted.');
    },
    onError: (e: Error) => toast.error('Failed: ' + formatError(e)),
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      date: '',
      end_date: '',
      location_text: '',
      max_participants: '',
      status: 'upcoming',
      image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setSendEmailNotification(true);
    setPrepareWhatsAppMessage(true);
    setFormOpen(true);
  };

  const openEdit = (c: Competition) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || '',
      date: c.date,
      end_date: c.end_date || '',
      location_text: c.location_text || '',
      max_participants: c.max_participants?.toString() || '',
      status: c.status,
      image_url: c.image_url || '',
    });
    setImageFile(null);
    setImagePreview(c.image_url || null);
    setSendEmailNotification(true);
    setPrepareWhatsAppMessage(true);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      toast.error('Name and date are required.');
      return;
    }
    saveMutation.mutate({ ...form, id: editing?.id });
  };

  const filtered = useMemo(
    () =>
      competitions.filter((c) => {
        const query = search.toLowerCase().trim();
        const searchable = `${c.name || ''} ${c.description || ''} ${c.location_text || ''}`.toLowerCase();
        const matchesSearch = query ? searchable.includes(query) : true;
        const matchesStatus =
          statusFilter === 'all' ? true : c.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [competitions, search, statusFilter]
  );

  const handleManualWhatsApp = async (competition: Competition) => {
    const message = buildCompetitionWhatsAppMessage(competition);
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Continue even if clipboard write fails.
    }

    const opened = openManualWhatsAppBroadcast(message);
    toast.success(
      opened
        ? 'WhatsApp opened. Message copied, choose recipients manually.'
        : 'Message copied. Send manually in WhatsApp.'
    );
  };

  const { data: regCounts = {} } = useQuery({
    queryKey: ['competition-reg-counts'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('competition_registrations').select('competition_id'),
        REQUEST_TIMEOUT_MS,
        'Loading registrations timed out.'
      );
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((r: { competition_id: string }) => {
        counts[r.competition_id] = (counts[r.competition_id] || 0) + 1;
      });
      return counts;
    },
  });

  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-fuchsia-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Tournament Control Center
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Competitions Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Manage tournaments, registrations, certificates, and campaign
                  announcements in one modern workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={openNew} className="gap-1.5">
                <Plus className="w-4 h-4" /> New Competition
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          {
            label: 'Total',
            value: competitions.length,
            icon: Award,
            color: 'text-primary',
          },
          {
            label: 'Upcoming',
            value: competitions.filter((c) => c.status === 'upcoming').length,
            icon: Calendar,
            color: 'text-blue-500',
          },
          {
            label: 'Ongoing',
            value: competitions.filter((c) => c.status === 'ongoing').length,
            icon: Trophy,
            color: 'text-amber-500',
          },
          {
            label: 'Completed',
            value: competitions.filter((c) => c.status === 'completed').length,
            icon: CheckCircle2,
            color: 'text-green-500',
          },
          {
            label: 'Filtered',
            value: filtered.length,
            icon: Clock3,
            color: 'text-indigo-500',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/90">
            <CardContent className="p-3 flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Competition Operations
              </h2>
              <p className="text-sm text-muted-foreground">
                Search, filter, and switch layouts for faster tournament actions.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions, details, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="admin-toggle rounded-lg justify-self-start">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-2"
              >
                <Table2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
            Showing {filtered.length} of {competitions.length} competitions.
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No competitions match current filters.
        </div>
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="group flex flex-col border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl"
            >
              {c.image_url ? (
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`${statusColors[c.status] || 'bg-muted text-muted-foreground'} text-[10px] shadow-sm`}
                      variant="secondary"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-24 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                  <Award className="w-10 h-10 text-primary/20" />
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`${statusColors[c.status] || 'bg-muted text-muted-foreground'} text-[10px]`}
                      variant="secondary"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              )}
              <CardContent className="flex-1 p-4 space-y-3">
                <h3 className="font-bold text-foreground line-clamp-2 text-base">
                  {c.name}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    {format(new Date(c.date), 'MMM d, yyyy')}
                    {c.end_date &&
                      ` — ${format(new Date(c.end_date), 'MMM d, yyyy')}`}
                  </div>
                  {c.location_text && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary/60" />{' '}
                      <span className="truncate">{c.location_text}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary/60" />{' '}
                    {regCounts[c.id] || 0} registered
                    {c.max_participants && ` / ${c.max_participants} max`}
                  </div>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 text-xs h-8"
                    onClick={() => handleManualWhatsApp(c)}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-xs h-8"
                    onClick={() => setRegsOpen(c)}
                  >
                    <Users className="w-3 h-3" /> Registrations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs h-8"
                    onClick={() => setCertOpen(c)}
                  >
                    <Award className="w-3 h-3" /> Certs
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Delete this competition?'))
                        deleteMutation.mutate(c.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5" /> Competitions Table
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {c.image_url && (
                            <img
                              src={c.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {c.name}
                            </p>
                            {c.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(c.date), 'MMM d, yyyy')}
                        {c.end_date && (
                          <span className="text-muted-foreground">
                            {' '}
                            – {format(new Date(c.end_date), 'MMM d')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">
                        {c.location_text || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[c.status] ||
                            'bg-muted text-muted-foreground'
                          }
                          variant="secondary"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {regCounts[c.id] || 0}
                        {c.max_participants ? ` / ${c.max_participants}` : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleManualWhatsApp(c)}
                          >
                            WA
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setRegsOpen(c)}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setCertOpen(c)}
                          >
                            <Award className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Delete?'))
                                deleteMutation.mutate(c.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Competition' : 'New Competition'}
            </DialogTitle>
            <DialogDescription>
              Fill in the competition details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={form.location_text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_text: e.target.value }))
                }
                placeholder="e.g. GSAI Campus, Lucknow"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Free Google Maps embed preview</span>
                {mapOpenUrl && (
                  <a
                    href={mapOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:opacity-80"
                  >
                    Open map <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {mapEmbedUrl && (
                <div className="mt-2 overflow-hidden rounded-md border border-border">
                  <iframe
                    title="Competition location preview"
                    src={mapEmbedUrl}
                    className="w-full h-48"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, max_participants: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              {imagePreview ? (
                <div className="relative mt-1 rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Competition preview"
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setForm((f) => ({ ...f, image_url: '' }));
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload image
                  </span>
                </label>
              )}
            </div>
            <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="competition-send-email-toggle"
                  checked={sendEmailNotification}
                  onCheckedChange={(checked) =>
                    setSendEmailNotification(Boolean(checked))
                  }
                />
                <label
                  htmlFor="competition-send-email-toggle"
                  className="text-sm font-medium"
                >
                  Send Email Notification: On/Off
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="competition-prepare-whatsapp-toggle"
                  checked={prepareWhatsAppMessage}
                  onCheckedChange={(checked) =>
                    setPrepareWhatsAppMessage(Boolean(checked))
                  }
                />
                <label
                  htmlFor="competition-prepare-whatsapp-toggle"
                  className="text-sm font-medium"
                >
                  Prepare WhatsApp Message: On/Off
                </label>
              </div>
            </div>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending ? (
                <Spinner size={16} />
              ) : editing ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {certOpen && (
        <CompetitionCertificates
          competition={certOpen}
          open={!!certOpen}
          onOpenChange={(open) => {
            if (!open) setCertOpen(null);
          }}
        />
      )}
      {regsOpen && (
        <CompetitionRegistrations
          competition={regsOpen}
          open={!!regsOpen}
          onOpenChange={(open) => {
            if (!open) setRegsOpen(null);
          }}
        />
      )}

      <AnnouncementDeliveryLogs
        typeFilter="competition"
        title="Competition Campaign Delivery Logs"
      />
    </div>
  );
}
