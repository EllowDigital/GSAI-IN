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
} from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

export default function DashboardHome() {
  // Enhanced data query with advanced analytics
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
        // Skip advanced overview for now
        Promise.resolve({ data: null }),
        // Program analytics
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
        // Monthly enrollment trends
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
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Advanced analytics processing with professional algorithms
  const analytics = React.useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const totalStudents = data.students.length;
    const totalRevenue = data.fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
    const paidFees = data.fees.filter((f) => f.status === 'paid').length;
    const unpaidFees = data.fees.filter((f) => f.status === 'unpaid').length;

    // Advanced Revenue Analytics
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
        const target = totalStudents * 2000; // Assuming average fee target
        last12Months.push({
          month: monthKey,
          revenue,
          target,
          achievement: target > 0 ? (revenue / target) * 100 : 0,
        });
      }
      return last12Months;
    })();

    // Student Growth Analytics
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

        // Calculate cumulative total
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

    // Program Performance Analytics
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
              retention: 100, // Placeholder for retention rate
            };
          }
          acc[program].students += 1;
          acc[program].avgFee = student.default_monthly_fee || 2000;
          return acc;
        },
        {} as Record<string, any>
      );

      // Calculate revenue per program
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

    // Fee Collection Efficiency
    const collectionEfficiency = (() => {
      const totalExpected = data.students.length * 2000; // Assuming monthly fee
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

    // Content Performance
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

    // Performance Radar Data
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
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analytics) return null;

  const statCards = [
    {
      title: 'Total Students',
      value: analytics.totals.totalStudents,
      icon: Users,
      trend:
        analytics.growthAnalytics.length > 1
          ? `${(analytics.growthAnalytics[analytics.growthAnalytics.length - 1]?.growth || 0).toFixed(1)}%`
          : '+0%',
      positive:
        (analytics.growthAnalytics[analytics.growthAnalytics.length - 1]
          ?.growth || 0) >= 0,
      subtitle: 'Active learners',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totals.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: `${analytics.collectionEfficiency.efficiency.toFixed(1)}%`,
      positive: analytics.collectionEfficiency.efficiency >= 80,
      subtitle: 'Collection efficiency',
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
      subtitle: 'Payment success rate',
    },
    {
      title: 'Content Activity',
      value: analytics.contentStats.totalActivity,
      icon: Activity,
      trend:
        analytics.contentStats.totalActivity > 5
          ? 'High'
          : analytics.contentStats.totalActivity > 2
            ? 'Medium'
            : 'Low',
      positive: analytics.contentStats.totalActivity > 2,
      subtitle: 'Last 30 days',
    },
    {
      title: 'Blog Posts',
      value: analytics.totals.totalBlogs,
      icon: BookOpen,
      trend: `${analytics.contentStats.blogActivity} recent`,
      positive: analytics.contentStats.blogActivity > 0,
      subtitle: 'Knowledge sharing',
    },
    {
      title: 'Events',
      value: analytics.totals.totalEvents,
      icon: Calendar,
      trend: analytics.totals.totalEvents > 0 ? 'Active' : 'Plan needed',
      positive: analytics.totals.totalEvents > 0,
      subtitle: 'Engagement activities',
    },
    {
      title: 'Gallery',
      value: analytics.totals.totalGallery,
      icon: Image,
      trend: `${analytics.contentStats.galleryActivity} recent`,
      positive: analytics.contentStats.galleryActivity > 0,
      subtitle: 'Visual content',
    },
    {
      title: 'Outstanding',
      value: analytics.totals.unpaidFees,
      icon: Clock,
      trend: analytics.totals.unpaidFees === 0 ? 'All clear' : 'Follow up',
      positive: analytics.totals.unpaidFees === 0,
      subtitle: 'Pending payments',
    },
  ];

  return (
    <div className="w-full min-h-full p-2 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Executive Summary Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Executive Dashboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Real-time business intelligence & performance metrics
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analytics.collectionEfficiency.efficiency.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                ₹{analytics.totals.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {analytics.totals.totalStudents}
              </div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-primary/30 hover:border-l-primary"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                    stat.positive
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800'
                  }`}
                >
                  {stat.trend}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Analytics with Target Comparison */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Revenue Performance & Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'revenue'
                        ? `₹${value.toLocaleString()}`
                        : `₹${value.toLocaleString()}`,
                      name === 'revenue' ? 'Actual Revenue' : 'Target Revenue',
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.performanceRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} fontSize={8} />
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

        {/* Student Growth Analytics */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Student Growth & Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.growthAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis yAxisId="left" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" fontSize={11} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'enrollments'
                        ? `${value} new students`
                        : name === 'total'
                          ? `${value} total students`
                          : `${Number(value).toFixed(1)}% growth`,
                      name === 'enrollments'
                        ? 'New Enrollments'
                        : name === 'total'
                          ? 'Total Students'
                          : 'Growth Rate',
                    ]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="enrollments"
                    fill="hsl(var(--primary))"
                    opacity={0.7}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Program Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.programAnalytics.map((program, index) => (
                <div key={program.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{program.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {program.students} students
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((program.students / Math.max(...analytics.programAnalytics.map((p) => p.students))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg Fee: ₹{program.avgFee}</span>
                    <span>Revenue: ₹{program.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Quick Actions & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  title: 'Students',
                  icon: Users,
                  path: '/admin/dashboard/students',
                  color: 'blue',
                },
                {
                  title: 'Fees',
                  icon: DollarSign,
                  path: '/admin/dashboard/fees',
                  color: 'green',
                },
                {
                  title: 'Blogs',
                  icon: BookOpen,
                  path: '/admin/dashboard/blogs',
                  color: 'purple',
                },
                {
                  title: 'News',
                  icon: Newspaper,
                  path: '/admin/dashboard/news',
                  color: 'red',
                },
                {
                  title: 'Events',
                  icon: Calendar,
                  path: '/admin/dashboard/events',
                  color: 'orange',
                },
                {
                  title: 'Gallery',
                  icon: Image,
                  path: '/admin/dashboard/gallery',
                  color: 'pink',
                },
              ].map((action, index) => (
                <Link key={index} to={action.path}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30">
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mx-auto group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                        <action.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Collection Efficiency
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {analytics.collectionEfficiency.efficiency.toFixed(1)}% of
                  expected revenue collected
                </p>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Content Activity
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {analytics.contentStats.totalActivity} content pieces added
                  this month
                </p>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Top Program
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
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
    </div>
  );
}
