import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatsCards from '@/components/admin/dashboard/StatsCards';
import FastStats from '@/pages/admin/dashboard/FastStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  Users,
  TrendingUp,
  Calendar,
  Star,
  DollarSign,
  BookOpen,
  Newspaper,
  Image,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function StatsHome() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [studentsRes, newsRes, blogsRes, feesRes] = await Promise.all([
        supabase.from('students').select('id, created_at, program'),
        supabase.from('news').select('id, created_at, status'),
        supabase.from('blogs').select('id, created_at'),
        supabase.from('fees').select('id, status, paid_amount, monthly_fee'),
      ]);

      return {
        students: studentsRes.data || [],
        news: newsRes.data || [],
        blogs: blogsRes.data || [],
        fees: feesRes.data || [],
      };
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Success',
        description: 'Dashboard refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh dashboard',
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalStudents = stats?.students?.length || 0;
  const totalNews = stats?.news?.length || 0;
  const totalBlogs = stats?.blogs?.length || 0;
  const totalRevenue =
    stats?.fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;

  // Recent activity (last 7 days)
  const recentStudents =
    stats?.students?.filter((s) => {
      const createdAt = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length || 0;

  return (
    <div className="w-full min-h-full p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Welcome to GSAI Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
              Manage your academy efficiently with our comprehensive admin tools
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Fast Stats */}
      <FastStats />

      {/* Main Stats */}
      <StatsCards
        cardsConfig={[
          {
            key: 'students',
            label: 'Total Students',
            icon: Users,
            color: 'from-blue-500 to-blue-600',
          },
          {
            key: 'fees',
            label: 'Total Fees',
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
          },
          {
            key: 'blogs',
            label: 'Blog Posts',
            icon: BookOpen,
            color: 'from-purple-500 to-purple-600',
          },
          {
            key: 'news',
            label: 'News Articles',
            icon: Newspaper,
            color: 'from-orange-500 to-orange-600',
          },
          {
            key: 'events',
            label: 'Events',
            icon: Calendar,
            color: 'from-red-500 to-red-600',
          },
          {
            key: 'gallery',
            label: 'Gallery Images',
            icon: Image,
            color: 'from-indigo-500 to-indigo-600',
          },
        ]}
        counts={{
          students: totalStudents,
          fees: stats?.fees?.length || 0,
          blogs: totalBlogs,
          news: totalNews,
          events: 0,
          gallery: 0,
        }}
        loading={isLoading}
      />

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Students */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/60 dark:border-blue-800/60 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 leading-tight">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 dark:text-blue-200">
              {totalStudents}
            </div>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
              +{recentStudents} this week
            </p>
          </CardContent>
        </Card>

        {/* News Articles */}
        <Card className="bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/60 dark:border-green-800/60 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 leading-tight">
              News Articles
            </CardTitle>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200">
              {totalNews}
            </div>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
              Published content
            </p>
          </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card className="bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/60 dark:border-purple-800/60 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300 leading-tight">
              Blog Posts
            </CardTitle>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800 dark:text-purple-200">
              {totalBlogs}
            </div>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
              Total articles
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/60 dark:border-amber-800/60 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 leading-tight">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-800 dark:text-amber-200">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
              Fees collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Manage Students
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add & update student records
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Manage Fees
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track payments & dues
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-purple-500/20 transition-colors">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Content
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Blogs, news & events
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-indigo-500/20 transition-colors">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Gallery
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage academy photos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
