import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  FileText,
  CalendarPlus,
  ImagePlus,
  ArrowRight,
  Activity,
  MessageSquare,
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
} from 'recharts';

export default function DashboardHome() {
  useRealtime();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const [studentsRes, feesRes, blogsRes, newsRes, eventsRes, galleryRes] =
        await Promise.all([
          supabase
            .from('students')
            .select('id, program, join_date, default_monthly_fee, fee_status'),
          supabase
            .from('fees')
            .select('id, status, paid_amount, month, year, student_id'),
          supabase.from('blogs').select('id, created_at'),
          supabase.from('news').select('id, created_at, status'),
          supabase.from('events').select('id, date'),
          supabase.from('gallery_images').select('id'),
        ]);

      return {
        students: studentsRes.data || [],
        fees: feesRes.data || [],
        blogs: blogsRes.data || [],
        news: newsRes.data || [],
        events: eventsRes.data || [],
        gallery: galleryRes.data || [],
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

    // Revenue last 6 months
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
      });
      const revenue = data.fees
        .filter(
          (f) =>
            f.year === date.getFullYear() &&
            f.month === date.getMonth() + 1 &&
            f.status === 'paid'
        )
        .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
      revenueChart.push({ month: monthKey, revenue });
    }

    // Program distribution
    const programCounts: Record<string, number> = {};
    data.students.forEach((s) => {
      programCounts[s.program] = (programCounts[s.program] || 0) + 1;
    });

    return {
      totalStudents,
      totalRevenue,
      paidCount: paidFees.length,
      unpaidCount,
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
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Students',
      value: analytics.totalStudents,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Paid',
      value: analytics.paidCount,
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
      label: 'Unpaid',
      value: analytics.unpaidCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  const quickActions = [
    {
      title: 'Add Student',
      icon: UserPlus,
      path: '/admin/dashboard/students',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Record Fee',
      icon: CreditCard,
      path: '/admin/dashboard/fees',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'New Blog',
      icon: FileText,
      path: '/admin/dashboard/blogs',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Add Event',
      icon: CalendarPlus,
      path: '/admin/dashboard/events',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: 'Upload Photo',
      icon: ImagePlus,
      path: '/admin/dashboard/gallery',
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
    },
    {
      title: 'Post News',
      icon: Newspaper,
      path: '/admin/dashboard/news',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
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
    <div className="w-full min-h-full p-4 sm:p-5 lg:p-6 space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card p-4 sm:p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {stat.value}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.path}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-3 sm:p-4 hover:border-primary/30 hover:shadow-md transition-all text-center"
            >
              <div
                className={`p-2.5 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}
              >
                <action.icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-foreground leading-tight">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Revenue (6 months)
            </h3>
          </div>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
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
                />
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
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
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programs Breakdown */}
        <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Programs
          </h3>
          <div className="space-y-3">
            {analytics.programs.map((program) => {
              const maxCount = analytics.programs[0]?.count || 1;
              return (
                <div key={program.name} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {program.name}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {program.count}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(program.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {analytics.programs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No programs yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Content
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {contentItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:p-4 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-bold text-foreground">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.label}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
