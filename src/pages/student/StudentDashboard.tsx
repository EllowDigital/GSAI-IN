import React from 'react';
import { useStudentAuth } from './StudentAuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  LogOut,
  Trophy,
  Download,
  Calendar,
  MapPin,
  UserCheck,
  User,
  IndianRupee,
  Award,
  Megaphone,
  CalendarDays,
  Swords,
  Clock,
} from 'lucide-react';
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
import StudentBeltExamNotifications from '@/components/student/StudentBeltExamNotifications';
import { downloadCertificateFile } from '@/utils/certificateDownload';

export default function StudentDashboard() {
  const {
    profile,
    isAuthenticated,
    isLoading: authLoading,
    signOut,
  } = useStudentAuth();
  const queryClient = useQueryClient();

  // Fetch all enrolled programs for the student
  const { data: enrolledPrograms = [] } = useQuery({
    queryKey: ['student-enrolled-programs', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_programs')
        .select('program_name, is_primary, joined_at')
        .eq('student_id', profile!.studentId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

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

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('competition_registrations')
        .select('competition_id, status')
        .eq('student_id', profile!.studentId)) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const { data: myCertificates = [] } = useQuery({
    queryKey: ['my-certificates', profile?.studentId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('competition_certificates')
        .select('*, competitions(name)')
        .eq('student_id', profile!.studentId)) as any;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const regMap = new Map(
    (myRegistrations as any[]).map((r: any) => [r.competition_id, r.status])
  );

  const registerMutation = useMutation({
    mutationFn: async (competitionId: string) => {
      const { error } = (await supabase
        .from('competition_registrations')
        .insert({
          competition_id: competitionId,
          student_id: profile!.studentId,
        } as any)) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      toast.success('Registered successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={24} />
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/student/login" replace />;

  const upcomingComps = (competitions as any[]).filter(
    (c: any) => c.status === 'upcoming' || c.status === 'ongoing'
  );
  const pastComps = (competitions as any[]).filter(
    (c: any) => c.status === 'completed'
  );

  // Build program display string
  const programDisplay =
    enrolledPrograms.length > 0
      ? enrolledPrograms.map((p: any) => p.program_name).join(', ')
      : profile?.program || 'N/A';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-foreground">
              Student Portal
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground truncate">
                {profile?.studentName}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex gap-1 flex-wrap">
                {enrolledPrograms.length > 0 ? (
                  enrolledPrograms.map((p: any, i: number) => (
                    <Badge
                      key={p.program_name}
                      variant={p.is_primary ? 'default' : 'secondary'}
                      className="text-[9px] px-1.5 py-0 h-4"
                    >
                      {p.program_name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {profile?.program}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ChangePasswordDialog />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-1.5 text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />{' '}
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 pb-16 flex-1 w-full">
        <StudentAnnouncements />
        {profile?.studentId && (
          <StudentBeltExamNotifications studentId={profile.studentId} />
        )}
        <StudentProfileCard />

        <Tabs defaultValue="competitions" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger
              value="competitions"
              className="gap-1 text-xs sm:text-sm py-2"
            >
              <Trophy className="w-3.5 h-3.5 hidden sm:block" /> Competitions
            </TabsTrigger>
            <TabsTrigger
              value="progression"
              className="gap-1 text-xs sm:text-sm py-2"
            >
              <Award className="w-3.5 h-3.5 hidden sm:block" /> Progression
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="gap-1 text-xs sm:text-sm py-2"
            >
              <CalendarDays className="w-3.5 h-3.5 hidden sm:block" />{' '}
              Attendance
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-1 text-xs sm:text-sm py-2">
              <IndianRupee className="w-3.5 h-3.5 hidden sm:block" /> Fees
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="gap-1 text-xs sm:text-sm py-2"
            >
              <Calendar className="w-3.5 h-3.5 hidden sm:block" /> Events
            </TabsTrigger>
          </TabsList>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-6 mt-4">
            {(myCertificates as any[]).length > 0 && (
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" /> My
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {(myCertificates as any[]).map((cert: any) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {cert.competitions?.name || 'Competition'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(cert.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0 text-xs"
                        onClick={async () => {
                          try {
                            await downloadCertificateFile({
                              certificateUrl: cert.certificate_url as string,
                              fileName: `${cert.competitions?.name || 'competition'}-certificate.pdf`,
                            });
                          } catch {
                            toast.error('Unable to download certificate.');
                          }
                        }}
                      >
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary" /> Upcoming
                Competitions
              </h3>
              {compLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size={20} />
                </div>
              ) : upcomingComps.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming competitions right now.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingComps.map((c: any) => {
                    const registered = regMap.has(c.id);
                    return (
                      <Card
                        key={c.id}
                        className="border border-border overflow-hidden"
                      >
                        {c.image_url && (
                          <div className="h-32 sm:h-40 overflow-hidden">
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-foreground text-sm">
                                {c.name}
                              </h4>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(c.date), 'MMM d, yyyy')}
                                  {c.end_date &&
                                    ` – ${format(new Date(c.end_date), 'MMM d')}`}
                                </span>
                                {c.location_text && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />{' '}
                                    {c.location_text}
                                  </span>
                                )}
                                {c.max_participants && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="w-3 h-3" /> Max{' '}
                                    {c.max_participants}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-[10px] ${c.status === 'ongoing' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-blue-500/10 text-blue-600 border-blue-200'}`}
                            >
                              {c.status === 'ongoing' ? 'Live' : 'Upcoming'}
                            </Badge>
                          </div>
                          {c.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {c.description}
                            </p>
                          )}
                          {c.location_text && (
                            <div className="rounded-lg overflow-hidden border border-border">
                              <iframe
                                title={`Map: ${c.location_text}`}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(c.location_text)}&z=14&output=embed`}
                                width="100%"
                                height="120"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>
                          )}
                          <div className="pt-1">
                            {registered ? (
                              <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-200">
                                <UserCheck className="w-3 h-3" /> Registered
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => registerMutation.mutate(c.id)}
                                disabled={registerMutation.isPending}
                                className="text-xs"
                              >
                                Register Now
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {pastComps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Past Competitions
                </h3>
                <div className="space-y-2">
                  {pastComps.slice(0, 5).map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(c.date), 'MMM d, yyyy')}
                          {c.location_text && ` · ${c.location_text}`}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progression" className="mt-4">
            <StudentProgressionTracker />
          </TabsContent>
          <TabsContent value="attendance" className="mt-4">
            <StudentAttendanceView />
          </TabsContent>
          <TabsContent value="fees" className="mt-4">
            <StudentFeeHistory />
          </TabsContent>
          <TabsContent value="events" className="mt-4">
            <StudentEventsView />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/50 py-3 text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Built by{' '}
          <span className="text-muted-foreground/70">Sarwan Yadav</span> ·{' '}
          <span className="text-muted-foreground/70">EllowDigital</span>
        </p>
      </footer>
    </div>
  );
}
