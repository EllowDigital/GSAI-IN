import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Award,
  Layers,
  GripVertical,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

interface Discipline {
  id: string;
  name: string;
  type: 'belt' | 'level';
  has_stripes: boolean;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export default function DisciplinesManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Discipline | null>(null);
  const [editing, setEditing] = useState<Discipline | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'belt' | 'level'>('belt');
  const [hasStripes, setHasStripes] = useState(false);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const { data: disciplines = [], isLoading } = useQuery({
    queryKey: ['disciplines-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disciplines')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Discipline[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Partial<Discipline> & { id?: string }) => {
      if (payload.id) {
        const { error } = await supabase
          .from('disciplines')
          .update({
            name: payload.name,
            type: payload.type,
            has_stripes: payload.has_stripes,
            description: payload.description,
            is_active: payload.is_active,
            display_order: payload.display_order,
          })
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('disciplines').insert({
          name: payload.name!,
          type: payload.type!,
          has_stripes: payload.has_stripes ?? false,
          description: payload.description,
          is_active: payload.is_active ?? true,
          display_order: payload.display_order ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplines-admin'] });
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
      toast.success(editing ? 'Discipline updated' : 'Discipline added');
      closeForm();
    },
    onError: (err) =>
      toast.error(getFriendlySupabaseMessage(err, 'Failed')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('disciplines')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplines-admin'] });
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
      toast.success('Discipline deleted');
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(getFriendlySupabaseMessage(err, 'Delete failed')),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from('disciplines')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplines-admin'] });
      queryClient.invalidateQueries({ queryKey: ['disciplines'] });
    },
    onError: (err) =>
      toast.error(getFriendlySupabaseMessage(err, 'Update failed')),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setName('');
    setType('belt');
    setHasStripes(false);
    setDescription('');
    setIsActive(true);
    setDisplayOrder(0);
  };

  const openEdit = (d: Discipline) => {
    setEditing(d);
    setName(d.name);
    setType(d.type);
    setHasStripes(d.has_stripes);
    setDescription(d.description || '');
    setIsActive(d.is_active);
    setDisplayOrder(d.display_order);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setType('belt');
    setHasStripes(false);
    setDescription('');
    setIsActive(true);
    setDisplayOrder(disciplines.length);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    upsertMutation.mutate({
      id: editing?.id,
      name: name.trim(),
      type,
      has_stripes: hasStripes,
      description: description.trim() || null,
      is_active: isActive,
      display_order: displayOrder,
    });
  };

  const beltDisciplines = disciplines.filter((d) => d.type === 'belt');
  const levelDisciplines = disciplines.filter((d) => d.type === 'level');

  return (
    <div className="space-y-5">
      <div className="admin-panel border-border/70 bg-gradient-to-r from-slate-50 to-background">
        <div className="admin-panel-body space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary/90" />
                Disciplines
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Manage all martial arts disciplines — add, rename, delete, or
                toggle active status
              </p>
            </div>
            <Button
              size="sm"
              onClick={openCreate}
              className="h-9 gap-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Add Discipline
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Belt-based */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Belt-Based Disciplines
                <Badge variant="secondary" className="ml-auto">
                  {beltDisciplines.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {beltDisciplines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No belt-based disciplines
                </p>
              ) : (
                beltDisciplines.map((d) => (
                  <DisciplineRow
                    key={d.id}
                    discipline={d}
                    onEdit={() => openEdit(d)}
                    onDelete={() => setDeleteTarget(d)}
                    onToggleActive={(active) =>
                      toggleActiveMutation.mutate({
                        id: d.id,
                        is_active: active,
                      })
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Level-based */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Level-Based Disciplines
                <Badge variant="secondary" className="ml-auto">
                  {levelDisciplines.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {levelDisciplines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No level-based disciplines
                </p>
              ) : (
                levelDisciplines.map((d) => (
                  <DisciplineRow
                    key={d.id}
                    discipline={d}
                    onEdit={() => openEdit(d)}
                    onDelete={() => setDeleteTarget(d)}
                    onToggleActive={(active) =>
                      toggleActiveMutation.mutate({
                        id: d.id,
                        is_active: active,
                      })
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Discipline' : 'Add Discipline'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update discipline details.'
                : 'Add a new martial arts discipline.'}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taekwondo"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as 'belt' | 'level')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belt">Belt-Based</SelectItem>
                  <SelectItem value="level">Level-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'belt' && (
              <div className="flex items-center justify-between">
                <Label>Supports Stripes (BJJ-style)</Label>
                <Switch checked={hasStripes} onCheckedChange={setHasStripes} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discipline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This won't
              remove associated belts or levels from the database, but the
              discipline entry will be gone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DisciplineRow({
  discipline,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  discipline: {
    id: string;
    name: string;
    type: string;
    has_stripes: boolean;
    description: string | null;
    is_active: boolean;
    display_order: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 transition-colors ${discipline.is_active ? 'bg-muted/20 hover:bg-muted/40' : 'bg-muted/5 opacity-60'}`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
      <Badge
        variant="outline"
        className="text-xs px-2 py-0.5 font-mono flex-shrink-0"
      >
        #{discipline.display_order}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {discipline.name}
          </p>
          {discipline.has_stripes && (
            <Badge variant="secondary" className="text-[10px]">
              Stripes
            </Badge>
          )}
          {!discipline.is_active && (
            <Badge
              variant="outline"
              className="text-[10px] text-muted-foreground"
            >
              Inactive
            </Badge>
          )}
        </div>
        {discipline.description && (
          <p className="text-xs text-muted-foreground truncate">
            {discipline.description}
          </p>
        )}
      </div>
      <Switch
        checked={discipline.is_active}
        onCheckedChange={onToggleActive}
        className="flex-shrink-0"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
