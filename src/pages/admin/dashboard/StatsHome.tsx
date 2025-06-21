
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
} from 'lucide-react';

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

const fetchDashboardCounts = async () => {
  const countPromises = cardsConfig.map(async ({ key, table }) => {
    const { count, error } = await supabase
      .from(table as any)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error(`Error fetching count for ${table}:`, error.message);
    }

    return [key, count ?? 0] as const;
  });

  const results = await Promise.all(countPromises);
  return Object.fromEntries(results);
};

export default function StatsHome() {
  const queryClient = useQueryClient();

  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['dashboardCounts'],
    queryFn: fetchDashboardCounts,
  });

  useEffect(() => {
    const channels = cardsConfig.map(({ table }) =>
      supabase
        .channel(`public:${table}:dashboard`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
        })
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const analyticsData = cardsConfig.map(({ key, label }) => ({
    name: label,
    count: counts?.[key] ?? 0,
  }));

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboardCounts'] });
      await queryClient.refetchQueries({ queryKey: ['dashboardCounts'] });
      toast({
        title: "Success",
        description: "Dashboard refreshed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard",
        variant: "error"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300/50">
              <Activity className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-slate-600 font-medium">
                Real-time analytics and system insights
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Live Data</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <RefreshButton 
            onRefresh={handleRefresh}
            isLoading={isLoadingCounts}
            size="default"
          />
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <StatsCards
        cardsConfig={cardsConfig}
        counts={counts}
        loading={isLoadingCounts}
      />

      {/* Enhanced Charts & Advanced Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Analytics Overview</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Current Period</span>
              </div>
            </div>
            <AnalyticsChart analyticsData={analyticsData} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">System Tools</h2>
              <p className="text-sm text-slate-600 mt-1">Quick access and utilities</p>
            </div>
            <AdvancedPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
