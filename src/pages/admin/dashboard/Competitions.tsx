import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from '@/hooks/use-toast';
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
} from 'lucide-react';
import { format } from 'date-fns';
import CompetitionCertificates from '@/components/admin/CompetitionCertificates';
import CompetitionRegistrations from '@/components/admin/CompetitionRegistrations';
import { isTimeoutError, withTimeout } from '@/utils/withTimeout';

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

const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;
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

export default function Competitions() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [certOpen, setCertOpen] = useState<Competition | null>(null);
  const [regsOpen, setRegsOpen] = useState<Competition | null>(null);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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

  const mapEmbedUrl = buildMapEmbedUrl(form.location_text);
  const mapOpenUrl = form.location_text.trim() ? buildMapsOpenUrl(form.location_text) : null;

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('competitions').select('*').order('date', { ascending: false }),
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
          supabase.storage.from('gallery').upload(filename, imageFile, { upsert: true }),
          REQUEST_TIMEOUT_MS,
          'Image upload timed out.'
        );
        if (upErr) throw new Error('Image upload failed: ' + upErr.message);
        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filename);
        image_url = urlData.publicUrl;
      }
      const payload = {
        name: values.name,
        description: values.description || null,
        date: values.date,
        end_date: values.end_date || null,
        location_text: values.location_text || null,
        max_participants: values.max_participants ? parseInt(values.max_participants) : null,
        status: values.status,
        image_url: image_url || null,
      } as const;
      if (values.id) {
        const { error } = await withTimeout(supabase.from('competitions').update(payload).eq('id', values.id), REQUEST_TIMEOUT_MS, 'Updating competition timed out.');
        if (error) throw error;
      } else {
        const { error } = await withTimeout(supabase.from('competitions').insert(payload), REQUEST_TIMEOUT_MS, 'Creating competition timed out.');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success(editing ? 'Competition updated.' : 'Competition created.');
      closeForm();
    },
    onError: (e: Error) => toast.error('Failed: ' + formatError(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(supabase.from('competitions').delete().eq('id', id), REQUEST_TIMEOUT_MS, 'Deleting competition timed out.');
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
    setForm({ name: '', description: '', date: '', end_date: '', location_text: '', max_participants: '', status: 'upcoming', image_url: '' });
    setImageFile(null);
    setImagePreview(null);
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

  const filtered = competitions.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="p-3 sm:p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Competitions</h2>
          <p className="text-sm text-muted-foreground">Manage tournaments and competitions</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Competition
        </Button>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search competitions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
          <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="h-7 px-2">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="h-7 px-2">
            <Table2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No competitions found.</div>
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col border border-border">
              {c.image_url && (
                <div className="h-36 overflow-hidden rounded-t-lg">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">{c.name}</h3>
                  <Badge className={statusColors[c.status] || 'bg-muted text-muted-foreground'} variant="secondary">{c.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(c.date), 'MMM d, yyyy')}
                  {c.end_date && ` – ${format(new Date(c.end_date), 'MMM d, yyyy')}`}
                </div>
                {c.location_text && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{c.location_text}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> {regCounts[c.id] || 0} registered
                  {c.max_participants && ` / ${c.max_participants} max`}
                </div>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setRegsOpen(c)}>
                    <Users className="w-3 h-3" /> Registrations
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => openEdit(c)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setCertOpen(c)}>
                    <Award className="w-3 h-3" /> Certs
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1 text-xs" onClick={() => { if (confirm('Delete this competition?')) deleteMutation.mutate(c.id); }}>
                    <Trash2 className="w-3 h-3" />
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
                            <img src={c.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-foreground text-sm">{c.name}</p>
                            {c.description && <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(c.date), 'MMM d, yyyy')}
                        {c.end_date && <span className="text-muted-foreground"> – {format(new Date(c.end_date), 'MMM d')}</span>}
                      </TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{c.location_text || '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[c.status] || 'bg-muted text-muted-foreground'} variant="secondary">{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {regCounts[c.id] || 0}{c.max_participants ? ` / ${c.max_participants}` : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setRegsOpen(c)}>
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => openEdit(c)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setCertOpen(c)}>
                            <Award className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id); }}>
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
            <DialogTitle>{editing ? 'Edit Competition' : 'New Competition'}</DialogTitle>
            <DialogDescription>Fill in the competition details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location_text} onChange={(e) => setForm((f) => ({ ...f, location_text: e.target.value }))} placeholder="e.g. GSAI Campus, Lucknow" />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Free Google Maps embed preview</span>
                {mapOpenUrl && (
                  <a href={mapOpenUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:opacity-80">
                    Open map <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {mapEmbedUrl && (
                <div className="mt-2 overflow-hidden rounded-md border border-border">
                  <iframe title="Competition location preview" src={mapEmbedUrl} className="w-full h-48" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input type="number" value={form.max_participants} onChange={(e) => setForm((f) => ({ ...f, max_participants: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              {imagePreview ? (
                <div className="relative mt-1 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Competition preview" className="w-full h-32 object-cover" loading="lazy" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm((f) => ({ ...f, image_url: '' })); }} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }} />
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                </label>
              )}
            </div>
            <Button type="submit" disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? <Spinner size={16} /> : editing ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {certOpen && (
        <CompetitionCertificates competition={certOpen} open={!!certOpen} onOpenChange={(open) => { if (!open) setCertOpen(null); }} />
      )}
      {regsOpen && (
        <CompetitionRegistrations competition={regsOpen} open={!!regsOpen} onOpenChange={(open) => { if (!open) setRegsOpen(null); }} />
      )}
    </div>
  );
}
