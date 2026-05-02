import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useStudentAuth } from './StudentAuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentSupabase as supabase } from '@/services/supabase/studentClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/useToast';
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
  Clock,
  Sparkles,
  ShieldCheck,
  Swords,
  RefreshCw,
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
import StudentBeltExamNotifications from '@/components/student/StudentBeltExamNotifications';
import { downloadCertificateFile } from '@/utils/certificateDownload';
import { parseProgramNames } from '@/utils/studentPrograms';
import Seo from '@/components/seo/Seo';

const PASSWORD_REDIRECT_METRIC_KEY = 'gsai-student-password-redirect-start-ms';

// --- Types ---
interface Program {
  program_name: string;
  is_primary: boolean;
  joined_at: string;
}

interface Competition {
  id: string;
  name: string;
  date: string;
  end_date?: string;
  location_text?: string;
  max_participants?: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
  image_url?: string;
}

interface Registration {
  competition_id: string;
  status: string;
}

interface Certificate {
  id: string;
  certificate_url: string;
  uploaded_at: string;
  competitions: { name: string };
}

export default function StudentDashboard() {
  const {
    profile,
    isAuthenticated,
    isLoading: authLoading,
    signOut,
  } = useStudentAuth();

  const queryClient = useQueryClient();
  const studentId = profile?.studentId;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const dashboardTitle = profile?.studentName
    ? `${profile.studentName} | GSAI Student Portal`
    : 'Student Dashboard | GSAI Student Portal';

  const handleRefreshAllData = useCallback(async () => {
    if (!studentId || isRefreshing) return;

    const refreshableQueryKeys = new Set([
      'student-enrolled-programs',
      'student-competitions',
      'my-registrations',
      'my-certificates',
      'student-announcements',
      'belt-exam-notifications',
      'student-profile',
      'student-all-programs',
      'student-belt',
      'student-fees',
      'student-record',
      'student-all-progress',
      'student-level-progress',
      'student-promotions',
      'student-events',
    ]);

    const shouldRefresh = (queryKey: readonly unknown[]) => {
      const key = queryKey[0];
      return typeof key === 'string' && refreshableQueryKeys.has(key);
    };

    try {
      setIsRefreshing(true);

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => shouldRefresh(queryKey),
      });

      await queryClient.refetchQueries({
        predicate: ({ queryKey }) => shouldRefresh(queryKey),
        type: 'active',
      });

      setLastRefreshedAt(new Date());
      toast.success('Dashboard refreshed with latest data.');
    } catch (error) {
      console.error('Student refresh-all failed', error);
      toast.error('Unable to refresh all data right now.');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, studentId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawStartMs = window.sessionStorage.getItem(
      PASSWORD_REDIRECT_METRIC_KEY
    );
    if (!rawStartMs) return;

    const startMs = Number(rawStartMs);
    if (!Number.isNaN(startMs)) {
      const renderMs = Date.now() - startMs;
      if (renderMs >= 0) {
        console.info(
          '[student-set-password] redirect-to-dashboard-render-ms',
          renderMs
        );
      }
    }

    window.sessionStorage.removeItem(PASSWORD_REDIRECT_METRIC_KEY);
  }, []);

  // --- Queries ---
  const { data: enrolledPrograms = [] } = useQuery<Program[]>({
    queryKey: ['student-enrolled-programs', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_programs')
        .select('program_name, is_primary, joined_at')
        .eq('student_id', studentId!)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: competitions = [], isLoading: compLoading } = useQuery<
    Competition[]
  >({
    queryKey: ['student-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as Competition[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const programBadges = useMemo(() => {
    const normalized = new Map<string, Program>();

    enrolledPrograms.forEach((program) => {
      const name = (program.program_name || '').trim();
      if (!name) return;
      normalized.set(name.toLowerCase(), {
        ...program,
        program_name: name,
      });
    });

    const fallbackPrograms = parseProgramNames(profile?.program);
    fallbackPrograms.forEach((fallbackProgram) => {
      if (normalized.has(fallbackProgram.toLowerCase())) return;
      normalized.set(fallbackProgram.toLowerCase(), {
        program_name: fallbackProgram,
        is_primary: normalized.size === 0,
        joined_at: '',
      });
    });

    return Array.from(normalized.values()).sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary)
    );
  }, [enrolledPrograms, profile?.program]);

  const { data: myRegistrations = [] } = useQuery<Registration[]>({
    queryKey: ['my-registrations', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_registrations')
        .select('competition_id, status')
        .eq('student_id', studentId!);
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: myCertificates = [] } = useQuery<Certificate[]>({
    queryKey: ['my-certificates', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_certificates')
        .select('*, competitions(name)')
        .eq('student_id', studentId!);
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10,
  });

  const registerMutation = useMutation({
    mutationFn: async (competitionId: string) => {
      const { error } = await supabase
        .from('competition_registrations')
        .insert({
          competition_id: competitionId,
          student_id: studentId!,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      toast.success('Registered successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // --- Memoized Derived Data ---
  const registeredCompIds = useMemo(() => {
    return new Set(myRegistrations.map((r) => r.competition_id));
  }, [myRegistrations]);

  const upcomingComps = useMemo(() => {
    return competitions.filter(
      (c) => c.status === 'upcoming' || c.status === 'ongoing'
    );
  }, [competitions]);

  const pastComps = useMemo(() => {
    return competitions.filter((c) => c.status === 'completed');
  }, [competitions]);

  // --- Render Checks ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/student/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-indigo-50/40 flex flex-col font-sans text-slate-900">
      <Seo
        title={dashboardTitle}
        description="Private student dashboard for Ghatak Sports Academy India."
        canonical="/student/dashboard"
        noIndex
        noFollow
      />
      {/* --- ENHANCED NAVBAR --- */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full gap-2 sm:gap-4">
          {/* Left: Logo & Portal Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-border/50 shadow-sm shrink-0">
              <img
                src="/assets/images/logo.webp"
                alt="GSAI Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="hidden md:flex flex-col justify-center">
              <h1 className="text-base font-bold text-foreground leading-none tracking-tight">
                GSAI Student
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
                Portal
              </span>
            </div>
          </div>

          {/* Middle: Student Info */}
          <div className="flex-1 flex flex-col items-start md:items-center justify-center min-w-0 px-2 sm:px-4">
            <span className="text-sm font-bold text-foreground truncate w-full md:text-center">
              {profile?.studentName}
            </span>
            <div className="flex items-center md:justify-center gap-1 flex-wrap mt-0.5 w-full">
              {programBadges.length > 0 ? (
                programBadges.map((p) => (
                  <Badge
                    key={p.program_name}
                    variant={p.is_primary ? 'default' : 'secondary'}
                    className="text-[9px] px-1.5 py-0 uppercase tracking-wider h-4 whitespace-nowrap"
                  >
                    {p.program_name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground truncate">
                  {profile?.program || 'N/A'}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {lastRefreshedAt && (
              <span className="hidden xl:inline text-[11px] text-muted-foreground whitespace-nowrap">
                Updated {format(lastRefreshedAt, 'h:mm a')}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAllData}
              disabled={isRefreshing}
              className="gap-2 px-2 sm:px-3 h-9"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden lg:inline font-semibold text-sm">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </Button>
            <ChangePasswordDialog />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors px-2 sm:px-3 h-9"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold text-sm">
                Sign Out
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 lg:p-6 space-y-8 pb-20 flex-1 w-full">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-slate-50 shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome Back
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl tracking-tight">
                {profile?.studentName || 'Student Dashboard'}
              </h2>
              <p className="text-sm text-slate-300 max-w-md leading-relaxed">
                Track your progression, view upcoming events, manage fees, and
                monitor your competition activity all in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Active Programs
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {programBadges.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Certificates
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {myCertificates.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Components */}
        <StudentAnnouncements />
        {studentId && <StudentBeltExamNotifications studentId={studentId} />}
        <StudentProfileCard />

        {/* Tab Navigation */}
        <Tabs defaultValue="competitions" className="w-full">
          <div className="rounded-xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur-sm">
            <TabsList className="h-auto w-full grid grid-cols-2 gap-1.5 sm:grid-cols-4 bg-transparent">
              <TabsTrigger
                value="competitions"
                className="gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Trophy className="w-4 h-4 text-primary hidden sm:block" />{' '}
                Competitions
              </TabsTrigger>
              <TabsTrigger
                value="progression"
                className="gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Award className="w-4 h-4 text-primary hidden sm:block" />{' '}
                Progression
              </TabsTrigger>
              <TabsTrigger
                value="fees"
                className="gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <IndianRupee className="w-4 h-4 text-primary hidden sm:block" />{' '}
                Fees
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4 text-primary hidden sm:block" />{' '}
                Events
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Competitions Tab */}
          <TabsContent
            value="competitions"
            className="space-y-8 mt-6 focus-visible:outline-none focus-visible:ring-0"
          >
            {/* Certificates Section */}
            {myCertificates.length > 0 && (
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> My
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid gap-3">
                  {myCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {cert.competitions?.name || 'Competition'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Issued:{' '}
                          {format(new Date(cert.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 shrink-0 font-medium"
                        onClick={async () => {
                          try {
                            await downloadCertificateFile({
                              certificateUrl: cert.certificate_url,
                              fileName: `${cert.competitions?.name || 'competition'}-certificate.pdf`,
                            });
                          } catch {
                            toast.error('Unable to download certificate.');
                          }
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Competitions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" /> Upcoming
                Competitions
              </h3>

              {compLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size={24} className="text-primary/60" />
                </div>
              ) : upcomingComps.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-transparent">
                  <CardContent className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No upcoming competitions
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check back later for new events.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingComps.map((c) => {
                    const isRegistered = registeredCompIds.has(c.id);
                    return (
                      <Card
                        key={c.id}
                        className="border-border/60 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-border"
                      >
                        {c.image_url && (
                          <div className="h-40 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              loading="lazy"
                            />
                            <Badge
                              className={`absolute bottom-3 left-3 z-20 text-[10px] font-semibold tracking-wider uppercase border-none ${
                                c.status === 'ongoing'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {c.status === 'ongoing' ? 'Live Now' : 'Upcoming'}
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                          <div className="flex-1 space-y-2.5">
                            {!c.image_url && (
                              <Badge
                                variant="outline"
                                className={`w-fit text-[10px] font-semibold tracking-wider uppercase ${
                                  c.status === 'ongoing'
                                    ? 'bg-green-500/10 text-green-700 border-green-200'
                                    : 'bg-blue-500/10 text-blue-700 border-blue-200'
                                }`}
                              >
                                {c.status === 'ongoing'
                                  ? 'Live Now'
                                  : 'Upcoming'}
                              </Badge>
                            )}
                            <h4 className="font-bold text-base leading-tight text-foreground line-clamp-2">
                              {c.name}
                            </h4>

                            <div className="grid gap-2 mt-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                <span className="truncate">
                                  {format(new Date(c.date), 'MMM d, yyyy')}
                                  {c.end_date &&
                                    ` – ${format(new Date(c.end_date), 'MMM d')}`}
                                </span>
                              </div>
                              {c.location_text && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                  <span className="truncate">
                                    {c.location_text}
                                  </span>
                                </div>
                              )}
                              {c.max_participants && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                  <span>
                                    Max {c.max_participants} Participants
                                  </span>
                                </div>
                              )}
                            </div>

                            {c.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/40 mt-3">
                                {c.description}
                              </p>
                            )}
                          </div>

                          {c.location_text && (
                            <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/20 mt-2">
                              <iframe
                                title={`Map: ${c.location_text}`}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(c.location_text)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                width="100%"
                                height="120"
                                className="border-0 grayscale-[20%] contrast-125"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                            </div>
                          )}

                          <div className="pt-2 mt-auto">
                            {isRegistered ? (
                              <div className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-700 font-semibold text-sm border border-green-500/20">
                                <UserCheck className="w-4 h-4" /> You are
                                Registered
                              </div>
                            ) : (
                              <Button
                                className="w-full font-semibold shadow-sm"
                                onClick={() => registerMutation.mutate(c.id)}
                                disabled={registerMutation.isPending}
                              >
                                {registerMutation.isPending
                                  ? 'Registering...'
                                  : 'Register Now'}
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

            {/* Past Competitions */}
            {pastComps.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-sm font-bold tracking-tight text-muted-foreground flex items-center gap-2 uppercase">
                  <Clock className="w-4 h-4" /> Past Events History
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pastComps.slice(0, 6).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(c.date), 'MMM d, yyyy')}
                          {c.location_text && (
                            <span className="truncate">
                              · {c.location_text}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0 font-medium"
                      >
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Remaining Tabs */}
          <TabsContent
            value="progression"
            className="mt-6 focus-visible:outline-none"
          >
            <StudentProgressionTracker />
          </TabsContent>
          <TabsContent value="fees" className="mt-6 focus-visible:outline-none">
            <StudentFeeHistory />
          </TabsContent>
          <TabsContent
            value="events"
            className="mt-6 focus-visible:outline-none"
          >
            <StudentEventsView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/80">
          <p>
            Powered by{' '}
            <a
              href="https://ellowdigital.space"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-foreground transition-colors"
            >
              EllowDigital
            </a>
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/50 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium">Secure Connection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
