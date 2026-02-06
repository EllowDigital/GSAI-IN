import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { format, isSameDay, parseISO } from 'date-fns';
import {
  CalendarDays,
  Plus,
  Users,
  Award,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';

interface BeltTest {
  id: string;
  title: string;
  date: string;
  description: string | null;
  tag: string | null;
}

export default function BeltTestCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<BeltTest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '10:00',
  });
  const queryClient = useQueryClient();

  // Fetch events tagged as belt tests
  const { data: beltTests = [], isLoading } = useQuery({
    queryKey: ['belt-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('tag', 'belt_test')
        .order('date', { ascending: true });
      if (error) throw error;
      return data as BeltTest[];
    },
  });

  // Fetch students ready for belt test
  const { data: readyStudents = [] } = useQuery({
    queryKey: ['students-ready-for-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select(
          `
          id,
          status,
          stripe_count,
          student:students(id, name, program)
        `
        )
        .or('status.eq.ready,stripe_count.gte.4');
      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: {
      id?: string;
      title: string;
      date: string;
      description: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from('events')
          .update({
            title: data.title,
            date: data.date,
            description: data.description,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert({
          title: data.title,
          date: data.date,
          description: data.description,
          tag: 'belt_test',
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['belt-tests'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Success',
        description: editingTest ? 'Belt test updated' : 'Belt test scheduled',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['belt-tests'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Deleted',
        description: 'Belt test removed from calendar',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  const handleOpenDialog = (test?: BeltTest) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        title: test.title,
        description: test.description || '',
        time: '10:00',
      });
    } else {
      setEditingTest(null);
      setFormData({
        title: 'Belt Grading Test',
        description: '',
        time: '10:00',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTest(null);
    setFormData({ title: '', description: '', time: '10:00' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    saveMutation.mutate({
      id: editingTest?.id,
      title: formData.title,
      date: dateStr,
      description: formData.description,
    });
  };

  // Get tests for selected date
  const testsOnSelectedDate = selectedDate
    ? beltTests.filter((test) => isSameDay(parseISO(test.date), selectedDate))
    : [];

  // Get dates that have tests
  const testDates = beltTests.map((test) => parseISO(test.date));

  // Upcoming tests (next 30 days)
  const upcomingTests = beltTests.filter((test) => {
    const testDate = parseISO(test.date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    return testDate >= now && testDate <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Belt Test Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage belt grading tests
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Test
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{
                hasTest: testDates,
              }}
              modifiersStyles={{
                hasTest: {
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                },
              }}
            />

            {/* Tests on selected date */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-sm mb-3">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                {testsOnSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {testsOnSelectedDate.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Award className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{test.title}</p>
                            {test.description && (
                              <p className="text-xs text-muted-foreground">
                                {test.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(test)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(test.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tests scheduled for this date
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Tests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingTests.length > 0 ? (
                upcomingTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <p className="font-medium">{test.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(test.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No upcoming tests
                </p>
              )}
            </CardContent>
          </Card>

          {/* Students Ready */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ready for Testing
                {readyStudents.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {readyStudents.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {readyStudents.length > 0 ? (
                readyStudents.map((progress: any) => (
                  <div
                    key={progress.id}
                    className="p-2 rounded-lg bg-green-500/10 text-sm"
                  >
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {progress.student?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progress.student?.program} • {progress.stripe_count || 0}{' '}
                      stripes
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No students ready yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {editingTest ? 'Edit Belt Test' : 'Schedule Belt Test'}
            </DialogTitle>
            <DialogDescription>
              {selectedDate
                ? `Scheduling for ${format(selectedDate, 'MMMM d, yyyy')}`
                : 'Select a date first'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Belt Grading Test"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notes (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional details..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || !selectedDate}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Test'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
