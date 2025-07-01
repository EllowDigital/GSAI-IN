
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCards from '@/components/admin/dashboard/StatsCards';
import { BarChart3, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Card configurations with enhanced styling
const cardConfigs = [
  {
    key: 'fees',
    label: 'Total Fees',
    icon: BarChart3,
    color: 'from-blue-500 to-blue-600',
    table: 'fees' as const,
  },
  {
    key: 'students',
    label: 'Students',
    icon: Users,
    color: 'from-green-500 to-green-600',
    table: 'students' as const,
  },
  {
    key: 'blogs',
    label: 'Blog Posts',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    table: 'blogs' as const,
  },
  {
    key: 'news',
    label: 'News Articles',
    icon: Activity,
    color: 'from-orange-500 to-orange-600',
    table: 'news' as const,
  },
  {
    key: 'gallery',
    label: 'Gallery Items',
    icon: Activity,
    color: 'from-pink-500 to-pink-600',
    table: 'gallery_images' as const,
  },
  {
    key: 'events',
    label: 'Events',
    icon: Activity,
    color: 'from-indigo-500 to-indigo-600',
    table: 'events' as const,
  },
];

export default function StatsHome() {
  const { toast } = useToast();

  // Fetch counts for all tables
  const {
    data: counts,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const results: Record<string, number> = {};

      // Fetch counts for each table
      for (const config of cardConfigs) {
        try {
          const { count, error } = await supabase
            .from(config.table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            console.error(`Error fetching ${config.table}:`, error);
            results[config.key] = 0;
          } else {
            results[config.key] = count || 0;
          }
        } catch (err) {
          console.error(`Exception fetching ${config.table}:`, err);
          results[config.key] = 0;
        }
      }

      return results;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      toast({
        title: 'Refreshing Stats',
        description: 'Fetching the latest dashboard statistics...',
      });

      await refetch();

      toast({
        title: 'Success',
        description: 'Dashboard statistics updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh dashboard statistics. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate total items across all tables
  const totalItems = counts
    ? Object.values(counts).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
            Real-time insights into your platform's performance
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
        >
          <RefreshCw
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-500 ${
              isRefetching ? 'animate-spin' : 'hover:rotate-180'
            }`}
          />
          <span className="hidden xs:inline">
            {isRefetching ? 'Refreshing...' : 'Refresh Stats'}
          </span>
          <span className="xs:hidden">
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-3 sm:p-4">
            <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">
              Error loading dashboard statistics. Please try refreshing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Summary Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/30 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg md:text-xl text-slate-800 dark:text-white">
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="text-center p-2 sm:p-3">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? '...' : totalItems.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Total Items
              </p>
            </div>
            <div className="text-center p-2 sm:p-3">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                {isLoading ? '...' : (counts?.students || 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Active Students
              </p>
            </div>
            <div className="text-center p-2 sm:p-3">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {isLoading ? '...' : (counts?.events || 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Events
              </p>
            </div>
            <div className="text-center p-2 sm:p-3">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {isLoading ? '...' : (counts?.blogs || 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Content Items
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 dark:text-white">
          Detailed Statistics
        </h2>
        <StatsCards
          cardsConfig={cardConfigs}
          counts={counts}
          loading={isLoading}
        />
      </div>

      {/* Last Updated Info */}
      <div className="text-center py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleString()}
          {isRefetching && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              • Updating...
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
