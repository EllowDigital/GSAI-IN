
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
} from 'lucide-react';

import StatsCards from '@/components/admin/dashboard/StatsCards';
import AnalyticsChart from '@/components/admin/dashboard/AnalyticsChart';
import AdvancedPanel from '@/components/admin/dashboard/AdvancedPanel';

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
    color: 'from-green-100 to-green-200/80 text-green-800 border-green-200',
    table: 'fees',
  },
  {
    key: 'students',
    label: 'Students',
    icon: Users,
    color: 'from-yellow-100 to-yellow-200/80 text-yellow-800 border-yellow-200',
    table: 'students',
  },
  {
    key: 'blogs',
    label: 'Blogs',
    icon: BookOpen,
    color: 'from-blue-100 to-blue-200/80 text-blue-800 border-blue-200',
    table: 'blogs',
  },
  {
    key: 'news',
    label: 'News',
    icon: Newspaper,
    color: 'from-orange-100 to-orange-200/80 text-orange-800 border-orange-200',
    table: 'news',
  },
  {
    key: 'gallery',
    label: 'Gallery Images',
    icon: GalleryIcon,
    color: 'from-pink-100 to-pink-200/80 text-pink-800 border-pink-200',
    table: 'gallery_images',
  },
  {
    key: 'events',
    label: 'Events',
    icon: Calendar,
    color: 'from-purple-100 to-purple-200/80 text-purple-800 border-purple-200',
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

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-4 md:py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-yellow-600 drop-shadow">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 font-medium">
          Admin panel analytics and quick stats.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        cardsConfig={cardsConfig}
        counts={counts}
        loading={isLoadingCounts}
      />

      {/* Charts & Advanced Panel */}
      <div className="mt-8 md:mt-10 grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
        <div className="xl:col-span-3">
          <AnalyticsChart analyticsData={analyticsData} />
        </div>
        <div className="xl:col-span-2">
          <AdvancedPanel />
        </div>
      </div>
    </div>
  );
}
