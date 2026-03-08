import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { UserPlus, Search, Eye, Check, X, Clock, Trash2, Phone, User } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface EnrollmentRequest {
  id: string;
  student_name: string;
  age: number;
  gender: string;
  parent_name: string;
  parent_phone: string;
  program: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  approved: { label: 'Approved', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  contacted: { label: 'Contacted', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
};

export default function EnrollmentRequestsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewReq, setViewReq] = useState<EnrollmentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['enrollment-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollment_requests' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any;
      if (error) throw error;
      return (data || []) as EnrollmentRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('enrollment_requests' as any)
        .update({
          status,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', id) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      toast.success('Request updated');
      setViewReq(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enrollment_requests' as any)
        .delete()
        .eq('id', id) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
      toast.success('Request deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = requests.filter(r => {
    const matchSearch = r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.parent_name.toLowerCase().includes(search.toLowerCase()) ||
      r.program.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full min-h-full p-3 sm:p-4 lg:p-6 xl:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Enrollment Requests
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">{pendingCount} new</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Review and manage enrollment requests from the website</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or program..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'contacted', 'approved', 'rejected'].map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="text-xs h-8 capitalize"
            >
              {s === 'all' ? 'All' : s}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size={20} /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">
          {requests.length === 0 ? 'No enrollment requests yet.' : 'No requests match your filters.'}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            return (
              <Card key={req.id} className="border border-border hover:border-border/80 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">{req.student_name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${config.className}`}>{config.label}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{req.program}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {req.parent_name}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.parent_phone}</span>
                      <span>Age: {req.age} • {req.gender}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(req.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1" onClick={() => { setViewReq(req); setAdminNotes(req.admin_notes || ''); }}>
                      <Eye className="w-3 h-3" /> View
                    </Button>
                    {req.status === 'pending' && (
                      <>
                        <Button size="sm" className="text-xs h-8 gap-1 bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id: req.id, status: 'contacted' })}>
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" className="text-xs h-8 gap-1" onClick={() => updateMutation.mutate({ id: req.id, status: 'rejected' })}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                          <AlertDialogDescription>Permanently remove this enrollment request.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteMutation.mutate(req.id)}>Delete</AlertDialogAction>
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
      <Dialog open={!!viewReq} onOpenChange={(o) => { if (!o) setViewReq(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enrollment Request</DialogTitle>
          </DialogHeader>
          {viewReq && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Student</p><p className="font-medium">{viewReq.student_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Age / Gender</p><p className="font-medium">{viewReq.age} yrs • {viewReq.gender}</p></div>
                <div><p className="text-xs text-muted-foreground">Parent</p><p className="font-medium">{viewReq.parent_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${viewReq.parent_phone}`} className="font-medium text-primary hover:underline">{viewReq.parent_phone}</a>
                </div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Program</p><p className="font-medium">{viewReq.program}</p></div>
                {viewReq.message && (
                  <div className="col-span-2"><p className="text-xs text-muted-foreground">Message</p><p className="font-medium">{viewReq.message}</p></div>
                )}
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Submitted</p><p className="font-medium">{format(new Date(viewReq.created_at), 'PPp')}</p></div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Admin Notes</label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes..." rows={2} className="mt-1" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => updateMutation.mutate({ id: viewReq.id, status: 'contacted', notes: adminNotes })}>
                  <Phone className="w-3 h-3" /> Mark Contacted
                </Button>
                <Button size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id: viewReq.id, status: 'approved', notes: adminNotes })}>
                  <Check className="w-3 h-3" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => updateMutation.mutate({ id: viewReq.id, status: 'rejected', notes: adminNotes })}>
                  <X className="w-3 h-3" /> Reject
                </Button>
              </div>

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
    </div>
  );
}
