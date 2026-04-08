import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  DollarSign,
  BookOpen,
  Newspaper,
  Calendar,
  Image,
  TrendingUp,
  Clock,
  UserPlus,
  CreditCard,
  CalendarPlus,
  ArrowRight,
  Activity,
  MessageSquare,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="admin-page animate-pulse">
      <section className="admin-panel">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <Skeleton className="h-5 w-28 mb-3" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="admin-panel xl:col-span-8">
          <div className="p-4 sm:p-6">
            <Skeleton className="h-5 w-32 mb-5" />
            <Skeleton className="h-56 sm:h-64 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4 xl:col-span-4">
          <div className="admin-panel">
            <div className="p-4 sm:p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Main ── */
export default function DashboardHome() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const [
        studentsRes,
        feesRes,
        blogsRes,
        newsRes,
        eventsRes,
        galleryRes,
        enrollRes,
        announcementsRes,
        recentEnrollRes,
        recentFeesRes,
        recentStudentsRes,
      ] = await Promise.all([
        supabase
          .from('students')
          .select('id, program, join_date, default_monthly_fee, fee_status'),
        supabase
          .from('fees')
          .select(
            'id, status, paid_amount, monthly_fee, month, year, student_id'
          ),
        supabase.from('blogs').select('id, created_at'),
        supabase.from('news').select('id, created_at, status'),
        supabase.from('events').select('id, date'),
        supabase.from('gallery_images').select('id'),
        supabase.from('enrollment_requests' as any).select('id, status') as any,
        supabase.from('announcements').select('id, is_active'),
        supabase
          .from('enrollment_requests' as any)
          .select('id, student_name, program, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5) as any,
        supabase
          .from('fees')
          .select(
            'id, student_id, paid_amount, status, month, year, updated_at'
          )
          .eq('status', 'paid')
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('students')
          .select('id, name, program, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const firstError = [
        studentsRes,
        feesRes,
        blogsRes,
        newsRes,
        eventsRes,
        galleryRes,
        enrollRes,
        announcementsRes,
        recentEnrollRes,
        recentFeesRes,
        recentStudentsRes,
      ].find((r) => r.error)?.error;
      if (firstError) throw firstError;

      return {
        students: studentsRes.data || [],
        fees: feesRes.data || [],
        blogs: blogsRes.data || [],
        news: newsRes.data || [],
        events: eventsRes.data || [],
        gallery: galleryRes.data || [],
        enrollments: (enrollRes.data || []) as any[],
        announcements: (announcementsRes.data || []) as any[],
        recentEnrollments: (recentEnrollRes.data || []) as any[],
        recentFees: (recentFeesRes.data || []) as any[],
        recentStudents: (recentStudentsRes.data || []) as any[],
      };
    },
    staleTime: 1000 * 15,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });

  const analytics = React.useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const totalStudents = data.students.length;
    const paidFees = data.fees.filter((f) => f.status === 'paid');
    const totalRevenue = paidFees.reduce(
      (sum, f) => sum + (f.paid_amount || 0),
      0
    );
    const unpaidCount = data.fees.filter((f) => f.status === 'unpaid').length;
    const pendingEnrollments = data.enrollments.filter(
      (e: any) => e.status === 'pending'
    ).length;
    const activeAnnouncements = data.announcements.filter(
      (a: any) => a.is_active
    ).length;
    const currentMonthFees = data.fees.filter(
      (f) => f.year === now.getFullYear() && f.month === now.getMonth() + 1
    );
    const collectedThisMonth = currentMonthFees.reduce(
      (sum, f) => sum + (f.paid_amount || 0),
      0
    );
    const totalDueThisMonth = currentMonthFees.reduce(
      (sum, f) => sum + (f.monthly_fee || 0),
      0
    );
    const collectionRate =
      totalDueThisMonth > 0
        ? Math.round((collectedThisMonth / totalDueThisMonth) * 100)
        : 0;

    const revenueChart: { month: string; revenue: number; students: number }[] =
      [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const revenue = data.fees
        .filter(
          (f) =>
            f.year === date.getFullYear() &&
            f.month === date.getMonth() + 1 &&
            f.status === 'paid'
        )
        .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
      const studentCount = data.students.filter(
        (s) =>
          new Date(s.join_date) <=
          new Date(date.getFullYear(), date.getMonth() + 1, 0)
      ).length;
      revenueChart.push({ month: monthKey, revenue, students: studentCount });
    }

    const programCounts: Record<string, number> = {};
    data.students.forEach((s) => {
      programCounts[s.program] = (programCounts[s.program] || 0) + 1;
    });

    return {
      totalStudents,
      totalRevenue,
      paidCount: paidFees.length,
      unpaidCount,
      pendingEnrollments,
      activeAnnouncements,
      collectedThisMonth,
      collectionRate,
      totalBlogs: data.blogs.length,
      totalNews: data.news.length,
      totalEvents: data.events.length,
      totalGallery: data.gallery.length,
      revenueChart,
      programs: Object.entries(programCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Students',
      value: analytics.totalStudents,
      icon: Users,
      hint: `${analytics.pendingEnrollments} pending enrollments`,
      tone: 'neutral' as const,
    },
    {
      label: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      hint: `₹${analytics.collectedThisMonth.toLocaleString()} this month`,
      tone: 'success' as const,
    },
    {
      label: 'Collection Rate',
      value: `${analytics.collectionRate}%`,
      icon: TrendingUp,
      hint: `${analytics.unpaidCount} unpaid records`,
      tone: (analytics.collectionRate >= 80 ? 'success' : 'warning') as
        | 'success'
        | 'warning',
    },
    {
      label: 'Active Content',
      value: analytics.totalBlogs + analytics.totalNews,
      icon: Activity,
      hint: `${analytics.totalBlogs} blogs · ${analytics.totalNews} news`,
      tone: 'neutral' as const,
    },
  ];

  const toneClasses = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    neutral: 'bg-muted text-muted-foreground',
  };

  const quickActions = [
    {
      title: 'Enrollments',
      icon: UserPlus,
      path: '/admin/dashboard/enrollments',
      desc: 'Review requests',
    },
    {
      title: 'Add Student',
      icon: Users,
      path: '/admin/dashboard/students',
      desc: 'Register student',
    },
    {
      title: 'Record Fee',
      icon: CreditCard,
      path: '/admin/dashboard/fees',
      desc: 'Payment entry',
    },
    {
      title: 'Announce',
      icon: MessageSquare,
      path: '/admin/dashboard/announcements',
      desc: 'Post notice',
    },
    {
      title: 'New Event',
      icon: CalendarPlus,
      path: '/admin/dashboard/events',
      desc: 'Schedule event',
    },
    {
      title: 'Post News',
      icon: Newspaper,
      path: '/admin/dashboard/news',
      desc: 'Publish update',
    },
  ];

  const contentItems = [
    {
      label: 'Blogs',
      value: analytics.totalBlogs,
      icon: BookOpen,
      path: '/admin/dashboard/blogs',
    },
    {
      label: 'Events',
      value: analytics.totalEvents,
      icon: Calendar,
      path: '/admin/dashboard/events',
    },
    {
      label: 'Gallery',
      value: analytics.totalGallery,
      icon: Image,
      path: '/admin/dashboard/gallery',
    },
    {
      label: 'News',
      value: analytics.totalNews,
      icon: Newspaper,
      path: '/admin/dashboard/news',
    },
  ];

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className="admin-page">
      {/* ── Hero Stats ── */}
      <section className="admin-panel overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Welcome back
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Overview of students, revenue, and content.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {todayLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 sm:gap-3">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl border border-border/50 bg-card p-3 sm:p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneClasses[stat.tone]}`}
                  >
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                  {stat.hint}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.path}
              className="group rounded-xl border border-border/50 bg-card p-3 sm:p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <action.icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight sm:text-sm">
                {action.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Revenue + Programs ── */}
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12 sm:gap-4">
        <div className="admin-panel xl:col-span-8">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Revenue Overview
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Last 6 months collection trend
                </p>
              </div>
              <Link
                to="/admin/dashboard/fees"
                className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-48 sm:h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueChart}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '10px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--card))',
                      boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString()}`,
                      'Revenue',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#revGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-3 xl:col-span-4 sm:space-y-4">
          {/* Programs Distribution */}
          <div className="admin-panel">
            <div className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Programs
                </h3>
                <Link
                  to="/admin/dashboard/students"
                  className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  Details <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {analytics.programs.map((program) => {
                  const maxCount = analytics.programs[0]?.count || 1;
                  const pct = Math.round(
                    (program.count / analytics.totalStudents) * 100
                  );
                  return (
                    <div key={program.name} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground truncate">
                          {program.name}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums ml-2">
                          {program.count}{' '}
                          <span className="text-muted-foreground/50">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${(program.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {analytics.programs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No programs yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Snapshot */}
          <div className="admin-panel">
            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Live Snapshot
              </h3>
              <div className="space-y-1.5">
                {[
                  {
                    label: 'Pending enrollments',
                    value: analytics.pendingEnrollments,
                  },
                  { label: 'Unpaid fee records', value: analytics.unpaidCount },
                  {
                    label: 'Active announcements',
                    value: analytics.activeAnnouncements,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground text-xs">
                      {item.label}
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Overview ── */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-2.5">
          Content Overview
        </h3>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {contentItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {item.value}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {item.label}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="admin-panel">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Recent Activity
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Latest actions across the academy
              </p>
            </div>
          </div>

          <div className="space-y-0.5">
            {(() => {
              if (!data) return null;
              type ActivityItem = {
                id: string;
                type: 'enrollment' | 'fee' | 'student';
                title: string;
                detail: string;
                time: string;
              };
              const items: ActivityItem[] = [];
              data.recentEnrollments.forEach((e: any) =>
                items.push({
                  id: `e-${e.id}`,
                  type: 'enrollment',
                  title: `New enrollment: ${e.student_name}`,
                  detail: `${e.program} · ${e.status}`,
                  time: e.created_at,
                })
              );
              data.recentFees.forEach((f: any) =>
                items.push({
                  id: `f-${f.id}`,
                  type: 'fee',
                  title: `Fee paid: ₹${(f.paid_amount || 0).toLocaleString()}`,
                  detail: `${f.month}/${f.year}`,
                  time: f.updated_at,
                })
              );
              data.recentStudents.forEach((s: any) =>
                items.push({
                  id: `s-${s.id}`,
                  type: 'student',
                  title: `Registered: ${s.name}`,
                  detail: s.program,
                  time: s.created_at,
                })
              );
              items.sort(
                (a, b) =>
                  new Date(b.time).getTime() - new Date(a.time).getTime()
              );
              const top = items.slice(0, 8);

              if (top.length === 0)
                return (
                  <div className="text-center py-10">
                    <Activity className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
                  </div>
                );

              const iconMap = {
                enrollment: UserPlus,
                fee: DollarSign,
                student: Users,
              };
              const colorMap = {
                enrollment: 'bg-amber-500/10 text-amber-600',
                fee: 'bg-emerald-500/10 text-emerald-600',
                student: 'bg-primary/10 text-primary',
              };

              return top.map((item) => {
                const Icon = iconMap[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[item.type]}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 tabular-nums">
                      {formatDistanceToNow(new Date(item.time), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
