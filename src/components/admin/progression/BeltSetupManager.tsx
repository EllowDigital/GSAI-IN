import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Award,
  Plus,
  Wand2,
  Edit,
  Trash2,
  Info,
  Layers,
  Save,
  X,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/services/supabase/client';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useDisciplineLevels } from '@/hooks/useDisciplineLevels';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

const BELT_PRESETS: Record<
  string,
  Array<{ color: string; rank: number; min_sessions: number }>
> = {
  Karate: [
    { color: 'White', rank: 1, min_sessions: 0 },
    { color: 'Yellow', rank: 2, min_sessions: 20 },
    { color: 'Orange', rank: 3, min_sessions: 40 },
    { color: 'Green', rank: 4, min_sessions: 60 },
    { color: 'Blue', rank: 5, min_sessions: 80 },
    { color: 'Brown', rank: 6, min_sessions: 100 },
    { color: 'Black', rank: 7, min_sessions: 150 },
  ],
  Taekwondo: [
    { color: 'White', rank: 1, min_sessions: 0 },
    { color: 'Yellow', rank: 2, min_sessions: 20 },
    { color: 'Green', rank: 3, min_sessions: 40 },
    { color: 'Blue', rank: 4, min_sessions: 60 },
    { color: 'Red', rank: 5, min_sessions: 80 },
    { color: 'Black', rank: 6, min_sessions: 120 },
  ],
  BJJ: [
    { color: 'White', rank: 1, min_sessions: 0 },
    { color: 'Blue', rank: 2, min_sessions: 80 },
    { color: 'Purple', rank: 3, min_sessions: 150 },
    { color: 'Brown', rank: 4, min_sessions: 250 },
    { color: 'Black', rank: 5, min_sessions: 400 },
  ],
  Grappling: [
    { color: 'White', rank: 1, min_sessions: 0 },
    { color: 'Blue', rank: 2, min_sessions: 80 },
    { color: 'Purple', rank: 3, min_sessions: 150 },
    { color: 'Brown', rank: 4, min_sessions: 250 },
    { color: 'Black', rank: 5, min_sessions: 400 },
  ],
  Kickboxing: [
    { color: 'White', rank: 1, min_sessions: 0 },
    { color: 'Yellow', rank: 2, min_sessions: 25 },
    { color: 'Orange', rank: 3, min_sessions: 50 },
    { color: 'Green', rank: 4, min_sessions: 75 },
    { color: 'Blue', rank: 5, min_sessions: 100 },
    { color: 'Brown', rank: 6, min_sessions: 130 },
    { color: 'Black', rank: 7, min_sessions: 160 },
  ],
};

const LEVEL_PRESETS: Record<string, string[]> = {
  Boxing: ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'],
  MMA: ['Foundation', 'Fighter', 'Competitor', 'Professional'],
  'Self-Defense': ['Basic', 'Intermediate', 'Advanced', 'Expert'],
  Kalaripayattu: ['Beginner', 'Intermediate', 'Advanced', 'Master'],
  Fitness: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
  'Fat Loss': ['Starter', 'Progressive', 'Advanced', 'Elite'],
};

interface BeltEditForm {
  id?: string;
  color: string;
  rank: number;
  discipline: string;
  min_sessions: number;
  min_age: number;
}

