import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Pencil,
  Trash2,
  Layers,
  GripVertical,
  Loader2,
  Search,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { LEVEL_DISCIPLINES } from '@/config/disciplineConfig';

interface DisciplineLevel {
  id: string;
  discipline: string;
  level_name: string;
  level_order: number;
  description: string | null;
  requirements: Record<string, unknown> | null;
}

export default function DisciplineLevelsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DisciplineLevel | null>(null);
  const [editingLevel, setEditingLevel] = useState<DisciplineLevel | null>(null);

  // Form state
  const [discipline, setDiscipline] = useState('');
  const [levelName, setLevelName] = useState('');
  const [levelOrder, setLevelOrder] = useState(0);
  const [description, setDescription] = useState('');

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['discipline-levels-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discipline_levels')
        .select('id, discipline, level_name, level_order, description, requirements')
        .order('discipline', { ascending: true })
        .order('level_order', { ascending: true });
      if (error) throw error;
      return (data || []) as DisciplineLevel[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      discipline: string;
      level_name: string;
      level_order: number;
      description: string | null;
    }) => {
      if (payload.id) {
        const { error } = await supabase
          .from('discipline_levels')
          .update({
            discipline: payload.discipline,
            level_name: payload.level_name,
            level_order: payload.level_order,
            description: payload.description,
          })
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discipline_levels')
          .insert({
            discipline: payload.discipline,
            level_name: payload.level_name,
            level_order: payload.level_order,
            description: payload.description,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-levels-admin'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-levels'] });
      toast.success(editingLevel ? 'Level updated' : 'Level created');
      closeForm();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discipline_levels')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipline-levels-admin'] });
      queryClient.invalidateQueries({ queryKey: ['discipline-levels'] });
      toast.success('Level deleted');
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Delete failed'),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingLevel(null);
    setDiscipline('');
    setLevelName('');
    setLevelOrder(0);
    setDescription('');
  };

  const openCreate = () => {
    setEditingLevel(null);
    setDiscipline(filterDiscipline !== 'all' ? filterDiscipline : '');
    setLevelName('');
    // Auto-set next order number
    const currentMax =
      levels
        .filter(
          (l) =>
            filterDiscipline === 'all' || l.discipline === filterDiscipline
        )
        .reduce((max, l) => Math.max(max, l.level_order), -1) + 1;
    setLevelOrder(currentMax);
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (level: DisciplineLevel) => {
    setEditingLevel(level);
    setDiscipline(level.discipline);
    setLevelName(level.level_name);
    setLevelOrder(level.level_order);
    setDescription(level.description || '');
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discipline || !levelName.trim()) {
      toast.error('Discipline and level name are required');
      return;
    }
    upsertMutation.mutate({
      id: editingLevel?.id,
      discipline,
      level_name: levelName.trim(),
      level_order: levelOrder,
      description: description.trim() || null,
    });
  };

  // Group levels by discipline
  const grouped = levels.reduce(
    (acc, level) => {
      if (!acc[level.discipline]) acc[level.discipline] = [];
      acc[level.discipline].push(level);
      return acc;
    },
    {} as Record<string, DisciplineLevel[]>
  );

  const disciplines = Object.keys(grouped).sort();
  const filteredDisciplines =
    filterDiscipline === 'all'
      ? disciplines
      : disciplines.filter((d) => d === filterDiscipline);

  const searchLower = search.toLowerCase();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Discipline Levels
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage level-based progression for Boxing, MMA, and other
            disciplines
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="h-9">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Level</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search levels..."
            className="pl-9 h-9"
          />
        </div>
        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="All Disciplines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            {LEVEL_DISCIPLINES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
            {/* Also show any disciplines in DB not in config */}
            {disciplines
              .filter(
                (d) =>
                  !LEVEL_DISCIPLINES.map((ld) => ld.toLowerCase()).includes(
                    d.toLowerCase()
                  )
              )
              .map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDisciplines.length === 0 ? (
        <Card className="p-8 border-border/50">
          <div className="text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Levels Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add levels for your disciplines to enable level-based progression
              tracking.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Level
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisciplines.map((disc) => {
            const discLevels = grouped[disc].filter(
              (l) =>
                !searchLower ||
                l.level_name.toLowerCase().includes(searchLower) ||
                l.discipline.toLowerCase().includes(searchLower) ||
                (l.description || '').toLowerCase().includes(searchLower)
            );
            if (discLevels.length === 0) return null;

            return (
              <Card key={disc} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {disc}
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {discLevels.length} level
                      {discLevels.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4">
                  <div className="space-y-2">
                    {discLevels
                      .sort((a, b) => a.level_order - b.level_order)
                      .map((level) => (
                        <div
                          key={level.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 font-mono flex-shrink-0"
                          >
                            #{level.level_order}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {level.level_name}
                            </p>
                            {level.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {level.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEdit(level)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(level)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? 'Edit Level' : 'Add Level'}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? 'Update the discipline level details.'
                : 'Create a new level for a discipline.'}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Discipline
              </label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Level Name
              </label>
              <Input
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="e.g. Beginner, Intermediate, Advanced"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Order
              </label>
              <Input
                type="number"
                min={0}
                value={levelOrder}
                onChange={(e) => setLevelOrder(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the progression path.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this level covers..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingLevel ? 'Update' : 'Create'}
              </Button>
            </div>
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
            <AlertDialogTitle>Delete Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deleteTarget?.level_name}" from {deleteTarget?.discipline}? This
              may affect students currently assigned to this level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
