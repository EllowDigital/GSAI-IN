
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BadgeDollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  Database,
} from 'lucide-react';
import { motion } from 'framer-motion';

import StatsCards from '@/components/admin/dashboard/StatsCards';
import AnalyticsChart from '@/components/admin/dashboard/AnalyticsChart';
import AdvancedPanel from '@/components/admin/dashboard/AdvancedPanel';
import RefreshButton from '@/components/admin/RefreshButton';
import { toast } from '@/hooks/use-toast';

type CardConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  table: string;
};

const cardsConfig: CardConfig[] = [
  {
    key: 'fees',
    label: 'Fee Records',
    icon: BadgeDollarSign,
    color: 'from-emerald-500 to-green-600',
    table: 'fees',
  },
  {
    key: 'students',
    label: 'Students',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    table: 'students',
  },
  {
    key: 'blogs',
    label: 'Blogs',
    icon: BookOpen,
    color: 'from-purple-500 to-violet-600',
    table: 'blogs',
  },
  {
    key: 'news',
    label: 'News',
    icon: Newspaper,
    color: 'from-orange-500 to-red-600',
    table: 'news',
  },
  {
    key: 'gallery',
    label: 'Gallery Images',
    icon: GalleryIcon,
    color: 'from-pink-500 to-rose-600',
    table: 'gallery_images',
  },
  {
    key: 'events',
    label: 'Events',
    icon: Calendar,
    color: 'from-cyan-500 to-teal-600',
    table: 'events',
  },
];

// Enhanced fetch function with better error handling
const fetchDashboardCounts = async () => {
  const countPromises = cardsConfig.map(async ({ key, table }) => {
    try {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`Error fetching count for ${table}:`, error.message);
        return [key, 0] as const;
      }

      return [key, count ?? 0] as const;
    } catch (error) {
      console.error(`Exception fetching count for ${table}:`, error);
      return [key, 0] as const;
    }
  });

  const results = await Promise.all(countPromises);
  return Object.fromEntries(results);
};

const StatsHome: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: counts, isLoading: isLoadingCounts, error, refetch } = useQuery({
    queryKey: ['dashboardCounts'],
    queryFn: fetchDashboardCounts,
    staleTime: 60 * 1000, // 1 minute cache
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced real-time updates with error handling
  useEffect(() => {
    const channels = cardsConfig.map(({ table }) => {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`Real-time update for ${table}:`, payload);
            queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to real-time updates for ${table}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Error subscribing to real-time updates for ${table}`);
          }
        });

      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
      await refetch();
      
      toast({
        title: 'Dashboard Refreshed',
        description: 'All statistics have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh dashboard data. Please check your connection.',
        variant: 'destructive',
      });
    }
  };

  const analyticsData = cardsConfig.map(({ key, label }) => ({
    name: label,
    count: counts?.[key] ?? 0,
  }));

  const totalRecords = Object.values(counts ?? {}).reduce((sum, count) => sum + count, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Responsive Header Section */}
      <motion.div 
        className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 gap-2 sm:gap-4"
        variants={itemVariants}
      >
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-200 border border-blue-200/60 shadow-sm">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-300">
                Dashboard Overview
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Real-time analytics and system insights
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Database className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {totalRecords.toLocaleString()} Total Records
              </span>
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  Connection Issue
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Responsive Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
              Live Data
            </span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse shadow-sm" />
          </div>
          
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={isLoadingCounts}
            size="default"
            className="shadow-sm"
          />
        </div>
      </motion.div>

      {/* Enhanced Responsive Stats Cards */}
      <motion.div variants={itemVariants}>
        <StatsCards
          cardsConfig={cardsConfig}
          counts={counts}
          loading={isLoadingCounts}
        />
      </motion.div>

      {/* Enhanced Responsive Charts & Panel */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        variants={itemVariants}
      >
        {/* Analytics Chart */}
        <div className="lg:col-span-2 xl:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                  Analytics Overview
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Current period statistics
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Growth Trends</span>
              </div>
            </div>
            <AnalyticsChart analyticsData={analyticsData} />
          </div>
        </div>

        {/* Advanced Panel */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                System Tools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Quick access and utilities
              </p>
            </div>
            <AdvancedPanel />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsHome;