export default function BeltSetupManager() {
  const queryClient = useQueryClient();
  const { data: belts = [], isLoading: beltsLoading } = useBeltLevels();
  const { data: levels = [], isLoading: levelsLoading } = useDisciplineLevels();

  const [autoSetupDialogOpen, setAutoSetupDialogOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<BeltEditForm>({
    color: '',
    rank: 1,
    discipline: '',
    min_sessions: 0,
    min_age: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  // Auto-setup mutation
  const autoSetupMutation = useMutation({
    mutationFn: async (discipline: string) => {
      const preset = BELT_PRESETS[discipline];
      if (!preset) {
        throw new Error('No preset available for this discipline');
      }

      // Delete existing belts for this discipline
      const { error: deleteError } = await supabase
        .from('belt_levels')
        .delete()
        .eq('discipline', discipline.toLowerCase());

      if (deleteError) throw deleteError;

      // Insert new belts
      const beltsToInsert = preset.map((belt) => ({
        color: belt.color,
        rank: belt.rank,
        discipline: discipline.toLowerCase(),
        min_sessions: belt.min_sessions,
        min_age: null,
        requirements: [],
      }));

      const { error: insertError } = await supabase
        .from('belt_levels')
        .insert(beltsToInsert);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success('Belt hierarchy created successfully');
      queryClient.invalidateQueries({ queryKey: ['belt-levels'] });
      setAutoSetupDialogOpen(false);
      setSelectedDiscipline('');
    },
    onError: (error) => {
      toast.error(
        getFriendlySupabaseMessage(error, 'Failed to create belt hierarchy')
      );
    },
  });

  // Level auto-setup mutation
  const levelSetupMutation = useMutation({
    mutationFn: async (discipline: string) => {
      const preset = LEVEL_PRESETS[discipline];
      if (!preset) {
        throw new Error('No level preset available for this discipline');
      }

      // Delete existing levels for this discipline
      const { error: deleteError } = await supabase
        .from('discipline_levels')
        .delete()
        .eq('discipline', discipline.toLowerCase());

      if (deleteError) throw deleteError;

      // Insert new levels
      const levelsToInsert = preset.map((levelName, index) => ({
        discipline: discipline.toLowerCase(),
        level_name: levelName,
        level_order: index + 1,
        description: null,
        requirements: [],
      }));

      const { error: insertError } = await supabase
        .from('discipline_levels')
        .insert(levelsToInsert);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success('Levels created successfully');
      queryClient.invalidateQueries({ queryKey: ['discipline-levels'] });
      setAutoSetupDialogOpen(false);
      setSelectedDiscipline('');
    },
    onError: (error) => {
      toast.error(getFriendlySupabaseMessage(error, 'Failed to create levels'));
    },
  });

  // Edit/Add belt mutation
  const saveBeltMutation = useMutation({
    mutationFn: async (form: BeltEditForm) => {
      if (form.id) {
        // Update existing
        const { error } = await supabase
          .from('belt_levels')
          .update({
            color: form.color,
            rank: form.rank,
            discipline: form.discipline.toLowerCase(),
            min_sessions: form.min_sessions,
            min_age: form.min_age || null,
          })
          .eq('id', form.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from('belt_levels').insert({
          color: form.color,
          rank: form.rank,
          discipline: form.discipline.toLowerCase(),
          min_sessions: form.min_sessions,
          min_age: form.min_age || null,
          requirements: [],
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editForm.id ? 'Belt updated' : 'Belt added');
      queryClient.invalidateQueries({ queryKey: ['belt-levels'] });
      setEditDialogOpen(false);
      setEditForm({
        color: '',
        rank: 1,
        discipline: '',
        min_sessions: 0,
        min_age: 0,
      });
    },
    onError: (error) => {
      toast.error(getFriendlySupabaseMessage(error, 'Failed to save belt'));
    },
  });

  // Delete belt mutation
  const deleteBeltMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('belt_levels')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Belt deleted');
      queryClient.invalidateQueries({ queryKey: ['belt-levels'] });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getFriendlySupabaseMessage(error, 'Failed to delete belt'));
    },
  });

  const handleAutoSetup = () => {
    if (!selectedDiscipline) return;

    if (BELT_PRESETS[selectedDiscipline]) {
      autoSetupMutation.mutate(selectedDiscipline);
    } else if (LEVEL_PRESETS[selectedDiscipline]) {
      levelSetupMutation.mutate(selectedDiscipline);
    } else {
      toast.error('No preset available for this discipline');
    }
  };

  const handleEdit = (belt: any) => {
    setEditForm({
      id: belt.id,
      color: belt.color,
      rank: belt.rank,
      discipline: belt.discipline || 'general',
      min_sessions: belt.min_sessions || 0,
      min_age: belt.min_age || 0,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const groupedBelts = belts.reduce(
    (acc, belt) => {
      const discipline = belt.discipline || 'general';
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(belt);
      return acc;
    },
    {} as Record<string, typeof belts>
  );

  const groupedLevels = levels.reduce(
    (acc, level) => {
      const discipline = level.discipline;
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(level);
      return acc;
    },
    {} as Record<string, typeof levels>
  );

  if (beltsLoading || levelsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading belt configurations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Belt Setup</h2>
          <p className="text-sm text-muted-foreground">
            Manage belt hierarchies for belt-based disciplines (Karate,
            Taekwondo, BJJ, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoSetupDialogOpen(true)}
            className="gap-2"
            variant="default"
          >
            <Wand2 className="h-4 w-4" />
            Auto Setup
          </Button>
          <Button
            onClick={() => {
              setEditForm({
                color: '',
                rank: 1,
                discipline: '',
                min_sessions: 0,
                min_age: 0,
              });
              setEditDialogOpen(true);
            }}
            className="gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add Belt
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Auto Setup creates standard belt hierarchies for martial arts
          disciplines. Use custom add/edit for specific requirements.
        </AlertDescription>
      </Alert>

      {/* Belt-Based Disciplines Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Belt Hierarchies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              {Object.entries(groupedBelts).map(
                ([discipline, disciplineBelts]) => (
                  <div key={discipline} className="space-y-2">
                    <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                      {discipline}
                      <Badge variant="outline">
                        {disciplineBelts.length} belts
                      </Badge>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Min Sessions</TableHead>
                          <TableHead>Min Age</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disciplineBelts
                          .sort((a, b) => a.rank - b.rank)
                          .map((belt) => (
                            <TableRow key={belt.id}>
                              <TableCell className="font-medium">
                                {belt.rank}
                              </TableCell>
                              <TableCell>
                                <Badge>{belt.color}</Badge>
                              </TableCell>
                              <TableCell>{belt.min_sessions || '—'}</TableCell>
                              <TableCell>{belt.min_age || '—'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(belt)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(belt.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
              {Object.keys(groupedBelts).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No belt hierarchies configured. Use Auto Setup to create
                  standard belts.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Auto Setup Dialog */}
      <Dialog open={autoSetupDialogOpen} onOpenChange={setAutoSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Setup Belt/Level Hierarchy</DialogTitle>
            <DialogDescription>
              Select a discipline to automatically create standard progression
              levels. This will replace any existing belts/levels for that
              discipline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select
                value={selectedDiscipline}
                onValueChange={setSelectedDiscipline}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Karate">Karate (7 belts)</SelectItem>
                  <SelectItem value="Taekwondo">Taekwondo (6 belts)</SelectItem>
                  <SelectItem value="BJJ">BJJ (5 belts)</SelectItem>
                  <SelectItem value="Grappling">Grappling (5 belts)</SelectItem>
                  <SelectItem value="Kickboxing">
                    Kickboxing (7 belts)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedDiscipline && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will delete existing progression data for{' '}
                  {selectedDiscipline} and create a new standard hierarchy.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAutoSetupDialogOpen(false);
                setSelectedDiscipline('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAutoSetup}
              disabled={!selectedDiscipline || autoSetupMutation.isPending}
            >
              {autoSetupMutation.isPending ? 'Creating...' : 'Create Hierarchy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Belt Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editForm.id ? 'Edit Belt' : 'Add New Belt'}
            </DialogTitle>
            <DialogDescription>
              Configure belt details and requirements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Input
                placeholder="e.g., karate, bjj, taekwondo"
                value={editForm.discipline}
                onChange={(e) =>
                  setEditForm({ ...editForm, discipline: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Color/Name</Label>
              <Input
                placeholder="e.g., White, Blue, Black"
                value={editForm.color}
                onChange={(e) =>
                  setEditForm({ ...editForm, color: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rank</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.rank}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rank: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Min Sessions</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.min_sessions}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      min_sessions: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Min Age (optional)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Leave empty if no age requirement"
                value={editForm.min_age || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    min_age: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditForm({
                  color: '',
                  rank: 1,
                  discipline: '',
                  min_sessions: 0,
                  min_age: 0,
                });
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => saveBeltMutation.mutate(editForm)}
              disabled={
                !editForm.color ||
                !editForm.discipline ||
                saveBeltMutation.isPending
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {saveBeltMutation.isPending ? 'Saving...' : 'Save Belt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Belt Level?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this belt level. Students currently
              assigned to this belt may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteBeltMutation.mutate(deleteTarget)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
