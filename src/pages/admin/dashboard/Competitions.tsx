import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { Plus, Pencil, Trash2, MapPin, Calendar, Users, Award, Upload, Search, ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import CompetitionCertificates from '@/components/admin/CompetitionCertificates';

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

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-600',
  ongoing: 'bg-green-500/10 text-green-600',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Competitions() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [certOpen, setCertOpen] = useState<Competition | null>(null);
  const [editing, setEditing] = useState<Competition | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', date: '', end_date: '', location_text: '',
    max_participants: '', status: 'upcoming', image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Competition[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      let image_url = values.image_url;

      // Upload image file if selected
      if (imageFile) {
        const filename = `competitions/${Date.now()}-${imageFile.name}`;
        const { error: upErr } = await supabase.storage.from('gallery').upload(filename, imageFile, { upsert: true });
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
      } as any;

      if (values.id) {
        const { error } = await supabase.from('competitions').update(payload).eq('id', values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('competitions').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success(editing ? 'Competition updated.' : 'Competition created.');
      closeForm();
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('competitions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Competition deleted.');
    },
    onError: (e: Error) => toast.error('Failed: ' + e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', date: '', end_date: '', location_text: '', max_participants: '', status: 'upcoming', image_url: '' });
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
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      toast.error('Name and date are required.');
      return;
    }
    saveMutation.mutate({ ...form, id: editing?.id });
  };

  const filtered = competitions.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Registration counts query
  const { data: regCounts = {} } = useQuery({
    queryKey: ['competition-reg-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_registrations')
        .select('competition_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((r: any) => { counts[r.competition_id] = (counts[r.competition_id] || 0) + 1; });
      return counts;
    },
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Competitions</h2>
          <p className="text-sm text-muted-foreground">Manage tournaments and competitions</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Competition
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search competitions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No competitions found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <Card key={c.id} className="flex flex-col border border-border">
              {c.image_url && (
                <div className="h-36 overflow-hidden rounded-t-lg">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">{c.name}</h3>
                  <Badge className={statusColors[c.status] || 'bg-muted text-muted-foreground'} variant="secondary">
                    {c.status}
                  </Badge>
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

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => openEdit(c)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setCertOpen(c)}>
                    <Award className="w-3 h-3" /> Certs
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1 text-xs" onClick={() => {
                    if (confirm('Delete this competition?')) deleteMutation.mutate(c.id);
                  }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location_text} onChange={e => setForm(f => ({ ...f, location_text: e.target.value }))} placeholder="e.g. GSAI Campus, Lucknow" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? <Spinner size={16} /> : editing ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificates Modal */}
      {certOpen && (
        <CompetitionCertificates
          competition={certOpen}
          open={!!certOpen}
          onOpenChange={(open) => { if (!open) setCertOpen(null); }}
        />
      )}
    </div>
  );
}
