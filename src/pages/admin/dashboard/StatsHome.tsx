
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatsCards from '@/components/admin/dashboard/StatsCards';
import AnalyticsChart from '@/components/admin/dashboard/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Target,
  Clock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function StatsHome() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading, refetch } = useQuery({
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
  const totalRevenue = stats?.fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;

  // Recent activity (last 7 days)
  const recentStudents = stats?.students?.filter(s => {
    const createdAt = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).length || 0;

  return (
    <div className="w-full min-h-full p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-900/20 dark:via-slate-800/50 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-100 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              Welcome to GSAI Dashboard
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Manage your academy efficiently with our comprehensive admin tools
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <StatsCards />

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {totalStudents}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              +{recentStudents} this week
            </p>
          </CardContent>
        </Card>

        {/* News Articles */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              News Articles
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {totalNews}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Published content
            </p>
          </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Blog Posts
            </CardTitle>
            <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {totalBlogs}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Total articles
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Fees collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">
              Achievements
            </h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              Track progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
            <h3 className="font-semibold text-rose-800 dark:text-rose-200">
              Goals
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Set targets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
            <h3 className="font-semibold text-teal-800 dark:text-teal-200">
              Schedule
            </h3>
            <p className="text-sm text-teal-600 dark:text-teal-400">
              Manage time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">
              Community
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Connect users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
