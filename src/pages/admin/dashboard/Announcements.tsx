import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from '@/hooks/use-toast';
import { Plus, Megaphone, Pencil, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/spinner';

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

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
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
    onError: (e: Error) => toast.error(e.message),
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
    onError: (e: Error) => toast.error(e.message),
  });

  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (p === 'important')
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <div className="w-full min-h-full p-3 sm:p-4 lg:p-6 xl:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage notices visible to students
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
              <Plus className="w-4 h-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAnn?.id ? 'Edit' : 'Create'} Announcement
              </DialogTitle>
            </DialogHeader>
            <AnnouncementForm
              initial={editingAnn}
              onSubmit={(data) => upsertMutation.mutate(data)}
              isPending={upsertMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={20} />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No announcements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card
              key={ann.id}
              className={`border ${!ann.is_active ? 'opacity-50' : ''}`}
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
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ann.content}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span>
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingAnn(ann);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
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
                        >
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
    if (!title.trim() || !content.trim()) return;
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
          required
        />
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
