import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { format, isSameDay, parseISO } from 'date-fns';
import {
  CalendarDays, Plus, Users, Award, Clock, Trash2, Loader2, Bell, Send,
} from 'lucide-react';

interface BeltTest {
  id: string;
  title: string;
  date: string;
  description: string | null;
  tag: string | null;
}

export default function BeltTestCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<BeltTest | null>(null);
  const [notifyTest, setNotifyTest] = useState<BeltTest | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [notifyDiscipline, setNotifyDiscipline] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '10:00',
    discipline: '',
  });
  const queryClient = useQueryClient();

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

  const { data: readyStudents = [] } = useQuery({
    queryKey: ['students-ready-for-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select('id, status, stripe_count, student:students(id, name, program)')
        .or('status.eq.ready,stripe_count.gte.4');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ['all-students-for-notify'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, program')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

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
          .update({ title: data.title, date: data.date, description: data.description })
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
      toast({ title: 'Success', description: editingTest ? 'Belt test updated' : 'Belt test scheduled' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['belt-tests'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Deleted', description: 'Belt test removed from calendar' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  // Send notifications to students
  const notifyMutation = useMutation({
    mutationFn: async ({ test, studentIds, discipline }: { test: BeltTest; studentIds: string[]; discipline: string }) => {
      const notifications = studentIds.map((studentId) => ({
        student_id: studentId,
        event_id: test.id,
        title: `Belt Exam: ${test.title}`,
        message: `You have a belt exam scheduled on ${format(parseISO(test.date), 'MMMM d, yyyy')}. ${test.description || 'Please prepare accordingly.'}`,
        exam_date: test.date,
        discipline: discipline || null,
      }));

      const { error } = await supabase.from('belt_exam_notifications').insert(notifications);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Notifications Sent', description: `Notified ${selectedStudentIds.size} student(s) about the belt exam` });
      setNotifyDialogOpen(false);
      setSelectedStudentIds(new Set());
      setNotifyTest(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  const handleOpenDialog = (test?: BeltTest) => {
    if (test) {
      setEditingTest(test);
      setFormData({ title: test.title, description: test.description || '', time: '10:00', discipline: '' });
    } else {
      setEditingTest(null);
      setFormData({ title: 'Belt Grading Test', description: '', time: '10:00', discipline: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTest(null);
    setFormData({ title: '', description: '', time: '10:00', discipline: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    saveMutation.mutate({
      id: editingTest?.id,
      title: formData.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      description: formData.description,
    });
  };

  const handleOpenNotify = (test: BeltTest) => {
    setNotifyTest(test);
    setNotifyDiscipline('');
    setSelectedStudentIds(new Set());
    setNotifyDialogOpen(true);
  };

  const handleSendNotify = () => {
    if (!notifyTest || selectedStudentIds.size === 0) return;
    notifyMutation.mutate({
      test: notifyTest,
      studentIds: Array.from(selectedStudentIds),
      discipline: notifyDiscipline,
    });
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllStudents = () => {
    const filtered = notifyDiscipline
      ? allStudents.filter((s) => s.program?.toLowerCase().includes(notifyDiscipline.toLowerCase()))
      : allStudents;
    setSelectedStudentIds(new Set(filtered.map((s) => s.id)));
  };

  const filteredStudentsForNotify = notifyDiscipline
    ? allStudents.filter((s) => s.program?.toLowerCase().includes(notifyDiscipline.toLowerCase()))
    : allStudents;

  const testsOnSelectedDate = selectedDate
    ? beltTests.filter((test) => isSameDay(parseISO(test.date), selectedDate))
    : [];

  const testDates = beltTests.map((test) => parseISO(test.date));

  const upcomingTests = beltTests.filter((test) => {
    const testDate = parseISO(test.date);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return testDate >= now && testDate <= thirtyDays;
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
            Schedule belt tests and notify students via their portal
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Test
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{ hasTest: testDates }}
              modifiersStyles={{
                hasTest: {
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                },
              }}
            />

            {selectedDate && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-sm mb-3">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                {testsOnSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {testsOnSelectedDate.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{test.title}</p>
                            {test.description && (
                              <p className="text-xs text-muted-foreground">{test.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenNotify(test)} title="Send notifications">
                            <Bell className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(test)}>
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
                  <p className="text-sm text-muted-foreground">No tests scheduled for this date</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
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
                  <div key={test.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <div>
                      <p className="font-medium">{test.title}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(test.date), 'MMM d, yyyy')}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenNotify(test)} title="Notify students">
                      <Bell className="w-3.5 h-3.5 text-primary" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No upcoming tests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ready for Testing
                {readyStudents.length > 0 && <Badge variant="secondary" className="ml-auto">{readyStudents.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {readyStudents.length > 0 ? (
                readyStudents.map((progress: any) => (
                  <div key={progress.id} className="p-2 rounded-lg bg-green-500/10 text-sm">
                    <p className="font-medium text-green-700 dark:text-green-400">{progress.student?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.student?.program} • {progress.stripe_count || 0} stripes
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No students ready yet</p>
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
              {selectedDate ? `Scheduling for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Select a date first'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Belt Grading Test" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discipline">Discipline (optional)</Label>
              <Input id="discipline" value={formData.discipline} onChange={(e) => setFormData({ ...formData, discipline: e.target.value })} placeholder="e.g. Karate, Taekwondo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes (Optional)</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional details..." rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending || !selectedDate}>
                {saveMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Test'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notify Students Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notify Students
            </DialogTitle>
            <DialogDescription>
              Send belt exam notification to selected students. They'll see it in their Student Portal.
              {notifyTest && <span className="block mt-1 font-medium">{notifyTest.title} — {format(parseISO(notifyTest.date), 'MMM d, yyyy')}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter by Discipline</Label>
              <Input
                value={notifyDiscipline}
                onChange={(e) => setNotifyDiscipline(e.target.value)}
                placeholder="e.g. Karate (leave empty for all)"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredStudentsForNotify.length} student(s) • {selectedStudentIds.size} selected
              </p>
              <Button variant="ghost" size="sm" onClick={selectAllStudents} className="text-xs h-7">
                Select All
              </Button>
            </div>
            <ScrollArea className="h-[250px] border rounded-lg p-2">
              <div className="space-y-1">
                {filteredStudentsForNotify.map((student) => (
                  <label
                    key={student.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedStudentIds.has(student.id) ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    <Checkbox
                      checked={selectedStudentIds.has(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.program}</p>
                    </div>
                  </label>
                ))}
                {filteredStudentsForNotify.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendNotify}
              disabled={selectedStudentIds.size === 0 || notifyMutation.isPending}
              className="gap-2"
            >
              {notifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Notify {selectedStudentIds.size} Student(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
