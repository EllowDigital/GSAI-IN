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
} from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

export default function DashboardHome() {
  // Consolidated data query
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const [studentsRes, feesRes, blogsRes, newsRes, eventsRes, galleryRes] =
        await Promise.all([
          supabase
            .from('students')
            .select('id, program, join_date, created_at'),
          supabase
            .from('fees')
            .select('id, status, paid_amount, monthly_fee, month, year'),
          supabase.from('blogs').select('id, created_at'),
          supabase.from('news').select('id, created_at, status'),
          supabase.from('events').select('id, date'),
          supabase.from('gallery_images').select('id, created_at'),
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
  });

  // Process data for analytics
  const analytics = React.useMemo(() => {
    if (!data) return null;

    // Calculate totals
    const totalStudents = data.students.length;
    const totalRevenue = data.fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
    const paidFees = data.fees.filter((f) => f.status === 'paid').length;
    const unpaidFees = data.fees.filter((f) => f.status === 'unpaid').length;

    // Monthly enrollments (last 6 months)
    const monthlyEnrollments = (() => {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        const count = data.students.filter((s) => {
          const joinDate = new Date(s.join_date || s.created_at);
          return (
            joinDate.getMonth() === date.getMonth() &&
            joinDate.getFullYear() === date.getFullYear()
          );
        }).length;
        months.push({ month: monthKey, students: count });
      }
      return months;
    })();

    // Program distribution
    const programStats = data.students.reduce(
      (acc, student) => {
        const program = student.program || 'Unknown';
        acc[program] = (acc[program] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const programData = Object.entries(programStats).map(([name, value]) => ({
      name,
      value,
    }));

    // Monthly revenue (last 6 months)
    const monthlyRevenue = (() => {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const revenue = data.fees
          .filter((f) => {
            return (
              f.year === date.getFullYear() &&
              f.month === date.getMonth() + 1 &&
              f.status === 'paid'
            );
          })
          .reduce((sum, f) => sum + (f.paid_amount || 0), 0);
        months.push({ month: monthKey, revenue });
      }
      return months;
    })();

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
      monthlyEnrollments,
      programData,
      monthlyRevenue,
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
      trend: '+12%',
      positive: true,
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totals.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+8%',
      positive: true,
    },
    {
      title: 'Paid Fees',
      value: analytics.totals.paidFees,
      icon: TrendingUp,
      trend: '+15%',
      positive: true,
    },
    {
      title: 'Blog Posts',
      value: analytics.totals.totalBlogs,
      icon: BookOpen,
      trend: '+5%',
      positive: true,
    },
    {
      title: 'News Articles',
      value: analytics.totals.totalNews,
      icon: Newspaper,
      trend: '+3%',
      positive: true,
    },
    {
      title: 'Events',
      value: analytics.totals.totalEvents,
      icon: Calendar,
      trend: '+20%',
      positive: true,
    },
    {
      title: 'Gallery Images',
      value: analytics.totals.totalGallery,
      icon: Image,
      trend: '+10%',
      positive: true,
    },
    {
      title: 'Unpaid Fees',
      value: analytics.totals.unpaidFees,
      icon: TrendingDown,
      trend: '-5%',
      positive: false,
    },
  ];

  return (
    <div className="w-full min-h-full p-2 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 rounded-xl p-4 sm:p-6 lg:p-8 border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">
              Dashboard Analytics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Comprehensive insights and real-time statistics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-center justify-between">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.positive
                      ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
                      : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
                  }`}
                >
                  {stat.trend}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                {stat.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Enrollments */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyEnrollments}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
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
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.programData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.programData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value: any) => [
                      `₹${value.toLocaleString()}`,
                      'Revenue',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: 'hsl(var(--primary))',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions Box */}
      <Card className="p-4 sm:p-6 bg-background border rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {[
            {
              title: 'Students',
              icon: Users,
              path: '/admin/dashboard/students',
            },
            { title: 'Fees', icon: DollarSign, path: '/admin/dashboard/fees' },
            { title: 'Blogs', icon: BookOpen, path: '/admin/dashboard/blogs' },
            { title: 'News', icon: Newspaper, path: '/admin/dashboard/news' },
            {
              title: 'Events',
              icon: Calendar,
              path: '/admin/dashboard/events',
            },
            { title: 'Gallery', icon: Image, path: '/admin/dashboard/gallery' },
          ].map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-3 sm:p-4 text-center space-y-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                      {action.title}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
