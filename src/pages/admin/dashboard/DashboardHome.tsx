import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Link } from 'react-router-dom';
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
import { useRealtime } from '@/hooks/useRealtime';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardHome() {
  useRealtime();

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
      ]);

      return {
        students: studentsRes.data || [],
        fees: feesRes.data || [],
        blogs: blogsRes.data || [],
        news: newsRes.data || [],
        events: eventsRes.data || [],
        gallery: galleryRes.data || [],
        enrollments: (enrollRes.data || []) as any[],
        announcements: (announcementsRes.data || []) as any[],
      };
    },
    staleTime: 1000 * 60 * 5,
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

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const thisMonthAttendance = data.attendance.filter(
      (a: any) => a.date >= thisMonthStart
    );
    const presentCount = thisMonthAttendance.filter(
      (a: any) => a.status === 'present'
    ).length;
    const totalAttendanceRecords = thisMonthAttendance.length;
    const attendanceRate =
      totalAttendanceRecords > 0
        ? Math.round((presentCount / totalAttendanceRecords) * 100)
        : 0;

    const revenueChart = [];
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
      attendanceRate,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-[3px] border-primary/20 border-t-primary rounded-full" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Students',
      value: analytics.totalStudents,
      icon: Users,
      change: `${analytics.pendingEnrollments} pending`,
      trend: analytics.pendingEnrollments > 0 ? 'up' : 'neutral',
    },
    {
      label: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `₹${analytics.collectedThisMonth.toLocaleString()} this month`,
      trend: 'up',
    },
    {
      label: 'Collection Rate',
      value: `${analytics.collectionRate}%`,
      icon: TrendingUp,
      change: `${analytics.unpaidCount} unpaid`,
      trend: analytics.collectionRate >= 80 ? 'up' : 'down',
    },
    {
      label: 'Attendance Rate',
      value: `${analytics.attendanceRate}%`,
      icon: Activity,
      change: 'This month',
      trend: analytics.attendanceRate >= 80 ? 'up' : 'down',
    },
  ];

  const quickActions = [
    {
      title: 'New Enrollment',
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
      title: 'Announcement',
      icon: MessageSquare,
      path: '/admin/dashboard/announcements',
      desc: 'Post notice',
    },
    {
      title: 'Create Event',
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

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Welcome back 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's happening with your academy today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  stat.trend === 'up'
                    ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                    : stat.trend === 'down'
                      ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40'
                      : 'text-muted-foreground bg-muted'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.path}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all text-center"
            >
              <div className="p-2.5 rounded-xl bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                <action.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground leading-tight block">
                  {action.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {action.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Revenue Overview
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 6 months collection trend
              </p>
            </div>
            <Link
              to="/admin/dashboard/fees"
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-56 sm:h-64">
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

        {/* Programs Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Programs
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Student distribution
              </p>
            </div>
            <Link
              to="/admin/dashboard/students"
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              Details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {analytics.programs.map((program) => {
              const maxCount = analytics.programs[0]?.count || 1;
              const percentage = Math.round(
                (program.count / analytics.totalStudents) * 100
              );
              return (
                <div key={program.name} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground truncate">
                      {program.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {program.count}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(program.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {analytics.programs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No programs yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Content Overview
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {contentItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
