import React from 'react';
import { useStudentAuth } from './StudentAuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { LogOut, Trophy, Download, Calendar, MapPin, UserCheck, User, IndianRupee, Award, Megaphone, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';
import Spinner from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChangePasswordDialog from '@/components/student/ChangePasswordDialog';
import StudentProfileCard from '@/components/student/StudentProfileCard';
import StudentFeeHistory from '@/components/student/StudentFeeHistory';
import StudentProgressionTracker from '@/components/student/StudentProgressionTracker';
import StudentEventsView from '@/components/student/StudentEventsView';
import StudentAnnouncements from '@/components/student/StudentAnnouncements';
import StudentAttendanceView from '@/components/student/StudentAttendanceView';
import { downloadCertificateFile } from '@/utils/certificateDownload';

export default function StudentDashboard() {
  const { profile, isAuthenticated, isLoading: authLoading, signOut } = useStudentAuth();
  const queryClient = useQueryClient();

  // All competitions
  const { data: competitions = [], isLoading: compLoading } = useQuery({
    queryKey: ['student-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  // My registrations
  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_registrations')
        .select('competition_id, status')
        .eq('student_id', profile!.studentId) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  // My certificates
  const { data: myCertificates = [] } = useQuery({
    queryKey: ['my-certificates', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_certificates')
        .select('*, competitions(name)')
        .eq('student_id', profile!.studentId) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const regMap = new Map((myRegistrations as any[]).map((r: any) => [r.competition_id, r.status]));

  const registerMutation = useMutation({
    mutationFn: async (competitionId: string) => {
      const { error } = await supabase.from('competition_registrations').insert({
        competition_id: competitionId,
        student_id: profile!.studentId,
      } as any) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      toast.success('Registered successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Spinner size={24} /></div>;
  if (!isAuthenticated) return <Navigate to="/student/login" replace />;

  const upcomingComps = (competitions as any[]).filter((c: any) => c.status === 'upcoming' || c.status === 'ongoing');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div>
            <h1 className="text-base font-semibold text-foreground">Student Portal</h1>
            <p className="text-xs text-muted-foreground">{profile?.studentName} • {profile?.program}</p>
          </div>
          <div className="flex items-center gap-2">
            <ChangePasswordDialog />
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Announcements Banner */}
        <StudentAnnouncements />

        {/* Profile Card */}
        <StudentProfileCard />

        {/* Main Tabs */}
        <Tabs defaultValue="competitions" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="competitions" className="gap-1 text-xs sm:text-sm py-2">
              <Trophy className="w-3.5 h-3.5 hidden sm:block" /> Competitions
            </TabsTrigger>
            <TabsTrigger value="progression" className="gap-1 text-xs sm:text-sm py-2">
              <Award className="w-3.5 h-3.5 hidden sm:block" /> Progression
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-1 text-xs sm:text-sm py-2">
              <CalendarDays className="w-3.5 h-3.5 hidden sm:block" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-1 text-xs sm:text-sm py-2">
              <IndianRupee className="w-3.5 h-3.5 hidden sm:block" /> Fees
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1 text-xs sm:text-sm py-2">
              <Calendar className="w-3.5 h-3.5 hidden sm:block" /> Events
            </TabsTrigger>
          </TabsList>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-4 mt-4">
            {/* Certificates section */}
            {(myCertificates as any[]).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> My Certificates
                </h3>
                {(myCertificates as any[]).map((cert: any) => {
                  const handleDownload = async () => {
                    try {
                      // Extract path from public URL
                      const url = cert.certificate_url as string;
                      const pathMatch = url.match(/certificates\/(.+)$/);
                      if (!pathMatch) { window.open(url, '_blank'); return; }
                      const { data, error } = await supabase.storage
                        .from('certificates')
                        .createSignedUrl(pathMatch[1], 3600);
                      if (error || !data?.signedUrl) { window.open(url, '_blank'); return; }
                      // Trigger download
                      const a = document.createElement('a');
                      a.href = data.signedUrl;
                      a.download = `certificate-${cert.competitions?.name || 'file'}.pdf`;
                      a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } catch { window.open(cert.certificate_url, '_blank'); }
                  };
                  return (
                  <Card key={cert.id} className="border border-border">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{cert.competitions?.name || 'Competition'}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {format(new Date(cert.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}

            {/* Upcoming competitions */}
            <h3 className="text-sm font-semibold text-foreground">Upcoming Competitions</h3>
            {compLoading ? (
              <div className="flex justify-center py-8"><Spinner size={20} /></div>
            ) : upcomingComps.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No upcoming competitions.</p>
            ) : (
              upcomingComps.map((c: any) => {
                const registered = regMap.has(c.id);
                return (
                  <Card key={c.id} className="border border-border">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(c.date), 'MMM d, yyyy')}
                          </span>
                          {c.location_text && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {c.location_text}
                            </span>
                          )}
                        </div>
                        {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>}
                        {c.location_text && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-border">
                            <iframe
                              title={`Map: ${c.location_text}`}
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(c.location_text)}&z=14&output=embed`}
                              width="100%"
                              height="150"
                              style={{ border: 0 }}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        )}
                      </div>
                      {registered ? (
                        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 shrink-0">
                          <UserCheck className="w-3 h-3" /> Registered
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => registerMutation.mutate(c.id)}
                          disabled={registerMutation.isPending}
                          className="shrink-0"
                        >
                          Register
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Progression Tab */}
          <TabsContent value="progression" className="mt-4">
            <StudentProgressionTracker />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="mt-4">
            <StudentAttendanceView />
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="mt-4">
            <StudentFeeHistory />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4">
            <StudentEventsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
