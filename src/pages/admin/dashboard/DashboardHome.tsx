import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';
import {
  Users,
  DollarSign,
  BookOpen,
  Newspaper,
  Calendar,
  Image,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
  Trophy,
  Target,
  Zap,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Plus,
  ArrowRight,
  Sparkles,
  CreditCard,
  UserPlus,
  FileText,
  ImagePlus,
  CalendarPlus,
} from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import DashboardNotifications from '@/components/admin/DashboardNotifications';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

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
        overviewRes,
        programStatsRes,
        monthlyEnrollmentRes,
      ] = await Promise.all([
        supabase
          .from('students')
          .select(
            'id, program, join_date, created_at, default_monthly_fee, fee_status'
          )
          .order('created_at', { ascending: false }),
        supabase
          .from('fees')
          .select(
            'id, status, paid_amount, monthly_fee, month, year, created_at, student_id'
          )
          .order('created_at', { ascending: false }),
        supabase
          .from('blogs')
          .select('id, created_at, title')
          .order('created_at', { ascending: false }),
        supabase
          .from('news')
          .select('id, created_at, status, title')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, date, title')
          .order('date', { ascending: false }),
        supabase
          .from('gallery_images')
          .select('id, created_at, tag')
          .order('created_at', { ascending: false }),
        Promise.resolve({ data: null }),
        supabase
          .from('students')
          .select('program')
          .then((res) => {
            const programs = res.data || [];
            const programCounts = programs.reduce(
              (acc, student) => {
                acc[student.program] = (acc[student.program] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>
            );
            return Object.entries(programCounts).map(([name, value]) => ({
              name,
              value,
              percentage: 0,
            }));
          }),
        supabase
          .from('students')
          .select('join_date')
          .gte(
            'join_date',
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          ),
      ]);

      return {
        students: studentsRes.data || [],
        fees: feesRes.data || [],
        blogs: blogsRes.data || [],
        news: newsRes.data || [],
        events: eventsRes.data || [],
        gallery: galleryRes.data || [],
        overview: overviewRes.data || null,
        programStats: programStatsRes || [],
        monthlyEnrollments: monthlyEnrollmentRes.data || [],
      };
    },
    refetchInterval: 30000,
  });

  const analytics = React.useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const totalStudents = data.students.length;
    const totalRevenue = data.fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
    const paidFees = data.fees.filter((f) => f.status === 'paid').length;
    const unpaidFees = data.fees.filter((f) => f.status === 'unpaid').length;

    const revenueAnalytics = (() => {
      const last12Months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        const revenue = data.fees
          .filter(
            (f) =>
              f.year === date.getFullYear() &&
              f.month === date.getMonth() + 1 &&
              f.status === 'paid'
          )
          .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
        const target = totalStudents * 2000;
        last12Months.push({
          month: monthKey,
          revenue,
          target,
          achievement: target > 0 ? (revenue / target) * 100 : 0,
        });
      }
      return last12Months;
    })();

    const growthAnalytics = (() => {
      const last12Months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const enrollments = data.students.filter((s) => {
          const joinDate = new Date(s.join_date || s.created_at);
          return (
            joinDate.getMonth() === date.getMonth() &&
            joinDate.getFullYear() === date.getFullYear()
          );
        }).length;

        const cumulativeTotal = data.students.filter((s) => {
          const joinDate = new Date(s.join_date || s.created_at);
          return joinDate <= date;
        }).length;

        last12Months.push({
          month: monthKey,
          enrollments,
          total: cumulativeTotal,
          growth:
            i === 11
              ? 0
              : (enrollments /
                  Math.max(
                    last12Months[last12Months.length - 1]?.enrollments || 1,
                    1
                  ) -
                  1) *
                100,
        });
      }
      return last12Months;
    })();

    const programAnalytics = (() => {
      const programStats = data.students.reduce(
        (acc, student) => {
          const program = student.program || 'General';
          if (!acc[program]) {
            acc[program] = {
              name: program,
              students: 0,
              revenue: 0,
              avgFee: 0,
              retention: 100,
            };
          }
          acc[program].students += 1;
          acc[program].avgFee = student.default_monthly_fee || 2000;
          return acc;
        },
        {} as Record<string, any>
      );

      Object.values(programStats).forEach((program: any) => {
        program.revenue = data.fees
          .filter((f) => f.status === 'paid')
          .reduce((sum, f) => {
            const student = data.students.find((s) => s.id === f.student_id);
            return student?.program === program.name
              ? sum + f.paid_amount
              : sum;
          }, 0);
        program.efficiency = program.revenue / Math.max(program.students, 1);
      });

      return Object.values(programStats);
    })();

    const collectionEfficiency = (() => {
      const totalExpected = data.students.length * 2000;
      const totalCollected = totalRevenue;
      const efficiency =
        totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
      return {
        efficiency,
        collected: totalCollected,
        expected: totalExpected,
        pending: totalExpected - totalCollected,
      };
    })();

    const contentStats = (() => {
      const recentBlogs = data.blogs.filter(
        (b) =>
          new Date(b.created_at) >=
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      const recentNews = data.news.filter(
        (n) =>
          new Date(n.created_at) >=
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      const recentGallery = data.gallery.filter(
        (g) =>
          new Date(g.created_at) >=
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      return {
        blogActivity: recentBlogs,
        newsActivity: recentNews,
        galleryActivity: recentGallery,
        totalActivity: recentBlogs + recentNews + recentGallery,
      };
    })();

    const performanceRadar = [
      {
        subject: 'Revenue',
        A: Math.min((totalRevenue / 10000) * 100, 100),
        fullMark: 100,
      },
      {
        subject: 'Students',
        A: Math.min((totalStudents / 50) * 100, 100),
        fullMark: 100,
      },
      {
        subject: 'Content',
        A: Math.min((contentStats.totalActivity / 10) * 100, 100),
        fullMark: 100,
      },
      {
        subject: 'Collections',
        A: collectionEfficiency.efficiency,
        fullMark: 100,
      },
      {
        subject: 'Growth',
        A: Math.min(((totalStudents - 1) / 10) * 100, 100),
        fullMark: 100,
      },
      {
        subject: 'Events',
        A: Math.min((data.events.length / 5) * 100, 100),
        fullMark: 100,
      },
    ];

    return {
      totals: {
        totalStudents,
        totalRevenue,
        paidFees,
        unpaidFees,
        totalBlogs: data.blogs.length,
        totalNews: data.news.length,
        totalEvents: data.events.length,
        totalGallery: data.gallery.length,
      },
      revenueAnalytics,
      growthAnalytics,
      programAnalytics,
      collectionEfficiency,
      contentStats,
      performanceRadar,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  // Quick Actions Data
  const quickActions = [
    {
      title: 'Add Student',
      icon: UserPlus,
      path: '/admin/dashboard/students',
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Record Fee',
      icon: CreditCard,
      path: '/admin/dashboard/fees',
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'New Blog',
      icon: FileText,
      path: '/admin/dashboard/blogs',
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Add Event',
      icon: CalendarPlus,
      path: '/admin/dashboard/events',
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Upload Image',
      icon: ImagePlus,
      path: '/admin/dashboard/gallery',
      color: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      title: 'Post News',
      icon: Newspaper,
      path: '/admin/dashboard/news',
      color: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const statCards = [
    {
      title: 'Total Students',
      value: analytics.totals.totalStudents,
      icon: Users,
      trend: `${(analytics.growthAnalytics[analytics.growthAnalytics.length - 1]?.growth || 0).toFixed(1)}%`,
      positive:
        (analytics.growthAnalytics[analytics.growthAnalytics.length - 1]
          ?.growth || 0) >= 0,
      subtitle: 'Active learners',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totals.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: `${analytics.collectionEfficiency.efficiency.toFixed(1)}%`,
      positive: analytics.collectionEfficiency.efficiency >= 80,
      subtitle: 'Collection rate',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Paid Fees',
      value: analytics.totals.paidFees,
      icon: TrendingUp,
      trend:
        analytics.totals.unpaidFees === 0
          ? '100%'
          : `${((analytics.totals.paidFees / (analytics.totals.paidFees + analytics.totals.unpaidFees)) * 100).toFixed(1)}%`,
      positive: analytics.totals.paidFees > analytics.totals.unpaidFees,
      subtitle: 'Payment success',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Outstanding',
      value: analytics.totals.unpaidFees,
      icon: Clock,
      trend: analytics.totals.unpaidFees === 0 ? 'All clear' : 'Follow up',
      positive: analytics.totals.unpaidFees === 0,
      subtitle: 'Pending payments',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  const contentCards = [
    {
      title: 'Blog Posts',
      value: analytics.totals.totalBlogs,
      icon: BookOpen,
      recent: analytics.contentStats.blogActivity,
      path: '/admin/dashboard/blogs',
      color: 'purple',
    },
    {
      title: 'Events',
      value: analytics.totals.totalEvents,
      icon: Calendar,
      recent: 0,
      path: '/admin/dashboard/events',
      color: 'orange',
    },
    {
      title: 'Gallery',
      value: analytics.totals.totalGallery,
      icon: Image,
      recent: analytics.contentStats.galleryActivity,
      path: '/admin/dashboard/gallery',
      color: 'pink',
    },
    {
      title: 'News',
      value: analytics.totals.totalNews,
      icon: Newspaper,
      recent: analytics.contentStats.newsActivity,
      path: '/admin/dashboard/news',
      color: 'red',
    },
  ];

  return (
    <div className="w-full min-h-full p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                  Welcome Back, Admin
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-slate-300">
                  Here's what's happening with your academy today
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex-1 sm:flex-none text-center sm:text-right px-3 sm:px-4 py-2 sm:py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                {analytics.collectionEfficiency.efficiency.toFixed(0)}%
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                Performance
              </div>
            </div>
            <div className="flex-1 sm:flex-none text-center sm:text-right px-3 sm:px-4 py-2 sm:py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-400">
                ₹{(analytics.totals.totalRevenue / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                Revenue
              </div>
            </div>
            <div className="flex-1 sm:flex-none text-center sm:text-right px-3 sm:px-4 py-2 sm:py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">
                {analytics.totals.totalStudents}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400">
                Students
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Notifications */}
      <DashboardNotifications />

      {/* Quick Actions Grid */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path} className="group">
              <div
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${action.bgLight} p-3 sm:p-4 border border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h3
                  className={`font-semibold text-xs sm:text-sm ${action.textColor}`}
                >
                  {action.title}
                </h3>
                <ArrowRight
                  className={`absolute bottom-3 right-3 w-3 h-3 sm:w-4 sm:h-4 ${action.textColor} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/50 p-3 sm:p-4 lg:p-5 hover:shadow-xl transition-all duration-300 hover:border-primary/30"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div
                  className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div
                  className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full border ${
                    stat.positive
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
                      : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
                  }`}
                >
                  {stat.trend}
                </div>
              </div>

              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {stat.title}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {contentCards.map((card, index) => (
          <Link key={index} to={card.path} className="group">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {card.recent > 0 && (
                    <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                      +{card.recent} new
                    </span>
                  )}
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {card.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              Revenue Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.revenueAnalytics}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={10} tick={{ fontSize: 9 }} />
                  <YAxis fontSize={10} tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    formatter={(value, name) => [
                      name === 'revenue'
                        ? `₹${Number(value).toLocaleString()}`
                        : `₹${Number(value).toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' : 'Target',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Performance Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.performanceRadar}>
                  <PolarGrid className="opacity-50" />
                  <PolarAngleAxis
                    dataKey="subject"
                    fontSize={9}
                    tick={{ fontSize: 8 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    fontSize={8}
                    tick={{ fontSize: 7 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      'Performance',
                    ]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Growth */}
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Student Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6">
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.growthAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={10} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" fontSize={10} tick={{ fontSize: 9 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={10}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    formatter={(value, name) => [
                      name === 'enrollments'
                        ? `${value} new`
                        : `${value} total`,
                      name === 'enrollments' ? 'New' : 'Total',
                    ]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="enrollments"
                    fill="hsl(var(--primary))"
                    opacity={0.7}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Analytics */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4">
            <div className="space-y-3 sm:space-y-4">
              {analytics.programAnalytics.map((program, index) => (
                <div key={program.name} className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {program.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {program.students} students
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/70 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((program.students / Math.max(...analytics.programAnalytics.map((p) => p.students))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span>Avg: ₹{program.avgFee}</span>
                    <span>₹{program.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  Collection Efficiency
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300">
                {analytics.collectionEfficiency.efficiency.toFixed(1)}% of
                expected revenue collected this period
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Content Activity
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">
                {analytics.contentStats.totalActivity} content pieces added in
                the last 30 days
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-200">
                  Top Program
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-300">
                {analytics.programAnalytics.length > 0
                  ? analytics.programAnalytics[0].name
                  : 'No programs'}{' '}
                leads with{' '}
                {analytics.programAnalytics.length > 0
                  ? analytics.programAnalytics[0].students
                  : 0}{' '}
                students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
